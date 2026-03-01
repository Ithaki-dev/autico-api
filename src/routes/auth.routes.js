const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * Rutas de autenticación
 * Base path: /api/auth
 */

// Registrar usuario
router.post('/register', authController.register.bind(authController));

// Iniciar sesión
router.post('/login', authController.login.bind(authController));

module.exports = router;
