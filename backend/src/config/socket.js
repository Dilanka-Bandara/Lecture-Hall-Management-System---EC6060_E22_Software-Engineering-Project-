const { Server } = require('socket.io');

let io;
// A map to store which user ID belongs to which socket connection
const connectedUsers = new Map();

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:5173", // Your Vite frontend URL
        methods: ["GET", "POST", "PATCH", "DELETE"]
      }
    });

    io.on('connection', (socket) => {
      // When a user logs in, the frontend will send their ID here
      socket.on('register', (userId) => {
        connectedUsers.set(userId, socket.id);
      });

      // Clean up when they close the tab
      socket.on('disconnect', () => {
        for (const [userId, socketId] of connectedUsers.entries()) {
          if (socketId === socket.id) connectedUsers.delete(userId);
        }
      });
    });
    return io;
  },
  
  // Call this function from any service to push a real-time alert
  notifyUser: (userId, notificationData) => {
    const socketId = connectedUsers.get(userId);
    if (socketId && io) {
      io.to(socketId).emit('new_notification', notificationData);
    }
  }
};