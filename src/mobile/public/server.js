const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*' },
  // Allow large EEG payloads
  maxHttpBufferSize: 1e6,
});

// ── In-memory session registry ──────────────────────────────────
// sessions[sessionId] = { meta, frameBuffer, hostSocket }
const sessions = new Map();

// ── Static viewer page ───────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// Viewer page route — any path like /view/session_123...
app.get('/view/:sessionId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewer.html'));
});

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// ── Socket.IO namespaces ─────────────────────────────────────────
//
//   /host   — Flutter app connects here to PUSH frames
//   /view   — Browsers connect here to RECEIVE frames
//

// ════════════════════════════════════════════════════════════════
// HOST namespace  (Flutter app)
// ════════════════════════════════════════════════════════════════
const hostNs = io.of('/host');

hostNs.on('connection', (socket) => {
  let mySessionId = null;

  console.log(`[HOST] Connected: ${socket.id}`);

  // Flutter sends this first to register the session
  socket.on('register', (data) => {
    mySessionId = data.sessionId;

    sessions.set(mySessionId, {
      meta:        data.meta ?? {},
      hostSocket:  socket.id,
      frameBuffer: [],      // keep last N frames for late joiners
    });

    console.log(`[HOST] Registered session: ${mySessionId}`);

    // Acknowledge back to Flutter
    socket.emit('registered', {
      sessionId:  mySessionId,
      viewerUrl:  `${data.baseUrl}/view/${mySessionId}`,
    });
  });

  // Flutter sends EEG/fNIRS frames here
  socket.on('frame', (payload) => {
    if (!mySessionId) return;
    const sess = sessions.get(mySessionId);
    if (!sess) return;

    // Keep a rolling buffer of last 500 frames for late-joining viewers
    sess.frameBuffer.push(payload);
    if (sess.frameBuffer.length > 500) sess.frameBuffer.shift();

    // Broadcast to all viewers watching this session
    io.of('/view')
      .to(`session:${mySessionId}`)
      .emit('frame', payload);
  });

  // Host broadcasts a named event marker
  socket.on('event', (payload) => {
    if (!mySessionId) return;
    io.of('/view')
      .to(`session:${mySessionId}`)
      .emit('event', payload);
    console.log(`[HOST] Event: ${payload.name} @ ${payload.ts}`);
  });

  socket.on('disconnect', () => {
    if (mySessionId) {
      const sess = sessions.get(mySessionId);
      if (sess) {
        // Notify viewers the host disconnected
        io.of('/view')
          .to(`session:${mySessionId}`)
          .emit('host_disconnected');

        // Keep session for 30s so viewers see "ended" state
        setTimeout(() => sessions.delete(mySessionId), 30_000);
      }
      console.log(`[HOST] Disconnected session: ${mySessionId}`);
    }
  });
});

// ════════════════════════════════════════════════════════════════
// VIEWER namespace  (browsers)
// ════════════════════════════════════════════════════════════════
const viewNs = io.of('/view');

viewNs.on('connection', (socket) => {
  console.log(`[VIEW] Browser connected: ${socket.id}`);

  socket.on('join', (data) => {
    const sid = data.sessionId;
    const sess = sessions.get(sid);

    socket.join(`session:${sid}`);
    console.log(`[VIEW] Joined session: ${sid}`);

    if (!sess) {
      socket.emit('error', { message: 'Session not found or ended' });
      return;
    }

    // Send session meta immediately
    socket.emit('meta', sess.meta);

    // Replay buffered frames so viewer sees recent history
    if (sess.frameBuffer.length > 0) {
      socket.emit('replay', sess.frameBuffer);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[VIEW] Browser disconnected: ${socket.id}`);
  });
});

// ── Count viewers for a session (host can poll this) ────────────
app.get('/api/viewers/:sessionId', async (req, res) => {
  const room  = `session:${req.params.sessionId}`;
  const socks = await io.of('/view').in(room).allSockets();
  res.json({ count: socks.size });
});

// ── Start ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 NeuroStream relay running on port ${PORT}`);
});