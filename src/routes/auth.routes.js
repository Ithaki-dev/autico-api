const express = require('express');
const router = express.Router();
const passport = require('passport');
const config = require('../config/config');
const authController = require('../controllers/auth.controller');
const googleTempTokenMiddleware = require('../middlewares/googleTempToken.middleware');

const getMissingGoogleOAuthVars = () => {
	const missingVars = [];

	if (!config.google.clientId) {
		missingVars.push('GOOGLE_CLIENT_ID');
	}

	if (!config.google.clientSecret) {
		missingVars.push('GOOGLE_CLIENT_SECRET');
	}

	if (!config.google.callbackUrl) {
		missingVars.push('GOOGLE_CALLBACK_URL');
	}

	return missingVars;
};

const requireGoogleOAuthConfig = (req, res, next) => {
	const missingVars = getMissingGoogleOAuthVars();

	if (missingVars.length > 0) {
		return res.status(503).json({
			success: false,
			message: `Google OAuth2 no está configurado en el servidor. Faltan: ${missingVars.join(', ')}`,
		});
	}

	next();
};

/**
 * Rutas de autenticación
 * Base path: /api/auth
 */

// Registrar usuario
router.post('/register', authController.register.bind(authController));

// Iniciar sesión
router.post('/login', authController.login.bind(authController));

// Verificar correo electrónico
router.post('/verify-email', authController.verifyEmail.bind(authController));

// Iniciar OAuth2 con Google
router.get(
	'/google',
	requireGoogleOAuthConfig,
	passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Callback OAuth2 de Google
router.get('/google/callback', (req, res, next) => {
	const missingVars = getMissingGoogleOAuthVars();

	if (missingVars.length > 0) {
		return res.status(503).json({
			success: false,
			message: `Google OAuth2 no está configurado en el servidor. Faltan: ${missingVars.join(', ')}`,
		});
	}

	passport.authenticate('google', { session: false }, (err, authPayload) => {
		authController.googleCallback(req, res, next, err, authPayload);
	})(req, res, next);
});

// Completar registro Google con cédula
router.post(
	'/google/complete-registration',
	googleTempTokenMiddleware,
	authController.completeGoogleRegistration.bind(authController)
);

module.exports = router;
