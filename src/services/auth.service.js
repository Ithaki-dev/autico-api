const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

/**
 * Servicio de autenticación
 */
class AuthService {
  /**
   * Registrar nuevo usuario
   */
  async register(username, password) {
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
      username,
      passwordHash,
    });

    return {
      id: user._id,
      username: user.username,
    };
  }

  /**
   * Iniciar sesión
   */
  async login(username, password) {
    // Buscar usuario
    const user = await User.findOne({ username });

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
      },
    };
  }
}

module.exports = new AuthService();
