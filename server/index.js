const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const path = require('path');
const fs = require('fs');
const { GameManager, PHASES } = require('./gameManager');
const builtinLocations = require('./builtinLocations');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const gameManager = new GameManager();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 } });

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/public')));

// Load default locations
function loadDefaultLocations() {
  const csvPath = path.join(__dirname, 'defaultLocations.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  return parse(content, { columns: true, skip_empty_lines: true });
}

const defaultLocations = loadDefaultLocations();

// API: Parse CSV upload
app.post('/api/parse-csv', upload.single('csv'), (req, res) => {
  try {
    if (!req.file) return res.json({ locations: defaultLocations });
    const content = req.file.buffer.toString('utf-8').replace(/^\uFEFF/, '');
    const records = parse(content, { columns: true, skip_empty_lines: true });

    // Validate: must have Location column
    if (!records[0]?.Location) {
      return res.status(400).json({ error: 'CSV must have a "Location" column' });
    }

    // Normalize: rename every column after Location to Role1, Role2, … regardless of original name
    const normalized = records.map(row => {
      const result = { Location: row.Location };
      const roleValues = Object.keys(row)
        .filter(k => k !== 'Location')
        .map(k => row[k])
        .filter(Boolean);
      roleValues.forEach((v, i) => { result[`Role${i + 1}`] = v; });
      return result;
    });

    res.json({ locations: normalized, count: normalized.length });
  } catch (e) {
    res.status(400).json({ error: 'Invalid CSV: ' + e.message });
  }
});

// API: Get default locations preview
app.get('/api/defaults', (req, res) => {
  res.json({ locations: defaultLocations, count: defaultLocations.length });
});

// API: Get all built-in locations with roles
app.get('/api/builtin-locations', (req, res) => {
  res.json({ locations: builtinLocations });
});

// ─── Socket.io ───────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[+] Connected: ${socket.id}`);

  // Create room
  // Client sends either locationNames (list of strings, for builtin) or full locations (for CSV)
  socket.on('create-room', ({ name, locationNames, locations, timerSeconds, numSpies, maxPlayers }, cb) => {
    let locs;
    if (locationNames?.length) {
      // Resolve names → full objects server-side (no bloated payload)
      const nameSet = new Set(locationNames);
      locs = builtinLocations.filter(l => nameSet.has(l.Location));
      if (!locs.length) locs = defaultLocations;
    } else {
      locs = locations?.length ? locations : defaultLocations;
    }
    const room = gameManager.createRoom(socket.id, name, locs, timerSeconds || 480, numSpies || 1, maxPlayers || 0);
    socket.join(room.code);
    socket.data.roomCode = room.code;
    socket.data.name = name;
    cb({ success: true, code: room.code, roomState: gameManager.getPublicRoomState(room) });
    console.log(`[Room ${room.code}] Created by ${name}`);
  });

  // Join room
  socket.on('join-room', ({ code, name, asSpectator }, cb) => {
    const result = gameManager.joinRoom(code.toUpperCase(), socket.id, name, asSpectator);
    if (result.error) return cb({ success: false, error: result.error });

    socket.join(code.toUpperCase());
    socket.data.roomCode = code.toUpperCase();
    socket.data.name = name;
    socket.data.isSpectator = result.asSpectator;

    const room = gameManager.rooms.get(code.toUpperCase());
    const roomState = gameManager.getPublicRoomState(room);

    // If reconnecting mid-game, send private role info
    let privateInfo = null;
    if (result.reconnected && room.phase === PHASES.PLAYING && room.currentRound) {
      const assignment = room.currentRound.assignments.find(a => a.playerId === socket.id);
      if (assignment) privateInfo = { isSpy: assignment.isSpy, location: assignment.location, role: assignment.role };
    }

    cb({ success: true, roomState, privateInfo });
    socket.to(code.toUpperCase()).emit('player-joined', {
      name,
      isSpectator: result.asSpectator,
      roomState
    });
    console.log(`[Room ${code}] ${name} joined${result.reconnected ? ' (reconnected)' : ''} (spectator: ${result.asSpectator})`);
  });

  // Reconnect
  socket.on('reconnect-room', ({ code, name }, cb) => {
    const result = gameManager.reconnect(socket.id, code.toUpperCase(), name);
    if (result.error) return cb({ success: false, error: result.error });

    socket.join(code.toUpperCase());
    socket.data.roomCode = code.toUpperCase();
    socket.data.name = name;

    const room = gameManager.rooms.get(code.toUpperCase());
    const roomState = gameManager.getPublicRoomState(room);

    // Send private game info if in progress
    let privateInfo = null;
    if (room.phase === PHASES.PLAYING && room.currentRound) {
      const assignment = room.currentRound.assignments.find(a => a.playerId === socket.id);
      if (assignment) privateInfo = { isSpy: assignment.isSpy, location: assignment.location, role: assignment.role };
    }

    cb({ success: true, roomState, privateInfo });
    socket.to(code.toUpperCase()).emit('player-reconnected', { name, roomState });
  });

  // Start game
  socket.on('start-game', (_, cb) => {
    const code = socket.data.roomCode;
    const result = gameManager.startGame(code, socket.id);
    if (result.error) return cb?.({ success: false, error: result.error });

    const room = gameManager.rooms.get(code);

    // Send each player their private info
    result.assignments.forEach(a => {
      const playerSocket = io.sockets.sockets.get(a.playerId);
      if (playerSocket) {
        playerSocket.emit('your-role', {
          isSpy: a.isSpy,
          location: a.location,
          role: a.role,
          playerName: a.playerName
        });
      }
    });

    // Send spectators the location
    room.spectators.forEach(s => {
      const specSocket = io.sockets.sockets.get(s.id);
      if (specSocket) {
        specSocket.emit('spectator-info', {
          location: room.currentRound.location,
          spyNames: room.currentRound.spyNames,
          assignments: room.currentRound.assignments
        });
      }
    });

    const roomState = gameManager.getPublicRoomState(room);
    io.to(code).emit('game-started', { roomState });

    // Start server-side timer
    startTimer(code);

    cb?.({ success: true });
  });

  // Ask question
  socket.on('ask-question', ({ targetId }, cb) => {
    const code = socket.data.roomCode;
    const result = gameManager.askQuestion(code, socket.id, targetId);
    if (result.error) return cb?.({ success: false, error: result.error });

    const room = gameManager.rooms.get(code);
    io.to(code).emit('question-asked', {
      ...result,
      roomState: gameManager.getPublicRoomState(room)
    });
    cb?.({ success: true });
  });

  // Skip turn
  socket.on('skip-turn', (_, cb) => {
    const code = socket.data.roomCode;
    const result = gameManager.skipTurn(code, socket.id);
    if (result.error) return cb?.({ success: false, error: result.error });

    const room = gameManager.rooms.get(code);
    io.to(code).emit('turn-advanced', {
      ...result,
      roomState: gameManager.getPublicRoomState(room)
    });
    cb?.({ success: true });
  });

  // Raise hand
  socket.on('raise-hand', (_, cb) => {
    const code = socket.data.roomCode;
    const result = gameManager.raiseHand(code, socket.id);
    if (result.error) return cb?.({ success: false, error: result.error });

    const room = gameManager.rooms.get(code);
    io.to(code).emit('hand-raised', {
      ...result,
      roomState: gameManager.getPublicRoomState(room)
    });
    cb?.({ success: true });
  });

  // Lower hand (player lowers their own)
  socket.on('lower-hand', (_, cb) => {
    const code = socket.data.roomCode;
    const result = gameManager.lowerHand(code, socket.id);
    if (result.error) return cb?.({ success: false, error: result.error });

    const room = gameManager.rooms.get(code);
    io.to(code).emit('hand-lowered', {
      ...result,
      roomState: gameManager.getPublicRoomState(room)
    });
    if (room.pendingVote && room.handRaises.size === 0) {
      room.pendingVote = false;
      gameManager.startVoting(code, room.hostSocketId);
      io.to(code).emit('voting-started', {
        roomState: gameManager.getPublicRoomState(room),
        reason: 'All hands resolved — vote begins!'
      });
      startVoteTimer(code);
    }
    cb?.({ success: true });
  });

  // Host lowers a specific player's hand
  socket.on('host-lower-hand', ({ targetId }, cb) => {
    const code = socket.data.roomCode;
    const room = gameManager.rooms.get(code);
    if (!room || room.hostSocketId !== socket.id) return cb?.({ success: false, error: 'Not host' });
    const result = gameManager.lowerHand(code, targetId);
    if (result.error) return cb?.({ success: false, error: result.error });

    io.to(code).emit('hand-lowered', {
      ...result,
      roomState: gameManager.getPublicRoomState(room)
    });
    if (room.pendingVote && room.handRaises.size === 0) {
      room.pendingVote = false;
      gameManager.startVoting(code, room.hostSocketId);
      io.to(code).emit('voting-started', {
        roomState: gameManager.getPublicRoomState(room),
        reason: 'All hands resolved — vote begins!'
      });
      startVoteTimer(code);
    }
    cb?.({ success: true });
  });

  // Grant turn (host only)
  socket.on('grant-turn', ({ targetId }, cb) => {
    const code = socket.data.roomCode;
    const result = gameManager.grantTurn(code, socket.id, targetId);
    if (result.error) return cb?.({ success: false, error: result.error });

    const room = gameManager.rooms.get(code);
    io.to(code).emit('turn-advanced', {
      ...result,
      granted: true,
      roomState: gameManager.getPublicRoomState(room)
    });
    if (room.pendingVote && room.handRaises.size === 0) {
      room.pendingVote = false;
      gameManager.startVoting(code, room.hostSocketId);
      io.to(code).emit('voting-started', {
        roomState: gameManager.getPublicRoomState(room),
        reason: 'All hands resolved — vote begins!'
      });
      startVoteTimer(code);
    }
    cb?.({ success: true });
  });

  // Reset scores
  socket.on('reset-scores', (_, cb) => {
    const code = socket.data.roomCode;
    const result = gameManager.resetScores(code, socket.id);
    if (result.error) return cb?.({ success: false, error: result.error });
    io.to(code).emit('scores-reset', { roomState: gameManager.getPublicRoomState(result.room) });
    cb?.({ success: true });
  });

  // Leave room (intentional)
  socket.on('leave-room', () => {
    const result = gameManager.leaveRoom(socket.id);
    if (result) {
      const { code, room, type, name } = result;
      const roomState = gameManager.getPublicRoomState(room);
      socket.to(code).emit('player-disconnected', { name, type, roomState });
      socket.leave(code);
      socket.data.roomCode = null;
      console.log(`[-] ${name} left room ${code}`);
    }
  });

  // Start voting
  socket.on('start-voting', (_, cb) => {
    const code = socket.data.roomCode;
    const result = gameManager.startVoting(code, socket.id);
    if (result.error) return cb?.({ success: false, error: result.error });

    // Stop game timer, start vote timer
    stopTimer(code);

    io.to(code).emit('voting-started', {
      roomState: gameManager.getPublicRoomState(result.room)
    });

    startVoteTimer(code);
    cb?.({ success: true });
  });

  // Cast vote
  socket.on('cast-vote', ({ targetId }, cb) => {
    const code = socket.data.roomCode;
    const result = gameManager.castVote(code, socket.id, targetId);
    if (result.error) return cb?.({ success: false, error: result.error });

    const room = gameManager.rooms.get(code);
    io.to(code).emit('vote-cast', {
      voteCount: result.voteCount,
      total: result.total,
      roomState: gameManager.getPublicRoomState(room)
    });

    if (result.allVoted) {
      stopVoteTimer(code);
      const resolution = gameManager.resolveVotes(code);
      io.to(code).emit('spy-guess-prompt', { ...resolution, roomState: gameManager.getPublicRoomState(room) });
      startGuessTimer(code);
    }

    cb?.({ success: true });
  });

  // Force end (host only)
  socket.on('force-results', (_, cb) => {
    const code = socket.data.roomCode;
    const room = gameManager.rooms.get(code);
    if (!room || room.hostSocketId !== socket.id) return cb?.({ success: false, error: 'Not host' });
    if (room.phase !== PHASES.VOTING) return cb?.({ success: false, error: 'Not in voting phase' });

    stopVoteTimer(code);
    const resolution = gameManager.resolveVotes(code);
    io.to(code).emit('spy-guess-prompt', { ...resolution, roomState: gameManager.getPublicRoomState(room) });
    startGuessTimer(code);
    cb?.({ success: true });
  });

  // Spy location guess
  socket.on('spy-guess', ({ guessedLocation }, cb) => {
    const code = socket.data.roomCode;
    const result = gameManager.submitSpyGuess(code, socket.id, guessedLocation);
    if (result.error) return cb?.({ success: false, error: result.error });

    stopGuessTimer(code);
    const room = gameManager.rooms.get(code);
    io.to(code).emit('game-over', { ...result, roomState: gameManager.getPublicRoomState(room) });
    cb?.({ success: true });
  });

  // Kick player (host only)
  socket.on('kick-player', ({ targetId }, cb) => {
    const code = socket.data.roomCode;
    const result = gameManager.kickPlayer(code, socket.id, targetId);
    if (result.error) return cb?.({ success: false, error: result.error });

    const { kicked, room } = result;
    // Tell the kicked socket to go home
    const kickedSocket = io.sockets.sockets.get(targetId);
    if (kickedSocket) kickedSocket.emit('you-were-kicked');

    io.to(code).emit('player-kicked', {
      name: kicked.name,
      roomState: gameManager.getPublicRoomState(room)
    });
    cb?.({ success: true });
  });

  // Become player (spectator → player)
  socket.on('become-player', (_, cb) => {
    const code = socket.data.roomCode;
    const result = gameManager.becomePlayer(code, socket.id);
    if (result.error) return cb?.({ success: false, error: result.error });

    socket.data.isSpectator = false;
    io.to(code).emit('room-settings-updated', { roomState: gameManager.getPublicRoomState(result.room) });
    cb?.({ success: true });
  });

  // Become spectator (player → spectator)
  socket.on('become-spectator', (_, cb) => {
    const code = socket.data.roomCode;
    const result = gameManager.becomeSpectator(code, socket.id);
    if (result.error) return cb?.({ success: false, error: result.error });

    socket.data.isSpectator = true;
    io.to(code).emit('room-settings-updated', { roomState: gameManager.getPublicRoomState(result.room) });
    cb?.({ success: true });
  });

  // Host advance turn (skip current player without their input)
  socket.on('host-advance-turn', (_, cb) => {
    const code = socket.data.roomCode;
    const room = gameManager.rooms.get(code);
    if (!room) return cb?.({ success: false, error: 'Room not found' });
    if (room.hostSocketId !== socket.id) return cb?.({ success: false, error: 'Only host can advance turn' });
    if (room.phase !== PHASES.PLAYING) return cb?.({ success: false, error: 'Not in playing phase' });

    const result = gameManager.advanceTurn(code);
    if (result.error) return cb?.({ success: false, error: result.error });

    io.to(code).emit('turn-advanced', { ...result, roomState: gameManager.getPublicRoomState(room) });
    cb?.({ success: true });
  });

  // Chat
  socket.on('chat-message', ({ message }, cb) => {
    const code = socket.data.roomCode;
    const msg = gameManager.addChat(code, socket.id, message);
    if (!msg) return cb?.({ success: false });

    io.to(code).emit('chat-message', msg);
    cb?.({ success: true });
  });

  // Reset room
  socket.on('reset-room', (_, cb) => {
    const code = socket.data.roomCode;
    stopTimer(code);
    stopVoteTimer(code);
    stopGuessTimer(code);
    const result = gameManager.resetRoom(code, socket.id);
    if (result.error) return cb?.({ success: false, error: result.error });

    io.to(code).emit('room-reset', { roomState: gameManager.getPublicRoomState(result.room) });
    cb?.({ success: true });
  });

  // Update room settings (timer, spies, max players) — lobby only, host only
  socket.on('update-room-settings', ({ timerSeconds, numSpies, maxPlayers }, cb) => {
    const code = socket.data.roomCode;
    const room = gameManager.rooms.get(code);
    if (!room) return cb?.({ success: false, error: 'Room not found' });
    if (room.hostSocketId !== socket.id) return cb?.({ success: false, error: 'Not host' });
    if (room.phase !== PHASES.LOBBY) return cb?.({ success: false, error: 'Game in progress' });

    if (typeof timerSeconds === 'number') room.timerSeconds = Math.max(60, Math.min(3600, timerSeconds));
    if (typeof numSpies === 'number') room.numSpies = Math.max(1, Math.min(3, numSpies));
    if (typeof maxPlayers === 'number') room.maxPlayers = Math.max(0, maxPlayers);

    io.to(code).emit('room-settings-updated', { roomState: gameManager.getPublicRoomState(room) });
    cb?.({ success: true });
  });

  // Ready to vote
  socket.on('ready-to-vote', (_, cb) => {
    const code = socket.data.roomCode;
    const result = gameManager.markReadyToVote(code, socket.id);
    if (result.error) return cb?.({ success: false, error: result.error });

    if (result.autoStart) {
      const room = result.room;
      gameManager.startVoting(code, room.hostSocketId);
      stopTimer(code);
      io.to(code).emit('voting-started', {
        roomState: gameManager.getPublicRoomState(room),
        reason: 'Agents ready — vote begins!'
      });
      startVoteTimer(code);
    } else {
      io.to(code).emit('vote-ready-updated', { roomState: gameManager.getPublicRoomState(result.room) });
    }
    cb?.({ success: true });
  });

  // Unready to vote
  socket.on('unready-to-vote', (_, cb) => {
    const code = socket.data.roomCode;
    const result = gameManager.unmarkReadyToVote(code, socket.id);
    if (result.error) return cb?.({ success: false, error: result.error });
    io.to(code).emit('vote-ready-updated', { roomState: gameManager.getPublicRoomState(result.room) });
    cb?.({ success: true });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const result = gameManager.leaveRoom(socket.id);
    if (result) {
      const { code, room, type, name } = result;
      const roomState = gameManager.getPublicRoomState(room);
      io.to(code).emit('player-disconnected', { name, type, roomState });
      console.log(`[-] ${name} disconnected from room ${code}`);
    }
  });
});

