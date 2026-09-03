const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { hashPassword, comparePassword, signToken, setAuthCookie, clearAuthCookie } = require('../utils/auth');

const router = express.Router();
const publicUser = (user) => ({ id: user._id, username: user.username, email: user.email, name: user.name, bio: user.bio, avatarUrl: user.avatarUrl });

router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, name } = req.body;
    if (!username || !email || !password || !name) return res.status(400).json({ message: 'username, email, password and name are required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (exists) return res.status(409).json({ message: 'Email or username already exists' });

    const passwordHash = await hashPassword(password);
    const user = await User.create({ username, email, name, passwordHash });
    setAuthCookie(res, signToken(user._id.toString()));
    res.status(201).json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+passwordHash');
    if (!user || !(await comparePassword(password || '', user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password' });
    setAuthCookie(res, signToken(user._id.toString()));
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

module.exports = router;
