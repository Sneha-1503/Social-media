const express = require('express');
const Post = require('../models/Post');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(50).populate('author', 'username name avatarUrl').populate('comments.user', 'username name avatarUrl');
    res.json({ posts });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { content, mediaUrl = '' } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: 'Post content is required' });
    const post = await Post.create({ author: req.user._id, content: content.trim(), mediaUrl });
    await post.populate('author', 'username name avatarUrl');
    res.status(201).json({ post });
  } catch (error) { next(error); }
});

router.post('/:id/like', requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const index = post.likes.findIndex((id) => id.equals(req.user._id));
    if (index >= 0) post.likes.splice(index, 1); else post.likes.push(req.user._id);
    await post.save();
    res.json({ liked: index < 0, likesCount: post.likes.length });
  } catch (error) { next(error); }
});

router.post('/:id/comments', requireAuth, async (req, res, next) => {
  try {
    const text = (req.body.text || '').trim();
    if (!text) return res.status(400).json({ message: 'Comment text is required' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ user: req.user._id, text });
    await post.save();
    await post.populate('comments.user', 'username name avatarUrl');
    res.status(201).json({ comment: post.comments[post.comments.length - 1] });
  } catch (error) { next(error); }
});

module.exports = router;
