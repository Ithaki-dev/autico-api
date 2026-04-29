const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TwoFactor = require('../models/TwoFactor');
const config = require('../config/config');
const identityService = require('./identityService');
const emailService = require('./email.service');
const smsService = require('./sms.service');

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
   * Generar código OTP de 6 dígitos.
   */
  generateOtpCode() {
    const code = crypto.randomInt(0, 1000000);
    return String(code).padStart(6, '0');
  }

  /**
   * Crear token temporal para flujo de login con 2FA.
   */
  generateTwoFactorTempToken(user, tokenId) {
    return jwt.sign(
      {
        userId: user._id,
        sub: String(user._id),
        purpose: '2fa-login',
        tokenId,
      },
      config.jwt.tempSecret || config.jwt.secret,
      {
        expiresIn: '5m',
      }
    );
  }

  /**
   * Verificar token temporal del flujo 2FA.
   */
  verifyTwoFactorTempToken(tempToken) {
    const payload = jwt.verify(tempToken, config.jwt.tempSecret || config.jwt.secret);

    if (payload.purpose !== '2fa-login' || !payload.userId || !payload.tokenId) {
      const error = new Error('Token temporal de 2FA inválido.');
      error.statusCode = 401;
      throw error;
    }

    return payload;
  }

  /**
   * Enmascarar teléfono para respuesta al cliente.
   */
  maskPhone(phone) {
    const value = String(phone || '').trim();

    if (!value) {
      return null;
    }

    const visible = value.slice(-2);
    const hidden = value.slice(0, -2).replace(/\d/g, '*');
    return `${hidden}${visible}`;
  }

  /**
   * Normalizar teléfono para el flujo 2FA.
   */
  normalizePhoneForSms(phone) {
    return smsService.normalizePhoneNumber(phone);
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
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    try {
      await emailService.sendVerificationEmail({
        to: user.email,
        username: user.username,
        token: verificationToken,
      });
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      throw error;
    }

    return {
      message: 'Usuario registrado exitosamente. Revisa tu correo para verificar tu cuenta.',
      user: {
        ...user.toJSON(),
        id: user._id,
        name: this.buildDisplayName(user),
      },
    };
  }

  /**
   * Verificar correo electrónico mediante token
   */
  async verifyEmail(token) {
    const normalizedToken = String(token || '').trim();

    if (!normalizedToken) {
      const error = new Error('Token de verificación requerido.');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({
      verificationToken: normalizedToken,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      const error = new Error('Token de verificación inválido o expirado.');
      error.statusCode = 400;
      throw error;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    return {
      message: 'Correo verificado exitosamente. Ya puedes iniciar sesión.',
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

    if (!user.isVerified) {
      const error = new Error('Debes verificar tu correo electrónico antes de iniciar sesión.');
      error.statusCode = 403;
      throw error;
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      const error = new Error('Credenciales inválidas.');
      error.statusCode = 401;
      throw error;
    }

    const normalizedPhone = this.normalizePhoneForSms(user.phone);

    if (!normalizedPhone) {
      const error = new Error('Tu cuenta no tiene un número de teléfono registrado para 2FA.');
      error.statusCode = 400;
      throw error;
    }
    /**
     * Generar código OTP
     */
    const otpCode = this.generateOtpCode();
    const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
    const tempTokenId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Mantener un solo challenge activo por usuario.
    await TwoFactor.deleteMany({ user: user._id });

    await TwoFactor.create({
      user: user._id,
      tempTokenId,
      otpHash,
      expiresAt,
      phone: normalizedPhone,
    });

    try {
      await smsService.sendOtp({
        to: normalizedPhone,
        code: otpCode,
      });
    } catch (error) {
      await TwoFactor.deleteMany({ user: user._id });
      throw error;
    }

    const tempToken = this.generateTwoFactorTempToken(user, tempTokenId);

    return {
      requires2FA: true,
      tempToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: this.buildDisplayName(user),
        phone: this.maskPhone(normalizedPhone),
      },
    };
  }

  /**
   * Validar OTP de 2FA y emitir JWT final.
   */
  async verifyTwoFactorCode(tempToken, code) {
    const normalizedToken = String(tempToken || '').trim();
    const normalizedCode = String(code || '').trim();

    if (!normalizedToken || !normalizedCode) {
      const error = new Error('tempToken y code son requeridos.');
      error.statusCode = 400;
      throw error;
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      const error = new Error('El código OTP debe tener 6 dígitos.');
      error.statusCode = 400;
      throw error;
    }

    const payload = this.verifyTwoFactorTempToken(normalizedToken);
    const now = new Date();

    const challenge = await TwoFactor.findOne({
      user: payload.userId,
      tempTokenId: payload.tokenId,
      expiresAt: { $gt: now },
    });

    if (!challenge) {
      const error = new Error('Código OTP inválido o expirado.');
      error.statusCode = 401;
      throw error;
    }

    const incomingHash = crypto.createHash('sha256').update(normalizedCode).digest('hex');

    if (incomingHash !== challenge.otpHash) {
      const error = new Error('Código OTP inválido o expirado.');
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      const error = new Error('Usuario no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    if (user.provider === 'google') {
      const error = new Error('El flujo 2FA por SMS no aplica para usuarios Google.');
      error.statusCode = 400;
      throw error;
    }

    // Eliminar códigos usados/inactivos del usuario tras validación exitosa.
    await TwoFactor.deleteMany({ user: user._id });

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
