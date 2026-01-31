const express = require('express');
const https = require('https');
const fs = require('fs');
const { Server } = require('socket.io');
const path = require('path');

const app = express();

// SSL/TLS Configuration
const options = {
  key: fs.readFileSync(path.join(__dirname, 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
};

const server = https.createServer(options, app);
const io = new Server(server);

// ========================================
// STATIC ACCESS CODE
// ========================================
const ACCESS_CODE = "T0-PiProjector";

const ROOM = "lab";
let activeSharingClient = null;
let receiverSocket = null;

// ========================================
// RATE LIMITING SYSTEM
// ========================================
const RATE_LIMIT_WINDOW_MS = 20000; // 20 seconds
const MAX_ATTEMPTS = 6;
const LOCKOUT_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const attemptTracking = new Map();

function recordAttempt(clientIP) {
  if (!attemptTracking.has(clientIP)) {
    attemptTracking.set(clientIP, { attempts: [], lockedUntil: null });
  }
  
  const record = attemptTracking.get(clientIP);
  const now = Date.now();
  
  record.attempts = record.attempts.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  
  record.attempts.push(now);
  
  if (record.attempts.length >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    console.log(`[SECURITY] IP ${clientIP} LOCKED OUT until ${new Date(record.lockedUntil)}`);
  }
}

function isRateLimited(clientIP) {
  if (!attemptTracking.has(clientIP)) return false;
  
  const record = attemptTracking.get(clientIP);
  const now = Date.now();
  
  if (record.lockedUntil && now < record.lockedUntil) {
    return true;
  }
  
  if (record.lockedUntil && now >= record.lockedUntil) {
    record.lockedUntil = null;
    record.attempts = [];
  }
  
  record.attempts = record.attempts.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  
  return record.attempts.length >= MAX_ATTEMPTS;
}

function resetAttempts(clientIP) {
  if (attemptTracking.has(clientIP)) {
    attemptTracking.set(clientIP, { attempts: [], lockedUntil: null });
  }
}

// Middleware
app.use(express.json());

// CORS headers for cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.static(path.join(__dirname, 'static')));

// Routes
app.get('/', (req, res) => {
  res.redirect('/client/index.html');
});

app.get('/client', (req, res) => {
  res.redirect('/client/index.html');
});

app.get('/youwi11nevergetme', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'host', 'mainindex.html'));
});

// Add this route before the socket.io connection
app.get('/api/network-info', (req, res) => {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    
    // Find the WiFi interface IP
    let ip = 'localhost';
    
    // Check wlan0 (typical Raspberry Pi WiFi interface)
    if (networkInterfaces.wlan0) {
        const wlan = networkInterfaces.wlan0.find(iface => 
            iface.family === 'IPv4' && !iface.internal
        );
        if (wlan) ip = wlan.address;
    }
    
    // Fallback: check all interfaces
    if (ip === 'localhost') {
        Object.keys(networkInterfaces).forEach(interfaceName => {
            networkInterfaces[interfaceName].forEach(iface => {
                if (iface.family === 'IPv4' && !iface.internal) {
                    ip = iface.address;
                }
            });
        });
    }
    
    res.json({ 
        ip: ip,
        hostname: os.hostname(),
        interfaces: Object.keys(networkInterfaces)
    });
});
// ========================================
// SECURE VALIDATION ENDPOINT
// ========================================
app.post('/validate-code', (req, res) => {
  const { code } = req.body;
  const clientIP = req.ip;
  
  console.log(`[AUTH] Code validation from ${clientIP}: ${code}`);
  
  // Rate limit check
  if (isRateLimited(clientIP)) {
    console.log(`[SECURITY] Rate limited: ${clientIP}`);
    return res.status(429).json({ 
      valid: false, 
      message: 'Too many attempts. Wait 5 minutes.' 
    });
  }
  
  // Verify code (case-insensitive)
  if (code.toUpperCase() === ACCESS_CODE.toUpperCase()) {
    console.log(`[AUTH] VALID CODE from ${clientIP}`);
    resetAttempts(clientIP);
    res.json({ 
      valid: true, 
      message: 'Access granted' 
    });
  } else {
    console.log(`[AUTH] INVALID CODE from ${clientIP}: ${code} (expected: ${ACCESS_CODE})`);
    recordAttempt(clientIP);
    res.json({ 
      valid: false, 
      message: 'Incorrect access code. Check projector screen.' 
    });
  }
});

