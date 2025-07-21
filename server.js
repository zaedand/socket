const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // ganti dengan 'http://localhost:8000' jika ingin membatasi
    methods: ['GET', 'POST', 'PUT']
  }
});

// Dummy devices
let devices = [
  { id: 1, name: 'PBX Kantor', endpoint: '/api/nodes/1', status: 'online' },
  { id: 2, name: 'Gateway Gedung A', endpoint: '/api/nodes/2', status: 'offline' },
  { id: 3, name: 'Server IPBX', endpoint: '/api/nodes/3', status: 'partial' },
];

// Fungsi random status
function randomStatus() {
  const options = ['online', 'offline', 'partial'];
  return options[Math.floor(Math.random() * options.length)];
}

// Emit update status ke semua client setiap 10 detik
setInterval(() => {
  devices = devices.map(device => ({
    ...device,
    status: randomStatus(),
    timestamp: new Date().toISOString()
  }));

  console.log('[Emit] Update status:', devices);
  io.emit('device:status-update', devices); // broadcast ke semua client
}, 10000);

// Untuk debugging
app.get('/devices', (req, res) => {
  res.json(devices);
});

// Socket.IO event
io.on('connection', socket => {
  console.log('[Socket.IO] Client connected:', socket.id);

  // Kirim data awal saat koneksi
  socket.emit('device:status-update', devices);

  socket.on('disconnect', () => {
    console.log('[Socket.IO] Client disconnected:', socket.id);
  });
});

// Jalankan server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO server berjalan di http://localhost:${PORT}`);
});
