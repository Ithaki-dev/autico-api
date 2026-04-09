const authService = require('../services/auth.service');

/**
 * Middleware para validar tempToken del flujo Google incompleto
 */
const googleTempTokenMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token temporal no proporcionado.',
      });
    }

    const token = authHeader.split(' ')[1];
    const payload = authService.verifyGoogleTempToken(token);

    req.googleTempAuth = payload;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token temporal expirado. Inicia nuevamente con Google.',
      });
    }

    if (error.name === 'JsonWebTokenError' || error.statusCode === 401) {
      return res.status(401).json({
        success: false,
        message: 'Token temporal inválido.',
      });
    }

    return next(error);
  }
};

module.exports = googleTempTokenMiddleware;
