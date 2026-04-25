const sgMail = require('@sendgrid/mail');
const config = require('../config/config');

/**
 * Servicio de envío de correos
 */
class EmailService {
  /**
   * Validar configuración mínima de envío
   */
  validateConfig() {
    if (!config.email.sendgridApiKey) {
      const error = new Error('El servicio de correo no está disponible. Falta SENDGRID_API_KEY.');
      error.statusCode = 503;
      throw error;
    }

    if (!config.email.from) {
      const error = new Error('El servicio de correo no está disponible. Falta EMAIL_FROM.');
      error.statusCode = 503;
      throw error;
    }

    if (!config.email.frontendUrl) {
      const error = new Error('El servicio de correo no está disponible. Falta FRONTEND_URL.');
      error.statusCode = 503;
      throw error;
    }
  }

  /**
   * Enviar correo de verificación de cuenta
   */
  async sendVerificationEmail({ to, username, token }) {
    this.validateConfig();

    const normalizedTo = String(to || '').trim().toLowerCase();
    const normalizedToken = String(token || '').trim();

    if (!normalizedTo || !normalizedToken) {
      const error = new Error('Datos inválidos para enviar correo de verificación.');
      error.statusCode = 400;
      throw error;
    }

    const verificationUrl = `${config.email.frontendUrl}/verify-email?token=${encodeURIComponent(normalizedToken)}`;

    sgMail.setApiKey(config.email.sendgridApiKey);

    const message = {
      to: normalizedTo,
      from: config.email.from,
      subject: 'Verifica tu correo electrónico',
      text: [
        `Hola ${username || ''},`,
        '',
        'Gracias por registrarte.',
        'Para activar tu cuenta, verifica tu correo con el siguiente enlace:',
        verificationUrl,
        '',
        'Si no creaste esta cuenta, ignora este mensaje.',
      ].join('\n'),
      html: `
        <p>Hola ${username || ''},</p>
        <p>Gracias por registrarte.</p>
        <p>Para activar tu cuenta, verifica tu correo con el siguiente enlace:</p>
        <p><a href="${verificationUrl}">Verificar correo electrónico</a></p>
        <p>Si no creaste esta cuenta, ignora este mensaje.</p>
      `,
    };

    try {
      await sgMail.send(message);
    } catch (error) {
      const sendgridMessage =
        error && error.response && error.response.body && error.response.body.errors
          ? error.response.body.errors.map((item) => item.message).join(', ')
          : null;

      const customError = new Error(
        sendgridMessage || 'No fue posible enviar el correo de verificación. Intenta nuevamente más tarde.'
      );
      customError.statusCode = 502;
      throw customError;
    }
  }
}

module.exports = new EmailService();
