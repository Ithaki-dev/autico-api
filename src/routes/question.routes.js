const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * Rutas de preguntas
 */

// Obtener mis preguntas
// GET /api/my/questions
router.get('/my/questions', authMiddleware, questionController.getMyQuestions.bind(questionController));

module.exports = router;
