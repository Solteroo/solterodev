import mongoose from 'mongoose';

const giftSchema = new mongoose.Schema({
  // Gift Details
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  
  // Pricing
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'TMT'
  },
  
  // Media
  image: {
    type: String,
    required: true
  },
  emoji: {
    type: String,
    default: '🎁'
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Owner Reference
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Tracking
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Gift Transfer Schema (separate collection could be better, but keeping it simple)
const giftTransferSchema = new mongoose.Schema({
  // References
  giftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gift',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Details
  amount: {
    type: Number,
    default: 1
  },
  message: {
    type: String,
    default: ''
  },
  
  // Status
  status: {
    type: String,
    enum: ['sent', 'received', 'cancelled'],
    default: 'sent'
  },
  
  // Tracking
  sentAt: {
    type: Date,
    default: Date.now
  },
  receivedAt: Date
}, { timestamps: true });

export const Gift = mongoose.model('Gift', giftSchema);
export const GiftTransfer = mongoose.model('GiftTransfer', giftTransferSchema);

