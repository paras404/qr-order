const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for now, restrict in production
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('io', io);

// Import Routes
const adminRoutes = require('./routes/adminRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const salesRoutes = require('./routes/salesRoutes');
const tableRoutes = require('./routes/tableRoutes');
const kitchenRoutes = require('./routes/kitchenRoutes');

// Use Routes
app.use('/api/admin', adminRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/sales', salesRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/upload', require('./routes/uploadRoutes'));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Basic Route
app.get('/', (req, res) => {
  res.send('QR Order Backend is Running');
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
