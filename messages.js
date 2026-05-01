import express from 'express';
import Message from './Message.js';
import { verifyToken, verifyAdmin } from './jwt-middleware.js';

const router = express.Router();

// ============ SEND MESSAGE ============
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { recipientId, text, orderId } = req.body;

    if (!recipientId || !text) {
      return res.status(400).json({ error: 'recipientId and text required' });
    }

    const message = new Message({
      sender: req.userId,
      recipient: recipientId,
      text,
      order: orderId || null
    });

    await message.save();

    const populated = await message.populate([
      { path: 'sender', select: 'name username profilePicture role vipStatus' },
      { path: 'recipient', select: 'name username profilePicture role vipStatus' }
    ]);

    res.status(201).json({
      message: '✅ Message sent!',
      data: populated
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message', message: err.message });
  }
});

// ============ GET CONVERSATION ============
router.get('/conversation/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: req.userId, recipient: userId },
        { sender: userId, recipient: req.userId }
      ]
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('sender', 'name username profilePicture role vipStatus')
      .populate('recipient', 'name username profilePicture role vipStatus');

    // Mark as read
    await Message.updateMany(
      { sender: userId, recipient: req.userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      messages: messages.reverse(),
      page: parseInt(page),
      hasMore: messages.length === parseInt(limit)
    });
  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({ error: 'Failed to fetch messages', message: err.message });
  }
});

// ============ GET ALL CONVERSATIONS (Inbox) ============
router.get('/inbox', verifyToken, async (req, res) => {
  try {
    // Get unique conversations
    const messages = await Message.find({
      $or: [
        { sender: req.userId },
        { recipient: req.userId }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name username profilePicture role vipStatus')
      .populate('recipient', 'name username profilePicture role vipStatus');

    // Group by conversation partner
    const conversations = {};
    messages.forEach(msg => {
      const partnerId = msg.sender._id.toString() === req.userId
        ? msg.recipient._id.toString()
        : msg.sender._id.toString();

      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          partner: msg.sender._id.toString() === req.userId ? msg.recipient : msg.sender,
          lastMessage: msg,
          unreadCount: 0
        };
      }

      if (!msg.isRead && msg.recipient._id.toString() === req.userId) {
        conversations[partnerId].unreadCount++;
      }
    });

    res.json({
      conversations: Object.values(conversations)
    });
  } catch (err) {
    console.error('Get inbox error:', err);
    res.status(500).json({ error: 'Failed to fetch inbox', message: err.message });
  }
});

// ============ CHECK NEW MESSAGES (Polling) ============
router.get('/check-new', verifyToken, async (req, res) => {
  try {
    const { lastCheck } = req.query;

    const since = lastCheck ? new Date(lastCheck) : new Date(Date.now() - 30000);

    const newMessages = await Message.find({
      recipient: req.userId,
      createdAt: { $gt: since },
      isRead: false
    })
      .populate('sender', 'name username profilePicture role vipStatus')
      .sort({ createdAt: 1 });

    res.json({
      hasNew: newMessages.length > 0,
      count: newMessages.length,
      messages: newMessages,
      checkedAt: new Date()
    });
  } catch (err) {
    console.error('Check new messages error:', err);
    res.status(500).json({ error: 'Failed to check messages', message: err.message });
  }
});

// ============ UNREAD COUNT ============
router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.userId,
      isRead: false
    });

    res.json({ unreadCount: count });
  } catch (err) {
    console.error('Unread count error:', err);
    res.status(500).json({ error: 'Failed to get unread count', message: err.message });
  }
});

// ============ DELETE MESSAGE (Admin only) ============
router.delete('/:messageId', verifyAdmin, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.messageId);

    res.json({ message: '✅ Message deleted' });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ error: 'Failed to delete message', message: err.message });
  }
});

export default router;
