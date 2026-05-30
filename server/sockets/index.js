const jwt = require('jsonwebtoken');

/**
 * Sockets para modo cooperativo / decisões em grupo.
 * Salas simples em memória (para produção, mover para Redis).
 */
const salas = new Map(); // codigoSala -> { membros: Map<socketId,{id,nome}>, votos: Map<escolhaId,Set<socketId>> }

function registrarSockets(io) {
  // autenticação opcional do socket via token
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        socket.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      } catch (_) { /* segue anônimo */ }
    }
    next();
  });

  io.on('connection', (socket) => {
    const nome = socket.user?.nome || 'Convidado';

    socket.on('sala:entrar', ({ codigo }) => {
      if (!codigo) return;
      socket.join(codigo);
      if (!salas.has(codigo)) salas.set(codigo, { membros: new Map(), votos: new Map() });
      const sala = salas.get(codigo);
      sala.membros.set(socket.id, { id: socket.user?.id || null, nome });
      io.to(codigo).emit('sala:atualizada', {
        membros: [...sala.membros.values()],
        total: sala.membros.size,
      });
    });

    // voto numa escolha durante decisão em grupo
    socket.on('sala:votar', ({ codigo, escolhaId }) => {
      const sala = salas.get(codigo);
      if (!sala) return;
      // remove voto anterior deste socket
      for (const set of sala.votos.values()) set.delete(socket.id);
      if (!sala.votos.has(escolhaId)) sala.votos.set(escolhaId, new Set());
      sala.votos.get(escolhaId).add(socket.id);

      const resultado = {};
      for (const [eid, set] of sala.votos.entries()) resultado[eid] = set.size;
      io.to(codigo).emit('sala:votos', { resultado, totalMembros: sala.membros.size });
    });

    // sincroniza avanço de cenário entre membros
    socket.on('sala:avancar', ({ codigo, cenarioId }) => {
      const sala = salas.get(codigo);
      if (sala) sala.votos.clear();
      io.to(codigo).emit('sala:avancar', { cenarioId });
    });

    socket.on('disconnect', () => {
      for (const [codigo, sala] of salas.entries()) {
        if (sala.membros.delete(socket.id)) {
          for (const set of sala.votos.values()) set.delete(socket.id);
          if (sala.membros.size === 0) salas.delete(codigo);
          else io.to(codigo).emit('sala:atualizada', {
            membros: [...sala.membros.values()], total: sala.membros.size,
          });
        }
      }
    });
  });
}

module.exports = { registrarSockets };
