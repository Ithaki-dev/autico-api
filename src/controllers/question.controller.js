const questionService = require('../services/question.service');

/**
 * Controlador de preguntas
 */
class QuestionController {
  /**
   * Crear pregunta en un vehículo
   * POST /api/vehicles/:vehicleId/questions
   */
  async createQuestion(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const { text } = req.body;
      const userId = req.user.id;

      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'El texto de la pregunta es requerido.',
        });
      }

      const question = await questionService.createQuestion(vehicleId, userId, text);

      res.status(201).json({
        success: true,
        message: 'Pregunta creada exitosamente.',
        data: question,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener preguntas del usuario autenticado
   * GET /api/my/questions
   */
  async getMyQuestions(req, res, next) {
    try {
      const userId = req.user.id;
      const questions = await questionService.getUserQuestions(userId);

      res.status(200).json({
        success: true,
        data: questions,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuestionController();
