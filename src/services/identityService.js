const axios = require('axios');
const config = require('../config/config');

/**
 * Servicio de validación de identidad
 */
class IdentityService {
  /**
   * Valida una cédula en el padrón electoral
   * @param {string} cedula - Número de cédula
   * @returns {object} Objeto con resultado de validación
   */
  async validateIdentity(cedula) {
    try {
      // Normalizar cédula: quitar espacios y guiones
      const normalizedCedula = cedula.trim().replace(/[-\s]/g, '');

      // Validar que la cédula normalizada no esté vacía
      if (!normalizedCedula) {
        return {
          valid: false,
          isAdult: false,
          message: 'La cédula no puede estar vacía.',
        };
      }

      const url = `${config.padronApiUrl}/api/padron/${normalizedCedula}`;
      const response = await axios.get(url, { timeout: 5000 });
      const data = response.data || {};

      if (!data.exists) {
        return {
          valid: false,
          isAdult: false,
          message: 'La cédula no existe en el padrón electoral',
        };
      }

      return {
        valid: true,
        isAdult: true,
        cedula: data.cedula || normalizedCedula,
        firstName: data.firstName,
        lastName1: data.lastName1,
        lastName2: data.lastName2,
        message: 'Identidad validada correctamente',
      };
    } catch (error) {
      const serviceError = new Error('No fue posible validar la identidad en este momento');
      serviceError.statusCode = 503;
      throw serviceError;
    }
  }
}

module.exports = new IdentityService();
