const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth.routes');
const vehicleRoutes = require('./vehicle.routes');
const questionRoutes = require('./question.routes');
const answerRoutes = require('./answer.routes');

/**
 * Configuración central de rutas
 */

// Auth routes
router.use('/auth', authRoutes);

// Vehicle routes
router.use('/vehicles', vehicleRoutes);

// Question routes (incluye /vehicles/:vehicleId/questions y /my/questions)
router.use('/', questionRoutes);

// Answer routes (incluye /questions/:questionId/answer)
router.use('/', answerRoutes);

module.exports = router;
