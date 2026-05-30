require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const { errorHandler, notFound } = require('./server/middlewares/error');
const { registrarSockets } = require('./server/sockets');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] },
});

// ---------- Middlewares globais ----------
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disponibiliza io aos controllers, se preciso
app.set('io', io);

// ---------- Estáticos ----------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'client')));

// ---------- Rotas API ----------
app.use('/api/auth', require('./server/routes/auth.routes'));
app.use('/api/jogo', require('./server/routes/jogo.routes'));
app.use('/api', require('./server/routes/admin.routes'));

app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// ---------- Sockets ----------
registrarSockets(io);

// ---------- Erros ----------
app.use('/api', notFound);

// SPA fallback: rotas não-API e não-arquivo devolvem o index.html
// (permite acessar /validar/:codigo diretamente pela URL)
app.get(/^\/(?!api|uploads).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, () => {
  console.log(`\n🎭 Assédio em Cena rodando em http://localhost:${PORT}`);
  console.log(`   API:      http://localhost:${PORT}/api/health`);
  console.log(`   Sockets:  ativos\n`);
});

module.exports = { app, server, io };
