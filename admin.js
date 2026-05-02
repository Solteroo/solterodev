import express from 'express';
import User from './User.js';
import Service from './Service.js';
import Order from './Order.js';
import Message from './Message.js';
import Story from './Story.js';
import { Gift, Transaction } from './Gift.js';
import { verifyOwner, verifyAdmin } from './jwt-middleware.js';

const router = express.Router();

// ============ DASHBOARD STATS ============
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalServices,
      totalOrders,
      totalMessages,
      activeStories,
      totalGifts,
      totalTransactions,
      pendingOrders,
      completedOrders
    ] = await Promise.all([
      User.countDocuments(),
      Service.countDocuments(),
      Order.countDocuments(),
      Message.countDocuments(),
      Story.countDocuments({ isActive: true }),
      Gift.countDocuments(),
      Transaction.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'completed' })
    ]);

    res.json({
      users: {
        total: totalUsers,
        vip: await User.countDocuments({ vipStatus: { $ne: 'normal' } }),
        blocked: await User.countDocuments({ isBlocked: true })
      },
      services: { total: totalServices },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        inProgress: await Order.countDocuments({ status: 'in-progress' })
      },
      messages: { total: totalMessages },
      stories: { active: activeStories },
      gifts: { total: totalGifts },
      transactions: { total: totalTransactions }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats', message: err.message });
  }
});

// ============ SITE SETTINGS (Owner only) ============
const siteSettings = {
  siteName: 'Soltero Dev',
  logoText: 'Soltero',
  logoSubtext: 'Dev',
  primaryColor: '#d4af37',
  secondaryColor: '#0a0a0a',
  about: 'Professional Portfolio + Marketplace Platform',
  contactEmail: 'yrejepov1@gmail.com',
  contactPhone: '+99361403543',
  imoNumber: '+918826816148',
  defaultTMT: 100, // Auto TMT for new users
  languages: ['tm', 'uz', 'ru', 'en'],
  defaultLanguage: 'tm'
};

router.get('/settings', verifyOwner, (req, res) => {
  res.json(siteSettings);
});

router.put('/settings', verifyOwner, (req, res) => {
  Object.assign(siteSettings, req.body);
  res.json({ message: '✅ Settings updated!', settings: siteSettings });
});

// ============ MANAGE USERS ============
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, vipStatus } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (vipStatus) query.vipStatus = vipStatus;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      total,
      page: parseInt(page),
      users
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', message: err.message });
  }
});

// ============ BULK TMT DISTRIBUTION ============
router.post('/bulk-tmt', verifyOwner, async (req, res) => {
  try {
    const { userIds, amount, reason } = req.body;

    if (!userIds || !amount) {
      return res.status(400).json({ error: 'userIds and amount required' });
    }

    await User.updateMany(
      { _id: { $in: userIds } },
      { $inc: { tmtBalance: amount } }
    );

    res.json({
      message: `✅ Added ${amount} TMT to ${userIds.length} users`,
      count: userIds.length,
      amount,
      reason: reason || 'Bulk distribution'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to distribute TMT', message: err.message });
  }
});

// ============ DELETE USER (Owner only) ============
router.delete('/users/:userId', verifyOwner, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Clean up user data
    await Promise.all([
      Message.deleteMany({ $or: [{ sender: req.params.userId }, { recipient: req.params.userId }] }),
      Order.deleteMany({ $or: [{ buyer: req.params.userId }, { seller: req.params.userId }] }),
      Transaction.deleteMany({ $or: [{ sender: req.params.userId }, { recipient: req.params.userId }] })
    ]);

    res.json({ message: '✅ User and related data deleted!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user', message: err.message });
  }
});

// ============ RECENT ACTIVITY ============
router.get('/activity', verifyAdmin, async (req, res) => {
  try {
    const [recentOrders, recentMessages, recentUsers] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(10)
        .populate('buyer', 'name username profilePicture')
        .populate('service', 'title'),
      Message.find().sort({ createdAt: -1 }).limit(10)
        .populate('sender', 'name username profilePicture')
        .populate('recipient', 'name username profilePicture'),
      User.find().sort({ createdAt: -1 }).limit(10).select('-password')
    ]);

    res.json({
      recentOrders,
      recentMessages,
      recentUsers
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity', message: err.message });
  }
});

// ============ EXPORT DATA (Owner only) ============
router.get('/export/:type', verifyOwner, async (req, res) => {
  try {
    const { type } = req.params;

    let data;
    switch (type) {
      case 'users':
        data = await User.find().select('-password');
        break;
      case 'orders':
        data = await Order.find().populate('buyer seller service');
        break;
      case 'messages':
        data = await Message.find().populate('sender recipient');
        break;
      case 'transactions':
        data = await Transaction.find().populate('sender recipient gift');
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    res.json({
      type,
      count: data.length,
      exportedAt: new Date(),
      data
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to export data', message: err.message });
  }
});

// ============ CLEANUP EXPIRED STORIES (Cron job) ============
router.post('/cleanup-stories', verifyOwner, async (req, res) => {
  try {
    const result = await Story.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    res.json({
      message: '✅ Expired stories cleaned up!',
      deleted: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cleanup stories', message: err.message });
  }
});

// ============ GLOBAL ANNOUNCEMENT ============
router.post('/announcement', verifyOwner, async (req, res) => {
  try {
    const { title, message, type } = req.body;

    // This would typically send notifications to all users
    // For now, we'll create a special story that acts as announcement

    const announcement = new Story({
      title,
      description: message,
      image: '/announcement.png', // default announcement image
      owner: req.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    await announcement.save();

    res.json({
      message: '✅ Announcement published!',
      announcement
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create announcement', message: err.message });
  }
});

export default router;
