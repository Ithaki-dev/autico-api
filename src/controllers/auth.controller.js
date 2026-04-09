const authService = require('../services/auth.service');
const config = require('../config/config');

/**
 * Controlador de autenticación
 */
class AuthController {
  /**
   * Redirigir al frontend en callback de Google cuando esté configurado
   */
  redirectGoogleResult(req, res, payload) {
    const redirectBaseUrl = config.google.frontendRedirectUrl;
    const responseMode = req.query.response;

    if (!redirectBaseUrl || responseMode === 'json') {
      return false;
    }

    const redirectUrl = new URL(redirectBaseUrl);

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          redirectUrl.searchParams.set(key, JSON.stringify(value));
        } else {
          redirectUrl.searchParams.set(key, String(value));
        }
      }
    });

    res.redirect(302, redirectUrl.toString());
    return true;
  }

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

  /**
   * Callback de autenticación con Google OAuth2
   * GET /api/auth/google/callback
   */
  async googleCallback(req, res, next, err, authPayload) {
    try {
      if (err) {
        const redirected = this.redirectGoogleResult(req, res, {
          success: false,
          message: err.message || 'No fue posible autenticar con Google.',
        });

        if (redirected) {
          return;
        }

        if (err.statusCode) {
          return res.status(err.statusCode).json({
            success: false,
            message: err.message,
          });
        }

        return next(err);
      }

      if (!authPayload || !authPayload.user) {
        const redirected = this.redirectGoogleResult(req, res, {
          success: false,
          message: 'No fue posible autenticar con Google.',
        });

        if (redirected) {
          return;
        }

        return res.status(401).json({
          success: false,
          message: 'No fue posible autenticar con Google.',
        });
      }

      if (authPayload.requiresCedula) {
        const tempToken = authService.generateGoogleTempToken(authPayload.user);
        const publicUser = authService.buildPublicUser(authPayload.user);

        const redirected = this.redirectGoogleResult(req, res, {
          success: true,
          requiresCedula: true,
          tempToken,
          user: publicUser,
        });

        if (redirected) {
          return;
        }

        return res.status(200).json({
          success: true,
          requiresCedula: true,
          tempToken,
          user: publicUser,
        });
      }

      const token = authService.generateAuthToken(authPayload.user);
      const publicUser = authService.buildPublicUser(authPayload.user);

      const redirected = this.redirectGoogleResult(req, res, {
        success: true,
        requiresCedula: false,
        token,
        user: publicUser,
      });

      if (redirected) {
        return;
      }

      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión con Google exitoso.',
        data: {
          token,
          user: publicUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Completar registro de Google con cédula
   * POST /api/auth/google/complete-registration
   */
  async completeGoogleRegistration(req, res, next) {
    try {
      const { cedula, username } = req.body;

      if (typeof cedula !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'La cédula debe ser un texto.',
        });
      }

      if (username !== undefined && typeof username !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario debe ser un texto.',
        });
      }

      const userId = req.googleTempAuth.userId || req.googleTempAuth.sub;
      const result = await authService.completeGoogleRegistration(userId, cedula, username);

      return res.status(200).json(result);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      next(error);
    }
  }
}

module.exports = new AuthController();
