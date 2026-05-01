import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Order Details
  orderId: {
    type: String,
    unique: true,
    required: true,
    default: () => 'ORD-' + Date.now()
  },
  
  // References
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Order Info
  serviceName: String,
  description: String,
  budget: Number,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Payment
  amount: Number,
  paid: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['tmt', 'card', 'other'],
    default: 'tmt'
  },
  
  // Delivery
  startDate: Date,
  deliveryDate: Date,
  deadline: Date,
  
  // Messages
  messages: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      message: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  
  // Tracking
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);

