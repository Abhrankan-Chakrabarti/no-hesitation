const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/questionflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Make io accessible to routes via middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
const sessionRoutes = require('./routes/session.routes');
const doubtRoutes = require('./routes/doubt.routes');
const confusionRoutes = require('./routes/confusion.routes');
const analyticsRoutes = require('./routes/analytics.routes');

app.use('/api/sessions', sessionRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/confusion', confusionRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`✅ User ${socket.id} joined session ${sessionId}`);
    
    // Notify others in the room
    socket.to(sessionId).emit('user-joined', { socketId: socket.id });
  });

  socket.on('leave-session', (sessionId) => {
    socket.leave(sessionId);
    console.log(`👋 User ${socket.id} left session ${sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
});

module.exports = { app, io };
