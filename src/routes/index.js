const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth.routes');
const vehicleRoutes = require('./vehicle.routes');
const questionRoutes = require('./question.routes');
const answerRoutes = require('./answer.routes');
const identityRoutes = require('./identityRoutes');

/**
 * Configuración central de rutas
 */

// Auth routes
router.use('/auth', authRoutes);

// Identity routes
router.use('/identity', identityRoutes);

// Vehicle routes
router.use('/vehicles', vehicleRoutes);

// Question routes (incluye /my/questions)
router.use('/', questionRoutes);

// Answer routes (incluye /questions/:questionId/answer)
router.use('/', answerRoutes);

module.exports = router;
