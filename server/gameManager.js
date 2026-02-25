const { v4: uuidv4 } = require('uuid');

const PHASES = {
  LOBBY: 'LOBBY',
  PLAYING: 'PLAYING',
  VOTING: 'VOTING',
  RESULTS: 'RESULTS'
};

class GameManager {
  constructor() {
    this.rooms = new Map();
    // Clean up abandoned rooms every 10 minutes
    setInterval(() => this._cleanupRooms(), 10 * 60 * 1000);
  }

  _cleanupRooms() {
    const now = Date.now();
    for (const [code, room] of this.rooms) {
      const allGone = room.players.every(p => !p.connected);
      const stale = now - room.createdAt > 6 * 60 * 60 * 1000; // 6 hours max
      if (allGone || stale) {
        if (room.timer) clearInterval(room.timer);
        this.rooms.delete(code);
        console.log(`[GC] Removed dead room ${code}`);
      }
    }
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code;
    do {
      code = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(hostSocketId, hostName, locations, timerSeconds = 480, numSpies = 1, maxPlayers = 0) {
    const code = this.generateRoomCode();
    const room = {
      code,
      hostSocketId,
      phase: PHASES.LOBBY,
      timerSeconds,
      numSpies: Math.max(1, Math.min(3, numSpies)),
      maxPlayers: Math.max(0, maxPlayers),
      locations,
      players: [],
      spectators: [],
      chat: [],
      currentRound: null,
      timer: null,
      timeRemaining: 0,
      votes: {},
      handRaises: new Set(),
      scores: {},
      createdAt: Date.now()
    };

    // Add host as player
    room.players.push({
      id: hostSocketId,
      name: hostName,
      isHost: true,
      isSpectator: false,
      connected: true
    });

    this.rooms.set(code, room);
    return room;
  }

  joinRoom(code, socketId, name, asSpectator = false) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };
    if (room.phase !== PHASES.LOBBY && !asSpectator) return { error: 'Game already in progress. Join as spectator?' };
    if (!asSpectator && room.maxPlayers > 0 && room.players.filter(p => p.connected).length >= room.maxPlayers) {
      return { error: `Room is full (max ${room.maxPlayers} players)` };
    }

    const existingPlayer = room.players.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existingPlayer) return { error: 'Name already taken' };

    if (asSpectator) {
      room.spectators.push({ id: socketId, name, connected: true });
    } else {
      room.players.push({ id: socketId, name, isHost: false, isSpectator: false, connected: true });
    }

