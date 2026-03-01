const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

/**
 * Middleware de autenticación JWT
 * Verifica el token en el header Authorization
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado. Acceso denegado.',
      });
    }

    // Extraer token
    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Buscar usuario
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado. Token inválido.',
      });
    }

    // Agregar usuario al request
    req.user = {
      id: user._id,
      username: user.username,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al verificar autenticación.',
    });
  }
};

module.exports = authMiddleware;
