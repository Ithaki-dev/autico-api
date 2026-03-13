const questionService = require('./question.service');

/**
 * Servicio de respuestas
 */
class AnswerService {
  /**
   * Crear respuesta a una pregunta
   */
  async createAnswer(questionId, userId, text) {
    return questionService.answerQuestion(questionId, userId, text);
  }
}

module.exports = new AnswerService();
