import express from 'express';
import Story from './Story.js';
import { verifyToken, verifyOwner, verifyAdmin } from './jwt-middleware.js';

const router = express.Router();

// ============ GET ALL ACTIVE STORIES ============
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const stories = await Story.find({
      isActive: true,
      expiresAt: { $gt: now }
    })
      .populate('owner', 'name username profilePicture role')
      .sort({ createdAt: -1 });

    res.json({
      total: stories.length,
      stories
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stories', message: err.message });
  }
});

// ============ CREATE STORY (Owner/Admin only) ============
router.post('/create', verifyOwner, async (req, res) => {
  try {
    const { title, image, description, hoursActive } = req.body;

    if (!title || !image) {
      return res.status(400).json({ error: 'title and image required' });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (hoursActive || 24));

    const story = new Story({
      title,
      image,
      description,
      owner: req.userId,
      expiresAt
    });

    await story.save();

    res.status(201).json({
      message: '✅ Story created!',
      story,
      expiresAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create story', message: err.message });
  }
});

// ============ UPDATE STORY (Owner only) ============
router.put('/:storyId', verifyOwner, async (req, res) => {
  try {
    const { title, image, description, hoursActive, isActive } = req.body;

    const story = await Story.findById(req.params.storyId);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    if (title) story.title = title;
    if (image) story.image = image;
    if (description) story.description = description;
    if (isActive !== undefined) story.isActive = isActive;
    if (hoursActive) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + hoursActive);
      story.expiresAt = expiresAt;
    }

    story.updatedAt = new Date();
    await story.save();

    res.json({ message: '✅ Story updated!', story });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update story', message: err.message });
  }
});

// ============ DELETE STORY (Owner only) ============
router.delete('/:storyId', verifyOwner, async (req, res) => {
  try {
    await Story.findByIdAndDelete(req.params.storyId);
    res.json({ message: '✅ Story deleted!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete story', message: err.message });
  }
});

// ============ VIEW STORY ============
router.post('/:storyId/view', verifyToken, async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    if (!story.viewedBy.includes(req.userId)) {
      story.viewedBy.push(req.userId);
      story.views++;
      await story.save();
    }

    res.json({ message: '✅ View recorded', views: story.views });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record view', message: err.message });
  }
});

export default router;
