const Question = require('../models/Question');
const Vehicle = require('../models/Vehicle');

/**
 * Servicio de preguntas
 */
class QuestionService {
  /**
   * Crear pregunta en un vehículo
   */
  async createQuestion(vehicleId, userId, text) {
    // Verificar que el vehículo existe
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      const error = new Error('Vehículo no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    // Crear pregunta
    const question = await Question.create({
      vehicle: vehicleId,
      user: userId,
      text,
    });

    return await question.populate([
      { path: 'user', select: 'username' },
      { path: 'vehicle', select: 'brand model year' },
    ]);
  }

  /**
   * Obtener preguntas del usuario autenticado
   */
  async getUserQuestions(userId) {
    const questions = await Question.find({ user: userId })
      .populate('vehicle', 'brand model year price')
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .lean();

    return questions;
  }

  /**
   * Obtener preguntas de un vehículo
   */
  async getVehicleQuestions(vehicleId) {
    const questions = await Question.find({ vehicle: vehicleId })
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .lean();

    return questions;
  }
}

module.exports = new QuestionService();
