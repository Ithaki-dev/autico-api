const authService = require('../services/auth.service');

/**
 * Controlador de autenticación
 */
class AuthController {
  /**
   * Registrar nuevo usuario
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { username, email, password, phone, cedula } = req.body;

      // Validaciones básicas
      if (!username || !email || !password || !cedula) {
        return res.status(400).json({
          message: 'Username, email, contraseña y cédula son requeridos.',
        });
      }

      if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({
          message: 'Username, email y contraseña deben ser texto.',
        });
      }

      if (typeof cedula !== 'string') {
        return res.status(400).json({
          message: 'La cédula debe ser un texto.',
        });
      }

      const normalizedCedula = cedula.trim().replace(/[-\s]/g, '');
      if (!normalizedCedula) {
        return res.status(400).json({
          message: 'La cédula no puede estar vacía.',
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: 'Por favor ingresa un correo electrónico válido.',
        });
      }

      const result = await authService.register({
        username: username.trim(),
        email: email.trim(),
        password,
        phone,
        cedula: normalizedCedula,
      });

      res.status(201).json(result);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          message: error.message,
        });
      }

      next(error);
    }
  }

  /**
   * Iniciar sesión
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const identifier = username || email;

      // Validaciones básicas
      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: 'Usuario/email y contraseña son requeridos.',
        });
      }

      const result = await authService.login(identifier, password);

      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
