const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answer.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * Rutas de respuestas
 */

// Crear respuesta a una pregunta
// POST /api/questions/:questionId/answer
router.post(
  '/questions/:questionId/answer',
  authMiddleware,
  answerController.createAnswer.bind(answerController)
);

module.exports = router;
