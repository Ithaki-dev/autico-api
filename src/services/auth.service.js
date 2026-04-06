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
    });

    // Generar token JWT tras registro exitoso
    const token = jwt.sign({ id: user._id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    return {
      message: 'Usuario registrado exitosamente',
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Iniciar sesión
   */
  async login(identifier, password) {
    // Buscar usuario por username o email
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      const error = new Error('Credenciales inválidas.');
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
    const token = jwt.sign({ id: user._id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
    };
  }
}

module.exports = new AuthService();
