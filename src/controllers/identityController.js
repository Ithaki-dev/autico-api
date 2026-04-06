const identityService = require('../services/identityService');

/**
 * Controlador de validación de identidad
 */
class IdentityController {
  /**
   * Valida una cédula contra el padrón electoral
   * POST /api/identity/validate
   */
  async validate(req, res, next) {
    try {
      const { cedula } = req.body;

      // Validar que venga cédula en el body
      if (!cedula) {
        return res.status(400).json({
          valid: false,
          message: 'La cédula es requerida.',
        });
      }

      // Validar que sea string
      if (typeof cedula !== 'string') {
        return res.status(400).json({
          valid: false,
          message: 'La cédula debe ser un texto.',
        });
      }

      // Validar que no esté vacía (después de normalizar)
      const normalized = cedula.trim().replace(/[-\s]/g, '');
      if (!normalized) {
        return res.status(400).json({
          valid: false,
          message: 'La cédula no puede estar vacía.',
        });
      }

      // Llamar al servicio
      const result = await identityService.validateIdentity(cedula);

      // Devolver respuesta
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IdentityController();