// ─── Timer Management ─────────────────────────────────────────────────────────

const timers = new Map();
const voteTimers = new Map();
const guessTimers = new Map();

const VOTE_DURATION = 30;
const GUESS_DURATION = 30;

function startVoteTimer(code) {
  stopVoteTimer(code);
  let timeLeft = VOTE_DURATION;
  io.to(code).emit('vote-timer-tick', { timeRemaining: timeLeft });

  const interval = setInterval(() => {
    const r = gameManager.rooms.get(code);
    if (!r || r.phase !== PHASES.VOTING) { clearInterval(interval); voteTimers.delete(code); return; }

    timeLeft--;
    io.to(code).emit('vote-timer-tick', { timeRemaining: timeLeft });

    if (timeLeft <= 0) {
      clearInterval(interval);
      voteTimers.delete(code);
      const resolution = gameManager.resolveVotes(code);
      io.to(code).emit('spy-guess-prompt', { ...resolution, roomState: gameManager.getPublicRoomState(r) });
      startGuessTimer(code);
    }
  }, 1000);

  voteTimers.set(code, interval);
}

function stopVoteTimer(code) {
  if (voteTimers.has(code)) {
    clearInterval(voteTimers.get(code));
    voteTimers.delete(code);
  }
}

function startGuessTimer(code) {
  stopGuessTimer(code);
  let timeLeft = GUESS_DURATION;
  io.to(code).emit('guess-timer-tick', { timeRemaining: timeLeft });

  const interval = setInterval(() => {
    const r = gameManager.rooms.get(code);
    if (!r || r.phase !== PHASES.SPY_GUESS) { clearInterval(interval); guessTimers.delete(code); return; }

    timeLeft--;
    io.to(code).emit('guess-timer-tick', { timeRemaining: timeLeft });

    if (timeLeft <= 0) {
      clearInterval(interval);
      guessTimers.delete(code);
      r.phase = PHASES.RESULTS;
      io.to(code).emit('game-over', {
        spyCaught: r.currentRound?.spyCaught ?? false,
        awaitingSpyGuess: false,
        guessedLocation: null,
        guessCorrect: false,
        spyNames: r.currentRound?.spyNames,
        location: r.currentRound?.location,
        assignments: r.currentRound?.assignments,
        voteBreakdown: r.currentRound?.voteBreakdown || [],
        voteTally: r.currentRound?.voteTally || [],
        players: r.players,
        roomState: gameManager.getPublicRoomState(r)
      });
    }
  }, 1000);

  guessTimers.set(code, interval);
}

