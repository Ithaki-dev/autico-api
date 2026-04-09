const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Esquema de Usuario
 */
const userSchema = new mongoose.Schema(
  {
    cedula: {
      type: String,
      required: function () {
        return this.provider === 'local' || this.isRegistrationComplete;
      },
      unique: true,
      sparse: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: function () {
        return this.provider === 'local' || this.isRegistrationComplete;
      },
      trim: true,
    },
    lastName1: {
      type: String,
      required: function () {
        return this.provider === 'local' || this.isRegistrationComplete;
      },
      trim: true,
    },
    lastName2: {
      type: String,
      required: function () {
        return this.provider === 'local' || this.isRegistrationComplete;
      },
      trim: true,
    },
    username: {
      type: String,
      required: function () {
        return this.provider === 'local';
      },
      unique: true,
      sparse: true,
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
      required: function () {
        return this.provider === 'local';
      },
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    isRegistrationComplete: {
      type: Boolean,
      default: true,
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
  if (!this.passwordHash) {
    return false;
  }

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
