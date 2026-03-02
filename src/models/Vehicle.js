const mongoose = require('mongoose');

/**
 * Esquema de Vehículo
 */
const vehicleSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: [true, 'La marca es requerida'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'El modelo es requerido'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'El año es requerido'],
      min: [1900, 'El año debe ser mayor a 1900'],
      max: [new Date().getFullYear() + 1, 'El año no puede ser futuro'],
    },
    price: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [0, 'El precio debe ser positivo'],
    },
    status: {
      type: String,
      enum: ['available', 'sold'],
      default: 'available',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'La descripción no puede exceder 1000 caracteres'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images) {
          return images.length <= 10;
        },
        message: 'No se pueden agregar más de 10 imágenes',
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para filtros y búsquedas frecuentes
vehicleSchema.index({ brand: 1 });
vehicleSchema.index({ price: 1 });
vehicleSchema.index({ year: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ owner: 1 });

// Índice compuesto para búsquedas múltiples
vehicleSchema.index({ brand: 1, year: 1, price: 1 });

/**
 * Método para ocultar campos internos en respuestas JSON
 */
vehicleSchema.methods.toJSON = function () {
  const vehicle = this.toObject();
  delete vehicle.__v;
  return vehicle;
};

module.exports = mongoose.model('Vehicle', vehicleSchema);
