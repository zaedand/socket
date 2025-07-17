const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // bisa disesuaikan ke http://localhost:8000 jika perlu
    methods: ['GET', 'POST']
  }
});
fetch('http://localhost:8000/api/nodes/1/status', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json' // <--- ini penting
  },
  body: JSON.stringify({ status: 'online' })
});

// Simulasi update status secara periodik
const devices = [
  { id: 1, status: 'online' },
  { id: 2, status: 'offline' },
  { id: 3, status: 'partial' }
];

// Emit status update setiap 10 detik
setInterval(() => {
  // Ubah status acak untuk simulasi
  devices.forEach(device => {
    const statuses = ['online', 'offline', 'partial'];
    device.status = statuses[Math.floor(Math.random() * statuses.length)];
  });

  io.emit('device:status-update', devices); // broadcast ke semua client
  console.log('Update dikirim:', devices);
}, 10000);

io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  socket.emit('server:welcome', { message: 'Terhubung ke server realtime', id: socket.id });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Socket.IO server berjalan di http://localhost:3000');
});
