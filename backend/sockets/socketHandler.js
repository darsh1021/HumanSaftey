const setupSocketHandlers = (io) => {
  let activeUsers = 0;

  io.on('connection', (socket) => {
    activeUsers++;
    console.log(`[SOCKET] User connected: ${socket.id} | Active Users: ${activeUsers}`);

    // Broadcast updated active users count to all connected clients
    io.emit('systemStatus', {
      type: 'users_count',
      count: activeUsers,
      timestamp: new Date()
    });

    // Optional: Allow clients to explicitly join roles/rooms for granular emit targeting
    socket.on('joinRoom', (room) => {
      // room could be 'admin' or 'viewer'
      socket.join(room);
      console.log(`[SOCKET] User ${socket.id} joined room: ${room}`);
    });

    socket.on('leaveRoom', (room) => {
      socket.leave(room);
      console.log(`[SOCKET] User ${socket.id} left room: ${room}`);
    });

    // Heartbeat setup - Client can ping to keep connection alive or measure latency
    socket.on('ping', (cb) => {
      if(typeof cb === 'function') cb({ status: 'ok', timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
      activeUsers--;
      console.log(`[SOCKET] User disconnected: ${socket.id} | Active Users: ${activeUsers}`);
      
      // Update remaining clients
      io.emit('systemStatus', {
        type: 'users_count',
        count: activeUsers,
        timestamp: new Date()
      });
    });
  });
};

module.exports = setupSocketHandlers;
