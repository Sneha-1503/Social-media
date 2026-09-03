const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const hashPassword = (password) => bcrypt.hash(password, 12);
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

const signToken = (userId) => jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
});

const setAuthCookie = (res, token) => {
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
};

const clearAuthCookie = (res) => res.clearCookie('access_token', { path: '/' });

module.exports = { hashPassword, comparePassword, signToken, setAuthCookie, clearAuthCookie };