function stopGuessTimer(code) {
  if (guessTimers.has(code)) {
    clearInterval(guessTimers.get(code));
    guessTimers.delete(code);
  }
}

function startTimer(code) {
  stopTimer(code);
  const room = gameManager.rooms.get(code);
  if (!room) return;

  room.timeRemaining = room.timerSeconds;

  const interval = setInterval(() => {
    const r = gameManager.rooms.get(code);
    if (!r || r.phase !== PHASES.PLAYING) { clearInterval(interval); return; }

    r.timeRemaining = Math.max(0, r.timeRemaining - 1);
    io.to(code).emit('timer-tick', { timeRemaining: r.timeRemaining });

    if (r.timeRemaining === 0) {
      clearInterval(interval);
      timers.delete(code);
      if (r.handRaises.size > 0) {
        // Hands are raised — hold off voting until host resolves them
        r.pendingVote = true;
        io.to(code).emit('timer-ended-hands-pending', {
          roomState: gameManager.getPublicRoomState(r),
          handCount: r.handRaises.size
        });
      } else {
        gameManager.startVoting(code, r.hostSocketId);
        io.to(code).emit('voting-started', {
          roomState: gameManager.getPublicRoomState(r),
          reason: 'Time is up!'
        });
        startVoteTimer(code);
      }
    }
  }, 1000);

  timers.set(code, interval);
}

function stopTimer(code) {
  if (timers.has(code)) {
    clearInterval(timers.get(code));
    timers.delete(code);
  }
}

// ─── Start server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🕵️  SpyCraft server running on http://localhost:${PORT}`);
});
