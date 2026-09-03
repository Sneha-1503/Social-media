const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/:id/follow', requireAuth, async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'You cannot follow yourself' });
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    const alreadyFollowing = target.followers.some((id) => id.equals(req.user._id));
    if (alreadyFollowing) {
      target.followers.pull(req.user._id);
      req.user.following.pull(target._id);
    } else {
      target.followers.addToSet(req.user._id);
      req.user.following.addToSet(target._id);
    }
    await Promise.all([target.save(), req.user.save()]);
    res.json({ following: !alreadyFollowing, followersCount: target.followers.length });
  } catch (error) { next(error); }
});

router.get('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('username name bio avatarUrl followers following createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: { ...user.toObject(), followersCount: user.followers.length, followingCount: user.following.length } });
  } catch (error) { next(error); }
});

module.exports = router;
