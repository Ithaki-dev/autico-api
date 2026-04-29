const twilio = require('twilio');
const config = require('../config/config');

class SmsService {
  normalizePhoneNumber(phone) {
    const rawValue = String(phone || '').trim();

    if (!rawValue) {
      return null;
    }

    if (rawValue.startsWith('+')) {
      return rawValue.replace(/\s+/g, '');
    }

    const digitsOnly = rawValue.replace(/\D/g, '');

    if (!digitsOnly) {
      return null;
    }

    if (digitsOnly.startsWith('00')) {
      return `+${digitsOnly.slice(2)}`;
    }

    const countryCode = String(config.twilio.defaultCountryCode || '').trim();

    if (countryCode) {
      const normalizedCountryCode = countryCode.startsWith('+') ? countryCode : `+${countryCode.replace(/\D/g, '')}`;
      return `${normalizedCountryCode}${digitsOnly}`;
    }

    return null;
  }

  getClient() {
    if (!config.twilio.accountSid || !config.twilio.authToken) {
      const error = new Error('Twilio no está configurado correctamente.');
      error.statusCode = 503;
      throw error;
    }

    return twilio(config.twilio.accountSid, config.twilio.authToken);
  }

  async sendOtp({ to, code }) {
    const normalizedTo = this.normalizePhoneNumber(to);

    if (!normalizedTo) {
      const error = new Error('El usuario no tiene un número de teléfono válido para 2FA.');
      error.statusCode = 400;
      throw error;
    }

    if (!config.twilio.fromPhone) {
      const error = new Error('Twilio requiere TWILIO_FROM_PHONE.');
      error.statusCode = 503;
      throw error;
    }

    const payload = {
      to: normalizedTo,
      from: config.twilio.fromPhone,
      body: `Tu código de verificación es: ${code}. Expira en 5 minutos.`,
    };

    const client = this.getClient();
    await client.messages.create(payload);
  }
}

module.exports = new SmsService();