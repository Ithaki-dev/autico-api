/**
 * Configuración de variables de entorno
 */
module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI,
  padronApiUrl: process.env.PADRON_API_URL || 'http://localhost:4000',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    tempSecret: process.env.JWT_TEMP_SECRET,
    tempExpiresIn: process.env.JWT_TEMP_EXPIRES_IN || '15m',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    frontendRedirectUrl: process.env.GOOGLE_FRONTEND_REDIRECT_URL,
  },
  email: {
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    from: process.env.EMAIL_FROM,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE) || 100,
  },
};
