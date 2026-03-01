const answerService = require('../services/answer.service');

/**
 * Controlador de respuestas
 */
class AnswerController {
  /**
   * Crear respuesta a una pregunta
   * POST /api/questions/:questionId/answer
   */
  async createAnswer(req, res, next) {
    try {
      const { questionId } = req.params;
      const { text } = req.body;
      const userId = req.user.id;

      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'El texto de la respuesta es requerido.',
        });
      }

      const answer = await answerService.createAnswer(questionId, userId, text);

      res.status(201).json({
        success: true,
        message: 'Respuesta creada exitosamente.',
        data: answer,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnswerController();
