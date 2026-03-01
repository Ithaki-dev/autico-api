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
      const { username, password } = req.body;

      // Validaciones básicas
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Usuario y contraseña son requeridos.',
        });
      }

      const user = await authService.register(username, password);

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
      const { username, password } = req.body;

      // Validaciones básicas
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Usuario y contraseña son requeridos.',
        });
      }

      const result = await authService.login(username, password);

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
