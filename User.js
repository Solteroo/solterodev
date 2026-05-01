import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6
  },
  
  // Profile
  profilePicture: {
    type: String, // Gmail URL or uploaded
    default: null
  },
  bio: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  
  // Financial
  tmtBalance: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  
  // Roles & Status
  role: {
    type: String,
    enum: ['user', 'admin', 'vip'],
    default: 'user'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  
  // OAuth
  googleId: String,
  googleEmail: String,
  
  // Friends & Network
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  
  // Tracking
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
}, { timestamps: true });

export default mongoose.model('User', userSchema);
