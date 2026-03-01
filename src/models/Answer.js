const mongoose = require('mongoose');

/**
 * Esquema de Respuesta
 */
const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: [true, 'La pregunta es requerida'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es requerido'],
    },
    text: {
      type: String,
      required: [true, 'El texto de la respuesta es requerido'],
      trim: true,
      maxlength: [500, 'La respuesta no puede exceder 500 caracteres'],
    },
  },
  {
    timestamps: true,
  }
);

// Índices para búsquedas eficientes
answerSchema.index({ question: 1 });
answerSchema.index({ user: 1 });

/**
 * Método para ocultar campos internos en respuestas JSON
 */
answerSchema.methods.toJSON = function () {
  const answer = this.toObject();
  delete answer.__v;
  return answer;
};

module.exports = mongoose.model('Answer', answerSchema);
