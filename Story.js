import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  // Story Content
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Media
  image: {
    type: String,
    required: true
  },
  imageUrl: String,
  
  // Owner Reference
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Timing
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: true // Auto-delete after this time
  },
  duration: {
    type: Number,
    default: 24 // hours
  },
  
  // Type
  storyType: {
    type: String,
    enum: ['announcement', 'promotion', 'update', 'other'],
    default: 'announcement'
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  
  // Link (optional)
  link: String,
  
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

// TTL Index - Auto delete story after endTime
storySchema.index({ endTime: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Story', storySchema);

