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
    const cleanText = text?.trim();
    if (!cleanText) {
      const error = new Error('El texto de la pregunta es requerido.');
      error.statusCode = 400;
      throw error;
    }

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
      text: cleanText,
    });

    return await question.populate([
      { path: 'user', select: 'username' },
      { path: 'vehicle', select: 'brand model year owner' },
    ]);
  }

  /**
   * Responder pregunta
   */
  async answerQuestion(questionId, userId, text) {
    const cleanText = text?.trim();
    if (!cleanText) {
      const error = new Error('El texto de la respuesta es requerido.');
      error.statusCode = 400;
      throw error;
    }

    const question = await Question.findById(questionId).populate('vehicle', 'owner');

    if (!question) {
      const error = new Error('Pregunta no encontrada.');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = question.vehicle.owner.toString() === userId.toString();
    if (!isOwner) {
      const error = new Error('No autorizado para responder esta pregunta.');
      error.statusCode = 403;
      throw error;
    }

    if (question.answer) {
      const error = new Error('Esta pregunta ya tiene una respuesta.');
      error.statusCode = 400;
      throw error;
    }

    question.answer = {
      user: userId,
      text: cleanText,
    };

    await question.save();

    return await Question.findById(question._id)
      .populate('user', 'username')
      .populate('vehicle', 'brand model year owner')
      .populate('answer.user', 'username');
  }

  /**
   * Obtener preguntas del usuario autenticado
   */
  async getUserQuestions(userId) {
    const questions = await Question.find({ user: userId })
      .populate('vehicle', 'brand model year owner')
      .populate('user', 'username')
      .populate('answer.user', 'username')
      .sort({ createdAt: -1 })
      .lean();

    return questions;
  }

  /**
   * Obtener preguntas de un vehículo (privado por owner/autor)
   */
  async getVehicleQuestions(vehicleId, userId) {
    const vehicle = await Vehicle.findById(vehicleId).select('owner');

    if (!vehicle) {
      const error = new Error('Vehículo no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = vehicle.owner.toString() === userId.toString();
    const filter = { vehicle: vehicleId };

    if (!isOwner) {
      filter.user = userId;
    }

    const questions = await Question.find(filter)
      .populate('user', 'username')
      .populate('answer.user', 'username')
      .sort({ createdAt: -1 })
      .lean();

    return questions;
  }
}

module.exports = new QuestionService();
