const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const identityService = require('./identityService');

/**
 * Servicio de autenticación
 */
class AuthService {
  /**
   * Construir nombre visible del usuario
   */
  buildDisplayName(user) {
    if (!user) {
      return null;
    }

    const fullName = [user.firstName, user.lastName1, user.lastName2]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (fullName) {
      return fullName;
    }

    return null;
  }

  /**
   * Obtener identificador visible consistente
   */
  getVisibleIdentifier(user) {
    const displayName = this.buildDisplayName(user);

    if (user && user.username) {
      return user.username;
    }

    if (displayName) {
      return displayName;
    }

    if (user && user.email) {
      return user.email.split('@')[0];
    }

    return `google.${String((user && user._id) || Date.now()).slice(-8)}`;
  }

  /**
   * Construir objeto público del usuario para frontend
   */
  buildPublicUser(user) {
    const visibleIdentifier = this.getVisibleIdentifier(user);

    return {
      id: user._id,
      username: user.username || visibleIdentifier || null,
      name: this.buildDisplayName(user),
      email: user.email || null,
    };
  }

  /**
   * Normalizar texto para usar como username base
   */
  normalizeUsernameBase(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9._-]+/g, '.')
      .replace(/[.\-_]{2,}/g, '.')
      .replace(/^\W+|\W+$/g, '')
      .replace(/\.+/g, '.')
      .slice(0, 30);
  }

  /**
   * Generar un username único para usuarios Google
   */
  async generateUniqueGoogleUsername(profile = {}) {
    const candidates = [];

    if (profile.displayName) {
      candidates.push(profile.displayName);
    }

    if (profile.name && (profile.name.givenName || profile.name.familyName)) {
      candidates.push(`${profile.name.givenName || ''}.${profile.name.familyName || ''}`);
    }

    if (profile.emails && profile.emails[0] && profile.emails[0].value) {
      candidates.push(profile.emails[0].value.split('@')[0]);
    }

    candidates.push(`google.${profile.id || Date.now()}`);

    for (const candidate of candidates) {
      const base = this.normalizeUsernameBase(candidate);

      if (!base || base.length < 3) {
        continue;
      }

      const existing = await User.findOne({ username: base }).lean();

      if (!existing) {
        return base;
      }

      for (let index = 1; index <= 50; index += 1) {
        const nextCandidate = `${base}${index}`;
        const nextExisting = await User.findOne({ username: nextCandidate }).lean();

        if (!nextExisting) {
          return nextCandidate;
        }
      }
    }

    const fallbackBase = `google.${Date.now()}`;
    return fallbackBase.slice(0, 30);
  }

  /**
   * Resolver username único para entrada manual
   */
  async resolveUniqueUsername(preferredUsername, excludeUserId = null) {
    const base = this.normalizeUsernameBase(preferredUsername);

    if (!base || base.length < 3) {
      const error = new Error('El nombre de usuario debe tener al menos 3 caracteres válidos.');
      error.statusCode = 400;
      throw error;
    }

    const query = { username: base };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }

    const existing = await User.findOne(query).lean();

    if (!existing) {
      return base;
    }

    for (let index = 1; index <= 100; index += 1) {
      const candidate = `${base}${index}`.slice(0, 30);
      const nextQuery = { username: candidate };
      if (excludeUserId) {
        nextQuery._id = { $ne: excludeUserId };
      }

      const nextExisting = await User.findOne(nextQuery).lean();
      if (!nextExisting) {
        return candidate;
      }
    }

    const fallback = `${base}${Date.now()}`.slice(0, 30);
    return fallback;
  }

  /**
   * Generar token JWT final de autenticación
   */
  generateAuthToken(user) {
    const publicUser = this.buildPublicUser(user);
    const visibleIdentifier = this.getVisibleIdentifier(user);

    return jwt.sign({
      id: user._id,
      userId: user._id,
      sub: String(user._id),
      username: publicUser.username || visibleIdentifier || null,
      email: publicUser.email || null,
      name: publicUser.name || visibleIdentifier || null,
    }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Generar token temporal para completar registro de Google
   */
  generateGoogleTempToken(user) {
    const visibleIdentifier = this.getVisibleIdentifier(user);

    return jwt.sign(
      {
        userId: user._id,
        sub: String(user._id),
        provider: 'google',
        purpose: 'complete-registration',
        flow: 'google-complete-registration',
        email: user.email || null,
        name: this.buildDisplayName(user) || visibleIdentifier || null,
      },
      config.jwt.tempSecret || config.jwt.secret,
      {
        expiresIn: config.jwt.tempExpiresIn,
      }
    );
  }

  /**
   * Verificar token temporal para completar registro de Google
   */
  verifyGoogleTempToken(token) {
    const payload = jwt.verify(token, config.jwt.tempSecret || config.jwt.secret);
    const isPurposeValid = payload.purpose === 'complete-registration' || payload.purpose === 'google-complete-registration';
    const isFlowValid = !payload.flow || payload.flow === 'google-complete-registration';

    if (payload.provider !== 'google' || !isPurposeValid || !isFlowValid) {
      const error = new Error('Token temporal inválido para completar registro con Google.');
      error.statusCode = 401;
      throw error;
    }

    return payload;
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    const { username, email, password, phone, cedula } = userData;

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCedula = cedula.trim().replace(/[-\s]/g, '');

    // Validar duplicados de username, email o cédula antes de registrar
    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }, { cedula: normalizedCedula }],
    }).lean();

    if (existingUser) {
      if (existingUser.cedula === normalizedCedula) {
        const error = new Error('Ya existe un usuario registrado con esa cédula');
        error.statusCode = 400;
        throw error;
      }

      if (existingUser.email === normalizedEmail) {
        const error = new Error('Ya existe un usuario registrado con ese correo electrónico.');
        error.statusCode = 400;
        throw error;
      }

      if (existingUser.username === normalizedUsername) {
        const error = new Error('Ya existe un usuario registrado con ese nombre de usuario.');
        error.statusCode = 400;
        throw error;
      }
    }

    // Validar identidad contra padrón electoral
    const identityValidation = await identityService.validateIdentity(normalizedCedula);

    if (!identityValidation.valid) {
      const error = new Error(identityValidation.message);
      error.statusCode = 400;
      throw error;
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      const error = new Error('La contraseña debe tener al menos 6 caracteres.');
      error.statusCode = 400;
      throw error;
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await User.create({
      cedula: identityValidation.cedula,
      firstName: identityValidation.firstName,
      lastName1: identityValidation.lastName1,
      lastName2: identityValidation.lastName2,
      username: normalizedUsername,
      email: normalizedEmail,
      phone,
      passwordHash,
      provider: 'local',
      isRegistrationComplete: true,
    });

    // Generar token JWT tras registro exitoso
    const token = this.generateAuthToken(user);

    return {
      message: 'Usuario registrado exitosamente',
      user: {
        ...user.toJSON(),
        id: user._id,
        name: this.buildDisplayName(user),
      },
      token,
    };
  }

  /**
   * Iniciar sesión
   */
  async login(identifier, password) {
    const normalizedIdentifier = identifier.trim();
    const normalizedEmail = normalizedIdentifier.toLowerCase();

    // Buscar usuario por username o email, tolerando mayúsculas en email
    const user = await User.findOne({
      $or: [
        { username: normalizedIdentifier },
        { email: normalizedEmail },
        { email: normalizedIdentifier },
      ],
    });

    if (!user) {
      const error = new Error('Credenciales inválidas.');
      error.statusCode = 401;
      throw error;
    }

    if (user.provider === 'google') {
      const error = new Error('Esta cuenta fue registrada con Google. Usa inicio de sesión con Google.');
      error.statusCode = 401;
      throw error;
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      const error = new Error('Credenciales inválidas.');
      error.statusCode = 401;
      throw error;
    }

    // Generar token JWT
    const token = this.generateAuthToken(user);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: this.buildDisplayName(user),
        phone: user.phone,
      },
    };
  }

  /**
   * Gestionar autenticación con Google (crear o recuperar usuario)
   */
  async handleGoogleOAuthProfile(profile) {
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    const googleId = profile.id;

    if (!email) {
      const error = new Error('No fue posible obtener el correo electrónico de la cuenta de Google.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const usernameCandidate = await this.generateUniqueGoogleUsername(profile);

    // Priorizar búsqueda por googleId
    let user = await User.findOne({ provider: 'google', googleId });

    if (!user) {
      const userByEmail = await User.findOne({
        email: normalizedEmail,
      });

      // Evitar mezclar cuentas local y Google
      if (userByEmail && userByEmail.provider !== 'google') {
        const error = new Error('Ya existe una cuenta registrada con ese correo electrónico');
        error.statusCode = 400;
        throw error;
      }

      // Caso excepcional: cuenta Google existente por email sin googleId asociado
      if (userByEmail && userByEmail.provider === 'google') {
        userByEmail.googleId = googleId;
        if (!userByEmail.username) {
          userByEmail.username = usernameCandidate;
        }
        user = await userByEmail.save();
      }
    }

    if (!user) {
      user = await User.create({
        username: usernameCandidate,
        email: normalizedEmail,
        googleId,
        provider: 'google',
        isRegistrationComplete: false,
      });
    }

    return {
      user,
      requiresCedula: !user.isRegistrationComplete,
    };
  }

  /**
   * Completar registro de usuario Google con cédula
   */
  async completeGoogleRegistration(userId, cedula, preferredUsername) {
    const normalizedCedula = (cedula || '').trim().replace(/[-\s]/g, '');

    if (!normalizedCedula) {
      const error = new Error('La cédula es requerida para completar el registro.');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ _id: userId, provider: 'google' });

    if (!user) {
      const error = new Error('Usuario de Google no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    if (user.isRegistrationComplete) {
      const error = new Error('El registro de Google ya está completo.');
      error.statusCode = 400;
      throw error;
    }

    const existingCedula = await User.findOne({
      cedula: normalizedCedula,
      _id: { $ne: user._id },
    }).lean();

    if (existingCedula) {
      const error = new Error('Ya existe un usuario registrado con esa cédula');
      error.statusCode = 400;
      throw error;
    }

    const identityValidation = await identityService.validateIdentity(normalizedCedula);

    if (!identityValidation.valid) {
      const error = new Error(identityValidation.message);
      error.statusCode = 400;
      throw error;
    }

    user.cedula = identityValidation.cedula;
    user.firstName = identityValidation.firstName;
    user.lastName1 = identityValidation.lastName1;
    user.lastName2 = identityValidation.lastName2;

    if (typeof preferredUsername === 'string' && preferredUsername.trim()) {
      user.username = await this.resolveUniqueUsername(preferredUsername, user._id);
    } else if (!user.username) {
      user.username = await this.generateUniqueGoogleUsername({
        id: user.googleId,
        displayName: `${identityValidation.firstName || ''} ${identityValidation.lastName1 || ''}`.trim(),
        emails: [{ value: user.email }],
      });
    }

    user.isRegistrationComplete = true;

    await user.save();

    const token = this.generateAuthToken(user);

    return {
      message: 'Registro con Google completado exitosamente',
      user: {
        ...user.toJSON(),
        id: user._id,
        name: this.buildDisplayName(user),
      },
      token,
    };
  }
}

module.exports = new AuthService();
