import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './auth.js';
import usersRoutes from './users.js';
import servicesRoutes from './services.js';
import messagesRoutes from './messages.js';
import ordersRoutes from './orders.js';
import storiesRoutes from './stories.js';
import giftsRoutes from './gifts.js';
import adminRoutes from './admin.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));

// ============ DATABASE CONNECTION ============
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://user:pass@cluster.mongodb.net/solterodev');
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};

connectDB();

// ============ BASIC ROUTES ============
app.get('/api/health', (req, res) => {
  res.json({
    status: '✅ Server is running!',
    message: 'Soltero Dev API',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'
  });
});

// ============ AUTH ROUTES ============
app.use('/api/auth', authRoutes);

// ============ USERS ROUTES ============
app.use('/api/users', usersRoutes);

// ============ SERVICES ROUTES ============
app.use('/api/services', servicesRoutes);

// ============ MESSAGES ROUTES ============
app.use('/api/messages', messagesRoutes);

// ============ ORDERS ROUTES ============
app.use('/api/orders', ordersRoutes);

// ============ STORIES ROUTES ============
app.use('/api/stories', storiesRoutes);

// ============ GIFTS ROUTES ============
app.use('/api/gifts', giftsRoutes);

// ============ ADMIN ROUTES ============
app.use('/api/admin', adminRoutes);

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    error: 'Server Error',
    message: err.message
  });
});

// ============ 404 HANDLER ============
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 SOLTERO DEV SERVER STARTED 🚀     ║
╠════════════════════════════════════════╣
║  📍 URL: http://localhost:${PORT}        ║
║  🗄️  Database: MongoDB Atlas            ║
║  ⚡ Status: Ready                       ║
╚════════════════════════════════════════╝
  `);
});
