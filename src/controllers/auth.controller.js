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
      const { username, email, password, phone } = req.body;

      // Validaciones básicas
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Usuario, email y contraseña son requeridos.',
        });
      }

      const user = await authService.register({ username, email, password, phone });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente.',
        data: user,
      });
    } catch (error) {
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
