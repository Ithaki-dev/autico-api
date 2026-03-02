const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Esquema de Usuario
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'El nombre de usuario es requerido'],
      unique: true,
      trim: true,
      minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es requerido'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Por favor ingresa un correo electrónico válido',
      ],
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^[\d\s\-\+\(\)]+$/,
        'Por favor ingresa un número de teléfono válido',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'La contraseña es requerida'],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Método para comparar contraseñas
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Método para ocultar campos sensibles en respuestas JSON
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
