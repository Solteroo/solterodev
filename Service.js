import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  // Service Details
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Web Development', 'AI Solutions', 'Design', 'Automation', 'Bot Development', 'Other'],
    required: true
  },
  
  // Pricing
  basePrice: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'TMT'
  },
  
  // Details
  deliveryDays: {
    type: Number,
    default: 7
  },
  features: [String], // Array of features
  
  // Media
  image: {
    type: String,
    default: null
  },
  thumbnail: {
    type: String,
    default: null
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Ratings
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
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

export default mongoose.model('Service', serviceSchema);