    return { room, asSpectator };
  }

  leaveRoom(socketId) {
    for (const [code, room] of this.rooms) {
      const playerIdx = room.players.findIndex(p => p.id === socketId);
      const spectatorIdx = room.spectators.findIndex(s => s.id === socketId);

      if (playerIdx !== -1) {
        room.players[playerIdx].connected = false;
        // If host disconnects, reassign
        if (room.players[playerIdx].isHost && room.players.length > 1) {
          const nextHost = room.players.find(p => p.id !== socketId && p.connected);
          if (nextHost) {
            nextHost.isHost = true;
            room.hostSocketId = nextHost.id;
          }
        }
        return { code, room, type: 'player', name: room.players[playerIdx].name };
      }

      if (spectatorIdx !== -1) {
        room.spectators.splice(spectatorIdx, 1);
        return { code, room, type: 'spectator' };
      }
    }
    return null;
  }

  reconnect(socketId, code, name) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };
    const player = room.players.find(p => p.name === name);
    if (!player) return { error: 'Player not found' };
    player.id = socketId;
    player.connected = true;
    if (player.isHost) room.hostSocketId = socketId;
    return { room, player };
  }

  startGame(code, socketId) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };
    if (room.hostSocketId !== socketId) return { error: 'Only the host can start' };
    if (room.players.length < 3) return { error: 'Need at least 3 players' };
    if (room.locations.length === 0) return { error: 'No locations loaded' };

    // Pick a random location
    const location = room.locations[Math.floor(Math.random() * room.locations.length)];
    const roles = Array.from({length: 16}, (_, i) => location[`Role${i+1}`]).filter(Boolean);

    // Shuffle players
    const shuffledPlayers = [...room.players].sort(() => Math.random() - 0.5);

    // Pick N spies (never more than half the players)
    const spyCount = Math.min(room.numSpies || 1, Math.floor(shuffledPlayers.length / 2));
    const spyIndices = new Set();
    while (spyIndices.size < spyCount) {
      spyIndices.add(Math.floor(Math.random() * shuffledPlayers.length));
    }
    const spyIds = new Set([...spyIndices].map(i => shuffledPlayers[i].id));

    // Assign roles — non-spies get roles, spies get nothing
    let roleIndex = 0;
    const assignments = shuffledPlayers.map(player => {
      const isSpy = spyIds.has(player.id);
      const role = isSpy ? null : (roles[roleIndex++ % roles.length] || 'Unknown');
      return {
        playerId: player.id,
        playerName: player.name,
        isSpy,
        location: isSpy ? null : location.Location,
        role
      };
    });

    const spyPlayers = shuffledPlayers.filter(p => spyIds.has(p.id));

    room.currentRound = {
      location: location.Location,
      spies: spyPlayers.map(p => p.id),
      spyNames: spyPlayers.map(p => p.name),
      assignments,
      questionOrder: shuffledPlayers.map(p => p.id),
      currentQuestionerIndex: 0,
      questionTarget: null,
      askedThisRound: [],
    };

    room.phase = PHASES.PLAYING;
    room.votes = {};
    room.handRaises = new Set();
    room.timeRemaining = room.timerSeconds;

    return { room, assignments };
  }

  askQuestion(code, socketId, targetId) {
    const room = this.rooms.get(code);
    if (!room || room.phase !== PHASES.PLAYING) return { error: 'Invalid state' };
    const round = room.currentRound;
    const currentQuestioner = round.questionOrder[round.currentQuestionerIndex];
    if (currentQuestioner !== socketId) return { error: 'Not your turn' };
    if (targetId === socketId) return { error: 'Cannot ask yourself' };

    const asker = room.players.find(p => p.id === socketId);
    const target = room.players.find(p => p.id === targetId);
    if (!target) return { error: 'Target not found' };

    round.questionTarget = targetId;
    round.askedThisRound.push({ askerId: socketId, targetId });

    return {
      event: 'question-asked',
      askerName: asker.name,
      targetName: target.name,
      askerId: socketId,
      targetId
    };
  }

  skipTurn(code, socketId) {
    const room = this.rooms.get(code);
    if (!room || room.phase !== PHASES.PLAYING) return { error: 'Invalid state' };
    const round = room.currentRound;
    const currentQuestioner = round.questionOrder[round.currentQuestionerIndex];
    if (currentQuestioner !== socketId) return { error: 'Not your turn' };

    return this.advanceTurn(code);
  }

  advanceTurn(code) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };
    const round = room.currentRound;
    round.questionTarget = null;

    // Advance to next player
    round.currentQuestionerIndex = (round.currentQuestionerIndex + 1) % round.questionOrder.length;
    const nextQuestioner = room.players.find(p => p.id === round.questionOrder[round.currentQuestionerIndex]);

    return { nextQuestionerId: round.questionOrder[round.currentQuestionerIndex], nextQuestionerName: nextQuestioner?.name };
  }

  raiseHand(code, socketId) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };
    room.handRaises.add(socketId);
    const player = room.players.find(p => p.id === socketId);
    return { playerName: player?.name, count: room.handRaises.size };
  }

  lowerHand(code, socketId) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };
    room.handRaises.delete(socketId);
    const player = room.players.find(p => p.id === socketId);
    return { playerName: player?.name, count: room.handRaises.size };
  }

  startVoting(code, socketId) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };
    if (room.hostSocketId !== socketId) return { error: 'Only host can start voting' };

    if (room.timer) {
      clearInterval(room.timer);
      room.timer = null;
    }

    room.phase = PHASES.VOTING;
    room.votes = {};
    room.handRaises = new Set();
    return { room };
  }

  castVote(code, socketId, targetId) {
    const room = this.rooms.get(code);
    if (!room || room.phase !== PHASES.VOTING) return { error: 'Not in voting phase' };
    if (socketId === targetId) return { error: 'Cannot vote for yourself' };

    room.votes[socketId] = targetId;

    const connectedPlayers = room.players.filter(p => p.connected);
    const allVoted = connectedPlayers.every(p => room.votes[p.id]);

    return { allVoted, voteCount: Object.keys(room.votes).length, total: connectedPlayers.length };
  }

  resolveVotes(code) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };

    const tally = {};
    for (const targetId of Object.values(room.votes)) {
      tally[targetId] = (tally[targetId] || 0) + 1;
    }

    let maxVotes = 0;
    let mostVotedId = null;
    for (const [id, count] of Object.entries(tally)) {
      if (count > maxVotes) { maxVotes = count; mostVotedId = id; }
    }

    const mostVotedPlayer = room.players.find(p => p.id === mostVotedId);
    const spyCaught = room.currentRound.spies.includes(mostVotedId);

    // Award points
    const spyIdSet = new Set(room.currentRound.spies);
    room.players.forEach(p => {
      if (!room.scores[p.name]) room.scores[p.name] = 0;
      if (spyCaught && !spyIdSet.has(p.id)) room.scores[p.name] += 1;   // innocent wins
      if (!spyCaught && spyIdSet.has(p.id)) room.scores[p.name] += 2;   // spy escapes
    });

    room.phase = PHASES.RESULTS;

    return {
      tally,
      mostVotedPlayer: mostVotedPlayer?.name,
      mostVotedId,
      spyCaught,
      spyNames: room.currentRound.spyNames,
      location: room.currentRound.location,
      assignments: room.currentRound.assignments,
      players: room.players
    };
  }

  addChat(code, socketId, message) {
    const room = this.rooms.get(code);
    if (!room) return null;
    const player = room.players.find(p => p.id === socketId) || room.spectators.find(s => s.id === socketId);
    if (!player) return null;

    const msg = {
      id: uuidv4(),
      senderName: player.name,
      senderId: socketId,
      message: message.slice(0, 300),
      timestamp: Date.now(),
      isSpectator: !!room.spectators.find(s => s.id === socketId)
    };
    room.chat.push(msg);
    if (room.chat.length > 200) room.chat.shift();
    return msg;
  }

  resetRoom(code, socketId) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };
    if (room.hostSocketId !== socketId) return { error: 'Only host can reset' };

    if (room.timer) { clearInterval(room.timer); room.timer = null; }

    room.phase = PHASES.LOBBY;
    room.currentRound = null;
    room.votes = {};
    room.handRaises = new Set();
    room.timeRemaining = 0;
    // Remove disconnected players
    room.players = room.players.filter(p => p.connected);
    // scores persist intentionally

    return { room };
  }

  resetScores(code, socketId) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };
    if (room.hostSocketId !== socketId) return { error: 'Only host can reset scores' };
    room.scores = {};
    return { room };
  }

  getPublicRoomState(room) {
    return {
      code: room.code,
      phase: room.phase,
      timerSeconds: room.timerSeconds,
      timeRemaining: room.timeRemaining,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        connected: p.connected
      })),
      spectators: room.spectators.map(s => ({ id: s.id, name: s.name })),
      chat: room.chat.slice(-50),
      handRaises: room.phase === PHASES.PLAYING ? Array.from(room.handRaises).map(id => {
        const p = room.players.find(pl => pl.id === id);
        return p?.name;
      }).filter(Boolean) : [],
      currentQuestioner: room.currentRound
        ? room.players.find(p => p.id === room.currentRound.questionOrder[room.currentRound.currentQuestionerIndex])?.name
        : null,
      questionTarget: room.currentRound
        ? room.players.find(p => p.id === room.currentRound.questionTarget)?.name
        : null,
      votes: room.phase === PHASES.VOTING
        ? { count: Object.keys(room.votes).length, total: room.players.filter(p => p.connected).length }
        : null,
      locations: room.locations.map(l => l.Location),
      numSpies: room.numSpies,
      maxPlayers: room.maxPlayers,
      scores: Object.entries(room.scores || {})
        .sort((a, b) => b[1] - a[1])
        .map(([name, pts]) => ({ name, pts }))
    };
  }
}

module.exports = { GameManager, PHASES };
