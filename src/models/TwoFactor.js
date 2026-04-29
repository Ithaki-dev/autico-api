const mongoose = require('mongoose');

/**
 * Códigos OTP para flujo de 2FA por SMS.
 */
const twoFactorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tempTokenId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    otpHash: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index: Mongo eliminará automáticamente OTPs expirados.
twoFactorSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TwoFactor', twoFactorSchema);