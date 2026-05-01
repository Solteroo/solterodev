import express from 'express';
import { Gift, Transaction } from './Gift.js';
import User from './User.js';
import { verifyToken, verifyOwner } from './jwt-middleware.js';

const router = express.Router();

// ============ GET ALL GIFTS ============
router.get('/', async (req, res) => {
  try {
    const gifts = await Gift.find({ isActive: true }).sort({ price: 1 });
    res.json({ total: gifts.length, gifts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gifts', message: err.message });
  }
});

// ============ CREATE GIFT (Owner only) ============
router.post('/create', verifyOwner, async (req, res) => {
  try {
    const { name, description, image, emoji, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'name and price required' });
    }

    const gift = new Gift({
      name,
      description,
      image,
      emoji,
      price,
      createdBy: req.userId
    });

    await gift.save();

    res.status(201).json({ message: '✅ Gift created!', gift });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create gift', message: err.message });
  }
});

// ============ UPDATE GIFT (Owner only) ============
router.put('/:giftId', verifyOwner, async (req, res) => {
  try {
    const gift = await Gift.findByIdAndUpdate(
      req.params.giftId,
      { ...req.body },
      { new: true }
    );
    if (!gift) return res.status(404).json({ error: 'Gift not found' });
    res.json({ message: '✅ Gift updated!', gift });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update gift', message: err.message });
  }
});

// ============ DELETE GIFT (Owner only) ============
router.delete('/:giftId', verifyOwner, async (req, res) => {
  try {
    await Gift.findByIdAndDelete(req.params.giftId);
    res.json({ message: '✅ Gift deleted!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete gift', message: err.message });
  }
});

// ============ SEND GIFT (User → User) ============
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { giftId, recipientId, message } = req.body;

    if (!giftId || !recipientId) {
      return res.status(400).json({ error: 'giftId and recipientId required' });
    }

    // Get gift
    const gift = await Gift.findById(giftId);
    if (!gift) return res.status(404).json({ error: 'Gift not found' });

    // Get sender
    const sender = await User.findById(req.userId);
    if (!sender) return res.status(404).json({ error: 'Sender not found' });

    // Check balance
    if (sender.tmtBalance < gift.price) {
      return res.status(400).json({
        error: 'Insufficient TMT balance',
        balance: sender.tmtBalance,
        required: gift.price
      });
    }

    // Get recipient
    const recipient = await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ error: 'Recipient not found' });

    // Deduct TMT from sender
    sender.tmtBalance -= gift.price;
    await sender.save();

    // Create transaction
    const transaction = new Transaction({
      sender: req.userId,
      recipient: recipientId,
      gift: giftId,
      tmtAmount: gift.price,
      message,
      status: 'completed',
      completedAt: new Date()
    });

    await transaction.save();

    res.json({
      message: `✅ Gift "${gift.name}" sent to ${recipient.username}!`,
      transaction,
      newBalance: sender.tmtBalance
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send gift', message: err.message });
  }
});

// ============ GET MY GIFT HISTORY ============
router.get('/history', verifyToken, async (req, res) => {
  try {
    const sent = await Transaction.find({ sender: req.userId })
      .populate('gift', 'name emoji image price')
      .populate('recipient', 'name username profilePicture')
      .sort({ createdAt: -1 });

    const received = await Transaction.find({ recipient: req.userId })
      .populate('gift', 'name emoji image price')
      .populate('sender', 'name username profilePicture')
      .sort({ createdAt: -1 });

    res.json({ sent, received });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history', message: err.message });
  }
});

// ============ REQUEST TMT FROM OWNER ============
router.post('/request-tmt', verifyToken, async (req, res) => {
  try {
    const { amount, reason } = req.body;

    if (!amount) return res.status(400).json({ error: 'amount required' });

    // This creates a message to owner (will integrate with messages)
    res.json({
      message: `✅ TMT request sent to owner!`,
      requested: amount,
      reason: reason || 'TMT request',
      status: 'pending',
      note: 'Owner will review and add TMT to your account'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to request TMT', message: err.message });
  }
});

export default router;
