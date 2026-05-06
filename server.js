const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server });

function broadcast(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(payload);
  });
}

wss.on('connection', ws => {
  console.log('[WS] Client connected');
  ws.send(JSON.stringify({ event: 'connected', message: 'Real-time updates active' }));
  ws.on('close', () => console.log('[WS] Client disconnected'));
});

taskRoutes.setBroadcast(broadcast);

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`\n🚀 Task Manager API running at http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server running on ws://localhost:${PORT}`);
  console.log(`\n📋 Demo credentials: demo@tasks.com / demo1234\n`);
});