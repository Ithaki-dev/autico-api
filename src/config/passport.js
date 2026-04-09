const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('./config');
const authService = require('../services/auth.service');

if (config.google.clientId && config.google.clientSecret && config.google.callbackUrl) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const result = await authService.handleGoogleOAuthProfile(profile);
          return done(null, result);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

module.exports = passport;
