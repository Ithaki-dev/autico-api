const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Vehicle = require('../models/Vehicle');

/**
 * Servicio de respuestas
 */
class AnswerService {
  /**
   * Crear respuesta a una pregunta
   */
  async createAnswer(questionId, userId, text) {
    // Buscar pregunta con información del vehículo
    const question = await Question.findById(questionId).populate('vehicle');

    if (!question) {
      const error = new Error('Pregunta no encontrada.');
      error.statusCode = 404;
      throw error;
    }

    // Verificar que el usuario es el dueño del vehículo
    if (question.vehicle.owner.toString() !== userId.toString()) {
      const error = new Error('Solo el propietario del vehículo puede responder.');
      error.statusCode = 403;
      throw error;
    }

    // Verificar si ya existe una respuesta
    const existingAnswer = await Answer.findOne({ question: questionId });
    if (existingAnswer) {
      const error = new Error('Esta pregunta ya tiene una respuesta.');
      error.statusCode = 400;
      throw error;
    }

    // Crear respuesta
    const answer = await Answer.create({
      question: questionId,
      user: userId,
      text,
    });

    return await answer.populate([
      { path: 'user', select: 'username' },
      { path: 'question' },
    ]);
  }

  /**
   * Obtener respuesta de una pregunta
   */
  async getAnswerByQuestion(questionId) {
    const answer = await Answer.findOne({ question: questionId })
      .populate('user', 'username')
      .lean();

    return answer;
  }
}

module.exports = new AnswerService();
