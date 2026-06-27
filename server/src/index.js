import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import userRoutes from './routes/users.js';
import menuRoutes from './routes/menus.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

// Import middleware
import authMiddleware from './middleware/auth.js';
import errorHandler from './middleware/errorHandler.js';
import * as paymentController from './controllers/paymentController.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || true,
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection options
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sunland-ordering';
const mongoOptions = {
  // time to attempt server selection before failing
  serverSelectionTimeoutMS: 10000,
  // use the new connection management engine
  useNewUrlParser: true,
  useUnifiedTopology: true
};

async function startServer() {
  try {
    await mongoose.connect(mongoUri, mongoOptions);
    console.log('MongoDB connected');

    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.warn('Continuing to start the HTTP server in degraded mode (DB unavailable).');
    // Start HTTP server anyway so the app can respond with meaningful errors
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (DB not connected)`);
    });
  }
}

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// DB availability middleware: return 503 for API requests if MongoDB not connected
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Service unavailable: database not connected' });
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Backend is working 🚀');
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.post('/api/payments/callback', paymentController.paymentCallback);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// Socket.io for real-time tracking
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Client joined order: ${orderId}`);
  });

  socket.on('update_location', (data) => {
    io.to(`order_${data.orderId}`).emit('location_updated', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server only after the database connection succeeds
startServer();

export default app;