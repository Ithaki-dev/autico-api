const express = require('express');
const router = express.Router();
const identityController = require('../controllers/identityController');

/**
 * Rutas de validación de identidad
 */

/**
 * Validar cédula contra padrón electoral
 * POST /api/identity/validate
 */
router.post('/validate', identityController.validate.bind(identityController));

module.exports = router;
