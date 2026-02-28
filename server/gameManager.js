const { v4: uuidv4 } = require('uuid');

const PHASES = {
  LOBBY: 'LOBBY',
  PLAYING: 'PLAYING',
  VOTING: 'VOTING',
  SPY_GUESS: 'SPY_GUESS',
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
      readyToVote: new Set(),
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

    const existingPlayer = !asSpectator && room.players.find(p => p.name.toLowerCase() === name.toLowerCase());

    // Allow a disconnected player to rejoin using their original name
    if (existingPlayer && !existingPlayer.connected) {
      const oldSocketId = existingPlayer.id;
      existingPlayer.id = socketId;
      existingPlayer.connected = true;
      if (existingPlayer.isHost) room.hostSocketId = socketId;
      if (room.currentRound) {
        const assignment = room.currentRound.assignments.find(a => a.playerId === oldSocketId);
        if (assignment) assignment.playerId = socketId;
        const qIdx = room.currentRound.questionOrder.indexOf(oldSocketId);
        if (qIdx !== -1) room.currentRound.questionOrder[qIdx] = socketId;
      }
      return { room, asSpectator: false, reconnected: true };
    }

    if (existingPlayer && existingPlayer.connected) return { error: 'Name already taken' };
    if (room.phase !== PHASES.LOBBY && !asSpectator) return { error: 'Game already in progress. Join as spectator?' };
    if (!asSpectator && room.maxPlayers > 0 && room.players.filter(p => p.connected).length >= room.maxPlayers) {
      return { error: `Room is full (max ${room.maxPlayers} players)` };
    }

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
    const oldSocketId = player.id;
    player.id = socketId;
    player.connected = true;
    if (player.isHost) room.hostSocketId = socketId;
    // Update round references so role reveal and turn tracking still work
    if (room.currentRound) {
      const assignment = room.currentRound.assignments.find(a => a.playerId === oldSocketId);
      if (assignment) assignment.playerId = socketId;
      const qIdx = room.currentRound.questionOrder.indexOf(oldSocketId);
      if (qIdx !== -1) room.currentRound.questionOrder[qIdx] = socketId;
    }
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
    room.readyToVote = new Set();
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

  grantTurn(code, hostSocketId, targetId) {
    const room = this.rooms.get(code);
    if (!room || room.phase !== PHASES.PLAYING) return { error: 'Invalid state' };
    if (room.hostSocketId !== hostSocketId) return { error: 'Only host can grant turn' };

    const round = room.currentRound;
    const idx = round.questionOrder.indexOf(targetId);
    if (idx === -1) return { error: 'Player not in question order' };

    round.currentQuestionerIndex = idx;
    round.questionTarget = null;
    room.handRaises.delete(targetId);

    const player = room.players.find(p => p.id === targetId);
    return { nextQuestionerId: targetId, nextQuestionerName: player?.name };
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
    room.readyToVote = new Set();
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

    const spyIdSet = new Set(room.currentRound.spies);

    // Build vote breakdown (all connected players, including those who skipped)
    const voteBreakdown = room.players.filter(p => p.connected).map(p => {
      const targetId = room.votes[p.id];
      if (!targetId) return { voterName: p.name, votedForName: null, votedForSpy: false, skipped: true };
      const voted = room.players.find(pl => pl.id === targetId);
      return { voterName: p.name, votedForName: voted?.name || '?', votedForSpy: spyIdSet.has(targetId), skipped: false };
    });

    const voteTally = Object.entries(tally).map(([id, count]) => {
      const player = room.players.find(p => p.id === id);
      return { name: player?.name || '?', votes: count, isSpy: spyIdSet.has(id) };
    }).sort((a, b) => b.votes - a.votes);

    if (spyCaught) {
      // Agents win: 2 pts each — spy still gets to guess for a consolation point
      room.players.forEach(p => {
        if (!room.scores[p.name]) room.scores[p.name] = 0;
        if (!spyIdSet.has(p.id)) room.scores[p.name] += 2;
      });
    } else {
      // Spy survives: 2 pts. Agents who voted correctly get +1 consolation point.
      room.players.forEach(p => {
        if (!room.scores[p.name]) room.scores[p.name] = 0;
        if (spyIdSet.has(p.id)) {
          room.scores[p.name] += 2;
        } else if (room.votes[p.id] && spyIdSet.has(room.votes[p.id])) {
          room.scores[p.name] += 1;
        }
      });
    }

    room.currentRound.spyCaught = spyCaught;
    room.currentRound.voteBreakdown = voteBreakdown;
    room.currentRound.voteTally = voteTally;
    room.phase = PHASES.SPY_GUESS;

    const base = {
      tally,
      voteTally,
      voteBreakdown,
      mostVotedPlayer: mostVotedPlayer?.name,
      mostVotedId,
      spyCaught,
      spyNames: room.currentRound.spyNames,
      location: room.currentRound.location,
      assignments: room.currentRound.assignments,
      players: room.players
    };

    return { ...base, awaitingSpyGuess: true, locations: room.locations.map(l => l.Location) };
  }

  submitSpyGuess(code, socketId, guessedLocation) {
    const room = this.rooms.get(code);
    if (!room || room.phase !== PHASES.SPY_GUESS) return { error: 'Invalid state' };

    const spyIdSet = new Set(room.currentRound.spies);
    if (!spyIdSet.has(socketId)) return { error: 'Only the spy can guess' };

    const correct = guessedLocation === room.currentRound.location;
    if (correct) {
      room.players.forEach(p => {
        if (spyIdSet.has(p.id)) room.scores[p.name] = (room.scores[p.name] || 0) + 1;
      });
    }

    room.phase = PHASES.RESULTS;

    return {
      spyCaught: room.currentRound.spyCaught ?? false,
      awaitingSpyGuess: false,
      guessedLocation,
      guessCorrect: correct,
      spyNames: room.currentRound.spyNames,
      location: room.currentRound.location,
      assignments: room.currentRound.assignments,
      voteBreakdown: room.currentRound.voteBreakdown || [],
      voteTally: room.currentRound.voteTally || [],
      players: room.players
    };
  }

  kickPlayer(code, hostSocketId, targetId) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };
    if (room.hostSocketId !== hostSocketId) return { error: 'Only host can kick' };

    const idx = room.players.findIndex(p => p.id === targetId);
    if (idx === -1) return { error: 'Player not found' };
    if (room.players[idx].isHost) return { error: 'Cannot kick the host' };

    const kicked = room.players[idx];
    room.players.splice(idx, 1);
    delete room.scores[kicked.name];

    // If mid-game, remove from question order and advance turn if needed
    if (room.currentRound) {
      const qo = room.currentRound.questionOrder;
      const qIdx = qo.indexOf(targetId);
      if (qIdx !== -1) {
        const wasCurrent = qo[room.currentRound.currentQuestionerIndex] === targetId;
        qo.splice(qIdx, 1);
        if (room.currentRound.currentQuestionerIndex >= qo.length) {
          room.currentRound.currentQuestionerIndex = 0;
        } else if (wasCurrent) {
          // stay at same index — now points to the next player after removal
        }
        // Clear vote if any
        delete room.votes[targetId];
        // Remove from assignments
        room.currentRound.assignments = room.currentRound.assignments.filter(a => a.playerId !== targetId);
      }
    }

    return { kicked, room };
  }

  becomePlayer(code, socketId) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };
    if (room.phase !== PHASES.LOBBY) return { error: 'Can only switch roles in lobby' };

    const specIdx = room.spectators.findIndex(s => s.id === socketId);
    if (specIdx === -1) return { error: 'Not a spectator' };

    if (room.maxPlayers > 0 && room.players.filter(p => p.connected).length >= room.maxPlayers) {
      return { error: `Room is full (max ${room.maxPlayers} players)` };
    }

    const spec = room.spectators.splice(specIdx, 1)[0];
    room.players.push({ id: spec.id, name: spec.name, isHost: false, isSpectator: false, connected: true });
    return { room };
  }

  becomeSpectator(code, socketId) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };
    if (room.phase !== PHASES.LOBBY) return { error: 'Can only switch roles in lobby' };

    const playerIdx = room.players.findIndex(p => p.id === socketId);
    if (playerIdx === -1) return { error: 'Not a player' };
    if (room.players[playerIdx].isHost) return { error: 'Host cannot become spectator' };

    const player = room.players.splice(playerIdx, 1)[0];
    delete room.scores[player.name];
    room.spectators.push({ id: player.id, name: player.name, connected: true });
    return { room };
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
    room.readyToVote = new Set();
    room.timeRemaining = 0;
    // Remove disconnected players
    room.players = room.players.filter(p => p.connected);
    // scores persist intentionally

    return { room };
  }

  markReadyToVote(code, socketId) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };
    if (room.phase !== PHASES.PLAYING) return { error: 'Not in playing phase' };
    room.readyToVote.add(socketId);
    const connectedPlayers = room.players.filter(p => p.connected);
    const threshold = Math.max(1, connectedPlayers.length - room.numSpies);
    const readyCount = room.readyToVote.size;
    const autoStart = readyCount >= threshold;
    return { readyCount, threshold, autoStart, room };
  }

  unmarkReadyToVote(code, socketId) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };
    room.readyToVote.delete(socketId);
    const connectedPlayers = room.players.filter(p => p.connected);
    const threshold = Math.max(1, connectedPlayers.length - room.numSpies);
    const readyCount = room.readyToVote.size;
    return { readyCount, threshold, room };
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
        return p ? { id: p.id, name: p.name } : null;
      }).filter(Boolean) : [],
      currentQuestioner: room.currentRound
        ? room.players.find(p => p.id === room.currentRound.questionOrder[room.currentRound.currentQuestionerIndex])?.name
        : null,
      questionTarget: room.currentRound
        ? room.players.find(p => p.id === room.currentRound.questionTarget)?.name
        : null,
      votes: room.phase === PHASES.VOTING
        ? { count: Object.keys(room.votes).length, total: room.players.filter(p => p.connected).length, votedIds: Object.keys(room.votes) }
        : null,
      readyToVote: room.phase === PHASES.PLAYING ? Array.from(room.readyToVote) : [],
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