// API for receiver to get access code
app.get('/api/current-code', (req, res) => {
  res.json({ 
    code: ACCESS_CODE
  });
});

// ========================================
// SOCKET.IO SIGNALING (WebRTC logic)
// ========================================
io.on('connection', (socket) => {
  console.log(`[SOCKET] Client connected: ${socket.id}`);

  // Receiver registration
  socket.on('join-as-receiver', () => {
    receiverSocket = socket;
    socket.join(ROOM);
    console.log(`[SOCKET] Receiver registered: ${socket.id}`);
    
    // Send access code to receiver
    socket.emit('code-update', { 
      code: ACCESS_CODE
    });
    
    if (activeSharingClient) {
      socket.emit('sharing-active', { active: true });
    }
  });

  // Handle client joining
  socket.on('join', (room) => {
    if (room !== ROOM) {
      socket.emit('error', { message: 'Invalid room' });
      return;
    }
    socket.join(room);
    console.log(`[SOCKET] Client ${socket.id} joined room: ${room}`);
  });

  // Request current code (fallback)
  socket.on('request-code', () => {
    if (socket === receiverSocket) {
      socket.emit('code-update', { 
        code: ACCESS_CODE
      });
    }
  });

  // Handle offer from sharing client
  socket.on('offer', ({ room, sdp }) => {
    if (room !== ROOM) return;
    
    // Only allow one active sharer
    if (activeSharingClient && activeSharingClient !== socket.id) {
      socket.emit('error', { message: 'Another user is already sharing' });
      return;
    }
    
    activeSharingClient = socket.id;
    console.log(`[WEBRTC] Offer received from ${socket.id}`);
    
    // Forward offer to receiver
    if (receiverSocket) {
      receiverSocket.emit('offer', sdp);
      receiverSocket.emit('sharing-started');
    }
    
    // Notify all clients that sharing is active
    io.to(ROOM).emit('sharing-active', { active: true });
  });

  // Handle answer from receiver
  socket.on('answer', ({ room, sdp }) => {
    console.log(`[WEBRTC] Answer received from receiver`);
    
    // Forward answer to the active sharing client
    if (activeSharingClient) {
      io.to(activeSharingClient).emit('answer', sdp);
    }
  });

  // Handle ICE candidates
  socket.on('ice-candidate', ({ room, candidate }) => {
    console.log(`[WEBRTC] ICE candidate from ${socket.id}`);
    socket.to(room).emit('ice-candidate', candidate);
  });

  // Handle stop sharing
  socket.on('stop-sharing', () => {
    if (socket.id === activeSharingClient) {
      console.log(`[WEBRTC] Client ${socket.id} stopped sharing`);
      activeSharingClient = null;
      
      // Notify receiver and all clients
      io.to(ROOM).emit('sharing-stopped');
      if (receiverSocket) {
        receiverSocket.emit('sharing-active', { active: false });
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    
    if (socket.id === activeSharingClient) {
      activeSharingClient = null;
      
      io.to(ROOM).emit('sharing-stopped');
      if (receiverSocket) {
        receiverSocket.emit('sharing-active', { active: false });
      }
    }
    
    if (socket === receiverSocket) {
      receiverSocket = null;
      console.log('[SOCKET] Receiver disconnected');
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] Secure signaling server running on port ${PORT}`);
  console.log(`[INFO] Client URL: https://10.42.0.1:${PORT}/client/index.html`);
  console.log(`[INFO] Host/Receiver URL: https://localhost:${PORT}/host/index.html`);
  console.log(`[INFO] Using HTTPS with SSL/TLS certificates`);
  console.log(`[INFO] Access Code: ${ACCESS_CODE}`);
  console.log(`[SECURITY] Rate limiting: ${MAX_ATTEMPTS} attempts / ${RATE_LIMIT_WINDOW_MS/1000}s`);
});