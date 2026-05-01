import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // Conversation ID (combination of two users)
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  
  // Participants
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
  
  // Message Content
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // Message Type
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  
  // Media (if applicable)
  mediaUrl: String,
  
  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Related Order (optional)
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficient querying
messageSchema.index({ conversationId: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);

