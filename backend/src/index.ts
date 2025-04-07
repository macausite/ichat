import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Parse JSON request body
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Define basic API routes
app.get('/', (req, res) => {
  console.log('Health check endpoint accessed');
  res.status(200).json({ 
    status: 'online', 
    message: 'iChat API is running', 
    version: '1.0.1',
    timestamp: new Date().toISOString()
  });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Handle user joining a chat room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });
  
  // Handle incoming messages
  socket.on('send_message', (data) => {
    // Store message in Supabase could be added here
    socket.to(data.roomId).emit('receive_message', data);
  });
  
  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user_typing', {
      userId: data.userId,
      username: data.username,
      isTyping: data.isTyping
    });
  });
  
  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default server;
