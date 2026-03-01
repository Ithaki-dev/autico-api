const mongoose = require('mongoose');

/**
 * Esquema de Pregunta
 */
const questionSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'El vehículo es requerido'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es requerido'],
    },
    text: {
      type: String,
      required: [true, 'El texto de la pregunta es requerido'],
      trim: true,
      maxlength: [500, 'La pregunta no puede exceder 500 caracteres'],
    },
  },
  {
    timestamps: true,
  }
);

// Índices para búsquedas eficientes
questionSchema.index({ vehicle: 1 });
questionSchema.index({ user: 1 });
questionSchema.index({ createdAt: -1 });

/**
 * Método para ocultar campos internos en respuestas JSON
 */
questionSchema.methods.toJSON = function () {
  const question = this.toObject();
  delete question.__v;
  return question;
};

module.exports = mongoose.model('Question', questionSchema);
