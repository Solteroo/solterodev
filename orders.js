import express from 'express';
import Order from './Order.js';
import Service from './Service.js';
import { verifyToken, verifyOwner, verifyAdmin } from './jwt-middleware.js';

const router = express.Router();

// Generate unique order ID
const generateOrderId = () => {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// ============ CREATE ORDER ============
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { serviceId, description, requirements } = req.body;

    if (!serviceId) {
      return res.status(400).json({ error: 'serviceId required' });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + service.deliveryTime);

    const order = new Order({
      orderId: generateOrderId(),
      service: serviceId,
      buyer: req.userId,
      seller: service.owner,
      amount: service.price,
      currency: service.currency,
      description,
      requirements,
      deliveryDate
    });

    await order.save();

    const populated = await order.populate([
      { path: 'service', select: 'title category price' },
      { path: 'buyer', select: 'name username profilePicture' },
      { path: 'seller', select: 'name username profilePicture' }
    ]);

    res.status(201).json({
      message: '✅ Order created successfully!',
      order: populated
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order', message: err.message });
  }
});

// ============ GET MY ORDERS (Buyer) ============
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.userId })
      .populate('service', 'title category price image')
      .populate('seller', 'name username profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      total: orders.length,
      orders
    });
  } catch (err) {
    console.error('Get my orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders', message: err.message });
  }
});

// ============ GET INCOMING ORDERS (Seller/Owner) ============
router.get('/incoming', verifyOwner, async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.userId })
      .populate('service', 'title category price image')
      .populate('buyer', 'name username profilePicture email')
      .sort({ createdAt: -1 });

    res.json({
      total: orders.length,
      orders
    });
  } catch (err) {
    console.error('Get incoming orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders', message: err.message });
  }
});

// ============ GET ORDER BY ID ============
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('service', 'title category price image deliveryTime')
      .populate('buyer', 'name username profilePicture email')
      .populate('seller', 'name username profilePicture');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only buyer or seller can view
    if (
      order.buyer._id.toString() !== req.userId &&
      order.seller._id.toString() !== req.userId
    ) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: 'Failed to fetch order', message: err.message });
  }
});

// ============ UPDATE ORDER STATUS (Owner/Admin) ============
router.put('/:orderId/status', verifyOwner, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        status,
        updatedAt: new Date(),
        completedAt: status === 'completed' ? new Date() : undefined
      },
      { new: true }
    ).populate('service buyer seller');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      message: `✅ Order status updated to ${status}`,
      order
    });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Failed to update order', message: err.message });
  }
});

// ============ GET ALL ORDERS (Admin) ============
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('service', 'title category price')
      .populate('buyer', 'name username profilePicture')
      .populate('seller', 'name username profilePicture')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      total,
      page: parseInt(page),
      orders
    });
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders', message: err.message });
  }
});

export default router;
