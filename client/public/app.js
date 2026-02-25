// ─── Sounds (Web Audio API — 100% client-side, zero server load) ──────────────
const SFX = (() => {
  let ctx = null;
  let muted = false;
  let ambientRunning = false;
  let ambientMaster = null;
  let ambientNodes = [];

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function tone(freq, type, start, dur, vol = 0.18) {
    if (muted) return;
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, c.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
    osc.start(c.currentTime + start);
    osc.stop(c.currentTime + start + dur + 0.01);
  }

  function startAmbient() {
    if (ambientRunning) return;
    ambientRunning = true;
    const c = getCtx();

    const master = c.createGain();
    master.gain.value = 0;
    master.connect(c.destination);
    ambientMaster = master;

    // Slow fade in over 6 seconds (only if not muted)
    if (!muted) master.gain.linearRampToValueAtTime(0.09, c.currentTime + 6);

    // Two slightly detuned bass oscillators — natural beating creates slow pulse
    [[55, 0.45], [55.4, 0.35], [110, 0.18]].forEach(([freq, vol]) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.value = vol;
      osc.connect(g);
      g.connect(master);
      osc.start();
      ambientNodes.push(osc);
    });
  }

  function stopAmbient() {
    if (!ambientRunning) return;
    ambientRunning = false;
    if (ambientMaster) {
      const c = getCtx();
      ambientMaster.gain.setTargetAtTime(0, c.currentTime, 0.5);
      setTimeout(() => {
        ambientNodes.forEach(n => { try { n.stop(); } catch(e) {} });
        ambientNodes = [];
        ambientMaster = null;
      }, 1500);
    }
  }

  return {
    join()      { tone(520, 'sine', 0, 0.12); tone(780, 'sine', 0.1, 0.12); },
    start()     { [440,554,659,880].forEach((f,i) => tone(f,'square',i*0.08,0.18,0.12)); },
    yourTurn()  { tone(880,'sine',0,0.08); tone(1100,'sine',0.07,0.14); },
    question()  { tone(440,'sine',0,0.1,0.1); },
    handRaise() { tone(660,'sine',0,0.1); tone(990,'sine',0.08,0.1); },
    timerWarn() { tone(880,'square',0,0.06,0.1); tone(880,'square',0.15,0.06,0.1); },
    vote()      { tone(330,'sine',0,0.15,0.12); },
    // Enhanced game-end sounds
    caught()    {
      [880,780,660,550,440,330].forEach((f,i) => tone(f,'sawtooth',i*0.09,0.22,0.1));
      tone(110, 'sine', 0.55, 0.7, 0.15);
    },
    escaped()   {
      [330,415,494,587,659,784,880].forEach((f,i) => tone(f,'sine',i*0.07,0.2,0.1));
      tone(880, 'triangle', 0.52, 0.5, 0.12);
    },
    leave()     { tone(330,'sine',0,0.15,0.1); tone(220,'sine',0.1,0.2,0.1); },
    click()     { tone(900, 'sine', 0, 0.035, 0.055); },
    startAmbient,
    stopAmbient,
    toggleMute() {
      muted = !muted;
      if (ambientMaster) {
        ambientMaster.gain.setTargetAtTime(muted ? 0 : 0.09, getCtx().currentTime, 0.4);
      }
      return muted;
    },
    isMuted() { return muted; },
  };
})();

// ─── Global click sound + ambient bootstrap ────────────────────────────────────
let _ambientStarted = false;
document.addEventListener('click', (e) => {
  if (e.target.closest('button, [onclick]')) {
    SFX.click();
    if (!_ambientStarted) {
      _ambientStarted = true;
      SFX.startAmbient();
    }
  }
}, true);

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  socket: null,
  myId: null,
  myName: null,
  roomCode: null,
  roomState: null,
  privateInfo: null,    // { isSpy, location, role }
  isSpectator: false,
  hasVoted: false,
  timerSeconds: 480,
  timerRemaining: 0,
  timerTotal: 480,
  loadedLocations: null,      // for CSV mode
  selectedCsvLocNames: new Set(), // for CSV mode selection
  selectedLocNames: new Set(), // for picker mode
  locationSource: 'picker',    // 'picker' | 'csv'
  allBuiltinLocations: [],
  numSpies: 1,
  maxPlayers: 8,
  hasRaisedHand: false,
  isHost: false,
};

// ─── Socket ───────────────────────────────────────────────────────────────────
function connectSocket() {
  const socket = io({ autoConnect: true, reconnectionAttempts: 10 });
  state.socket = socket;

  socket.on('connect', () => {
    state.myId = socket.id;
    // Reconnect if we had a room
    const saved = sessionStorage.getItem('spycraft-session');
    if (saved) {
      const { code, name } = JSON.parse(saved);
      socket.emit('reconnect-room', { code, name }, (res) => {
        if (res.success) {
          state.myName = name;
          state.roomCode = code;
          state.roomState = res.roomState;
          if (res.privateInfo) state.privateInfo = res.privateInfo;
          state.isHost = !!res.roomState.players.find(p => p.id === socket.id && p.isHost);
          navigateToPhase(res.roomState.phase);
        } else {
          sessionStorage.removeItem('spycraft-session');
        }
      });
    }
  });

  socket.on('player-joined', ({ roomState }) => { updateRoomState(roomState); SFX.join(); });
  socket.on('player-disconnected', ({ roomState }) => updateRoomState(roomState));
  socket.on('player-reconnected', ({ roomState }) => { updateRoomState(roomState); SFX.join(); });
  socket.on('timer-updated', ({ roomState }) => updateRoomState(roomState));

  socket.on('game-started', ({ roomState }) => {
    state.roomState = roomState;
    state.hasRaisedHand = false;
    showScreen('playing');
    renderPlayingScreen();
    resetRoleReveal();
    SFX.start();
    addSystemChat('all', 'Mission started!');
  });

  socket.on('your-role', ({ isSpy, location, role }) => {
    state.privateInfo = { isSpy, location, role };
    renderRoleCard();
  });

  socket.on('spectator-info', ({ location, spyNames, assignments }) => {
    state.privateInfo = { isSpectator: true, location, spyNames, assignments };
  });

  socket.on('question-asked', ({ askerName, targetName, roomState }) => {
    updateRoomState(roomState);
    SFX.question();
    // Play yourTurn sound if it's now my turn to answer
    if (targetName === state.myName) SFX.yourTurn();
    addSystemChat('all', `${askerName} is asking ${targetName}...`);
    renderTurnState();
  });

  socket.on('turn-advanced', ({ nextQuestionerName, roomState }) => {
    updateRoomState(roomState);
    if (nextQuestionerName === state.myName) SFX.yourTurn();
    renderTurnState();
  });

  socket.on('hand-raised', ({ playerName, roomState }) => {
    updateRoomState(roomState);
    renderHandRaises();
    SFX.handRaise();
    addSystemChat('all', `✋ ${playerName} raised their hand`);
  });

  socket.on('hand-lowered', ({ playerName, roomState }) => {
    updateRoomState(roomState);
    renderHandRaises();
    addSystemChat('all', `${playerName} lowered their hand`);
  });

  socket.on('timer-tick', ({ timeRemaining }) => {
    state.timerRemaining = timeRemaining;
    if (timeRemaining === 60 || timeRemaining === 30) SFX.timerWarn();
    renderTimer();
  });

  socket.on('voting-started', ({ roomState, reason }) => {
    state.roomState = roomState;
    state.hasVoted = false;
    showScreen('voting');
    renderVotingScreen();
    SFX.yourTurn();
    if (reason) addSystemChat('vote', reason);
    addSystemChat('vote', 'Voting phase started!');
  });

  socket.on('vote-cast', ({ voteCount, total, roomState }) => {
    updateRoomState(roomState);
    SFX.vote();
    document.getElementById('vote-progress').textContent = `${voteCount} / ${total} voted`;
  });

  socket.on('game-over', (result) => {
    result.spyCaught ? SFX.caught() : SFX.escaped();
    renderResultsScreen(result);
    showScreen('results');
  });

  socket.on('room-reset', ({ roomState }) => {
    state.roomState = roomState;
    state.privateInfo = null;
    state.hasVoted = false;
    state.hasRaisedHand = false;
    showScreen('lobby');
    renderLobby();
  });

  socket.on('scores-reset', ({ roomState }) => {
    updateRoomState(roomState);
  });

  socket.on('chat-message', (msg) => {
    appendChatMsg(msg, 'all');
    appendChatMsg(msg, 'play');
    appendChatMsg(msg, 'vote');
  });
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${name}`).classList.add('active');
}

function navigateToPhase(phase) {
  const map = { LOBBY: 'lobby', PLAYING: 'playing', VOTING: 'voting', RESULTS: 'results' };
  showScreen(map[phase] || 'lobby');
  if (phase === 'LOBBY') renderLobby();
  if (phase === 'PLAYING') renderPlayingScreen();
  if (phase === 'VOTING') renderVotingScreen();
}

function updateRoomState(roomState) {
  state.roomState = roomState;
  const phase = roomState.phase;
  if (phase === 'LOBBY') renderLobby();
  if (phase === 'PLAYING') renderPlayingScreen();
  if (phase === 'VOTING') renderVotingScreen();
}

// ─── Lobby Rendering ──────────────────────────────────────────────────────────
function renderLobby() {
  const rs = state.roomState;
  document.getElementById('lobby-code').textContent = state.roomCode;
  document.getElementById('player-count').textContent =
    `${rs.players.filter(p=>p.connected).length} agent${rs.players.length !== 1 ? 's' : ''}${rs.spectators.length ? ` · ${rs.spectators.length} watching` : ''}`;

  // Locations — clickable tags that open the roles modal
  const locList = document.getElementById('locations-list');
  locList.innerHTML = rs.locations.map(l => {
    const src = state.allBuiltinLocations.find(b => b.Location === l)
             || state.loadedLocations?.find(c => c.Location === l);
    const roles = src ? Array.from({length: 16}, (_, i) => src[`Role${i+1}`]).filter(Boolean) : [];
    const rolesEncoded = roles.length ? esc(roles.join('||')) : '';
    return rolesEncoded
      ? `<span class="location-tag location-tag-clickable" data-loc="${esc(l)}" data-roles="${rolesEncoded}">${esc(l)}</span>`
      : `<span class="location-tag">${esc(l)}</span>`;
  }).join('');

  // Delegate click for lobby location tags
  locList.onclick = (e) => {
    const tag = e.target.closest('.location-tag-clickable');
    if (!tag) return;
    showLocInfoModal(tag.dataset.loc, tag.dataset.roles.split('||').filter(Boolean));
  };

  // Players
  const grid = document.getElementById('lobby-players');
  grid.innerHTML = rs.players.map(p => `
    <div class="player-tile ${p.isHost ? 'host' : ''} ${!p.connected ? 'disconnected' : ''}">
      <div class="player-tile-dot"></div>
      <div class="player-tile-name">${esc(p.name)}</div>
      <div class="player-tile-badge">${p.isHost ? 'HOST' : 'AGENT'}</div>
    </div>
  `).join('') + rs.spectators.map(s => `
    <div class="player-tile">
      <div class="player-tile-dot" style="background:var(--amber)"></div>
      <div class="player-tile-name">${esc(s.name)}</div>
      <div class="player-tile-badge" style="color:var(--amber)">SPECTATOR</div>
    </div>
  `).join('');

  // Timer display
  document.getElementById('lobby-timer-display').textContent = `Timer: ${formatTime(rs.timerSeconds)}`;

  // Scoreboard
  const scoreWrap = document.getElementById('scoreboard-wrap');
  const scoreList = document.getElementById('scoreboard-list');
  const scores = rs.scores || [];
  if (scores.length > 0) {
    scoreWrap.classList.remove('hidden');
    scoreList.innerHTML = scores.map((s, i) => `
      <div class="score-row ${i === 0 ? 'score-top' : ''}">
        <span class="score-rank">${i + 1}</span>
        <span class="score-name">${esc(s.name)}</span>
        <span class="score-pts">${s.pts} pt${s.pts !== 1 ? 's' : ''}</span>
      </div>
    `).join('');
    document.getElementById('btn-reset-scores').classList.toggle('hidden', !state.isHost);
  } else {
    scoreWrap.classList.add('hidden');
  }

  // Host vs guest controls
  state.isHost = !!rs.players.find(p => p.id === state.myId && p.isHost);
  if (state.isHost) {
    document.getElementById('host-controls').classList.remove('hidden');
    document.getElementById('guest-waiting').classList.add('hidden');
    // Highlight active timer btn
    document.querySelectorAll('.btn-timer-sm').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.sec) === rs.timerSeconds);
    });
  } else {
    document.getElementById('host-controls').classList.add('hidden');
    document.getElementById('guest-waiting').classList.remove('hidden');
  }
}

// ─── Playing Screen ───────────────────────────────────────────────────────────
function renderPlayingScreen() {
  const rs = state.roomState;
  state.timerTotal = rs.timerSeconds;
  renderRoleCard();
  renderTurnState();
  renderActionPlayers();
  renderHandRaises();

  // Show/hide controls
  const isCurrent = rs.currentQuestioner === state.myName;
  document.getElementById('btn-skip-turn').classList.toggle('hidden', !isCurrent);
  document.getElementById('host-vote-control').classList.toggle('hidden', !state.isHost);
}

function renderRoleCard() {
  const info = state.privateInfo;
  if (!info) return;
  if (info.isSpy) {
    document.getElementById('role-location').textContent = '???';
    document.getElementById('role-location').className = 'role-location spy-hidden';
    document.getElementById('role-name').textContent = 'YOU ARE THE SPY';
    document.getElementById('role-label').textContent = 'CLASSIFIED';
  } else if (info.isSpectator) {
    document.getElementById('role-location').textContent = info.location || '---';
    document.getElementById('role-name').textContent = `Spy: ${(info.spyNames || []).join(', ')}`;
    document.getElementById('role-label').textContent = 'SPECTATOR VIEW';
  } else {
    document.getElementById('role-location').textContent = info.location || '---';
    document.getElementById('role-location').className = 'role-location';
    document.getElementById('role-name').textContent = info.role || '---';
    document.getElementById('role-label').textContent = 'YOUR LOCATION & ROLE';
  }
}

function leaveRoom() {
  SFX.leave();
  state.socket.emit('leave-room');
  sessionStorage.removeItem('spycraft-session');
  state.roomCode = null;
  state.roomState = null;
  state.privateInfo = null;
  state.hasVoted = false;
  state.hasRaisedHand = false;
  state.isHost = false;
  showScreen('home');
}

function resetRoleReveal() {
  const overlay = document.getElementById('role-reveal-overlay');
  const inner = document.getElementById('role-card-inner');
  if (!overlay || !inner) return;
  overlay.classList.remove('hidden');
  inner.classList.add('blurred');
  overlay.onclick = () => {
    overlay.classList.add('hidden');
    inner.classList.remove('blurred');
  };
}

function renderTurnState() {
  const rs = state.roomState;
  if (!rs) return;

  const turnText = document.getElementById('turn-text');
  const isMeTurn = rs.currentQuestioner === state.myName;

  turnText.innerHTML = isMeTurn
    ? `<strong>YOUR TURN</strong> — choose someone to question`
    : `<strong>${esc(rs.currentQuestioner || '...')}</strong>'s turn to ask`;

  const qtDisplay = document.getElementById('question-target-display');
  if (rs.questionTarget) {
    qtDisplay.classList.remove('hidden');
    document.getElementById('qt-asker').textContent = rs.currentQuestioner;
    document.getElementById('qt-target').textContent = rs.questionTarget;
  } else {
    qtDisplay.classList.add('hidden');
  }

  // Refresh action grid turn highlights
  renderActionPlayers();

  const isCurrent = rs.currentQuestioner === state.myName;
  document.getElementById('btn-skip-turn').classList.toggle('hidden', !isCurrent);
}

function renderActionPlayers() {
  const rs = state.roomState;
  if (!rs) return;
  const grid = document.getElementById('action-players');
  const isMeTurn = rs.currentQuestioner === state.myName;

  grid.innerHTML = rs.players.map(p => {
    const isMe = p.id === state.myId;
    const isCurrent = p.name === rs.currentQuestioner;
    const isTarget = p.name === rs.questionTarget;
    const canAsk = isMeTurn && !isMe && p.connected;

    return `
      <div class="action-player ${isMe ? 'self' : ''} ${isCurrent ? 'current-turn' : ''} ${isTarget ? 'being-asked' : ''} ${!canAsk && !isMe ? 'disabled' : ''}"
           ${canAsk ? `onclick="askPlayer('${p.id}')"` : ''}
           data-id="${p.id}">
        <div class="ap-name">${esc(p.name)}</div>
        <div class="ap-label">${isMe ? 'YOU' : isCurrent ? 'ASKING' : isTarget ? 'ANSWERING' : p.connected ? 'AGENT' : 'OFFLINE'}</div>
      </div>
    `;
  }).join('');
}

function renderHandRaises() {
  const rs = state.roomState;
  if (!rs) return;
  const el = document.getElementById('hands-raised');
  if (!rs.handRaises || rs.handRaises.length === 0) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = `<div class="section-label" style="width:100%;margin-bottom:0">HANDS UP:</div>` +
    rs.handRaises.map(n => `<span class="hand-chip">✋ ${esc(n)}</span>`).join('');
}

function renderTimer() {
  const t = state.timerRemaining;
  const text = document.getElementById('timer-text');
  const prog = document.getElementById('timer-prog');

  text.textContent = formatTime(t);

  const total = state.timerTotal || state.roomState?.timerSeconds || 480;
  const fraction = Math.max(0, t / total);
  const circumference = 276.46;
  prog.style.strokeDashoffset = circumference * (1 - fraction);

  if (t <= 60) {
    prog.style.stroke = 'var(--red)';
    text.style.color = 'var(--red)';
  } else if (t <= 180) {
    prog.style.stroke = 'var(--amber)';
    text.style.color = 'var(--amber)';
  } else {
    prog.style.stroke = 'var(--red)';
    text.style.color = 'var(--text)';
  }
}

// ─── Voting Screen ────────────────────────────────────────────────────────────
function renderVotingScreen() {
  const rs = state.roomState;
  const grid = document.getElementById('voting-grid');

  grid.innerHTML = rs.players.map(p => {
    const isMe = p.id === state.myId;
    return `
      <div class="vote-card ${isMe ? 'self' : ''} ${state.hasVoted ? 'voted' : ''}"
           ${!isMe && !state.hasVoted ? `onclick="castVote('${p.id}')"` : ''}
           data-id="${p.id}">
        <div class="vote-card-name">${esc(p.name)}</div>
        ${isMe ? '<div style="font-size:0.6rem;font-family:var(--font-mono);color:var(--text-muted)">CANNOT VOTE YOURSELF</div>' : ''}
      </div>
    `;
  }).join('');

  document.getElementById('vote-progress').textContent =
    rs.votes ? `${rs.votes.count} / ${rs.votes.total} voted` : '';

  document.getElementById('host-force-results').classList.toggle('hidden', !state.isHost);
  document.getElementById('voting-sub').textContent = state.hasVoted
    ? 'Vote cast. Waiting for others...'
    : 'Select who you think is the spy';
}

// ─── Results Screen ───────────────────────────────────────────────────────────
function renderResultsScreen(result) {
  const verdict = document.getElementById('result-verdict');
  const spyNames = result.spyNames || [];
  const multiSpy = spyNames.length > 1;
  verdict.textContent = result.spyCaught ? (multiSpy ? 'SPY CAUGHT' : 'SPY CAUGHT') : (multiSpy ? 'SPIES ESCAPED' : 'SPY ESCAPED');
  verdict.className = 'result-verdict ' + (result.spyCaught ? 'caught' : 'escaped');

  document.getElementById('spy-reveal').innerHTML =
    `The ${multiSpy ? 'spies were' : 'spy was'} <strong>${spyNames.map(esc).join(', ')}</strong>`;

  document.getElementById('result-location').textContent = result.location;

  const assigns = document.getElementById('assignments-reveal');
  assigns.innerHTML = (result.assignments || []).map(a => `
    <div class="assign-chip ${a.isSpy ? 'is-spy' : ''}">
      <span>${esc(a.playerName)}</span>${!a.isSpy ? ` · ${esc(a.role)}` : ' · 🕵️ SPY'}
    </div>
  `).join('');

  // Results scoreboard
  const rsScores = state.roomState?.scores || [];
  const rsScoreEl = document.getElementById('result-scoreboard');
  if (rsScores.length > 0) {
    rsScoreEl.classList.remove('hidden');
    rsScoreEl.innerHTML = '<div class="section-label" style="margin-bottom:0.5rem">SCOREBOARD</div>' +
      rsScores.map((s, i) => `
        <div class="score-row ${i === 0 ? 'score-top' : ''}">
          <span class="score-rank">${i + 1}</span>
          <span class="score-name">${esc(s.name)}</span>
          <span class="score-pts">${s.pts} pt${s.pts !== 1 ? 's' : ''}</span>
        </div>
      `).join('');
  } else {
    rsScoreEl.classList.add('hidden');
  }

  document.getElementById('host-reset').classList.toggle('hidden', !state.isHost);
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
function appendChatMsg(msg, panel) {
  const containers = {
    all: document.getElementById('chat-messages'),
    play: document.getElementById('chat-messages-play'),
    vote: document.getElementById('chat-messages-vote'),
  };
  const container = containers[panel];
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'chat-msg';
  div.innerHTML = `
    <div class="sender ${msg.isSpectator ? 'spectator' : ''}">
      ${esc(msg.senderName)}${msg.isSpectator ? ' [spec]' : ''}
    </div>
    <div class="text">${esc(msg.message)}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function addSystemChat(panel, text) {
  const containers = {
    all: document.getElementById('chat-messages'),
    play: document.getElementById('chat-messages-play'),
    vote: document.getElementById('chat-messages-vote'),
  };
  const container = containers[panel];
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'chat-msg system';
  div.innerHTML = `<div class="text">— ${esc(text)} —</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function sendChat(inputId) {
  const input = document.getElementById(inputId);
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  state.socket.emit('chat-message', { message: msg });
}

// ─── Actions ──────────────────────────────────────────────────────────────────
function askPlayer(targetId) {
  const rs = state.roomState;
  if (!rs || rs.currentQuestioner !== state.myName) return;
  state.socket.emit('ask-question', { targetId }, (res) => {
    if (res?.error) showError('game', res.error);
  });
}

function castVote(targetId) {
  if (state.hasVoted) return;
  state.hasVoted = true;
  state.socket.emit('cast-vote', { targetId });
  // Highlight voted card
  document.querySelectorAll('.vote-card').forEach(c => {
    c.classList.add('voted');
    if (c.dataset.id === targetId) c.classList.add('voted-for');
  });
  document.getElementById('voting-sub').textContent = 'Vote cast. Waiting for others...';
}

function showError(type, msg) {
  console.warn(type, msg);
  showToast(msg, 'error');
}

function showToast(msg, type = 'error', duration = 3000) {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);

  const remove = () => { el.classList.add('fade-out'); setTimeout(() => el.remove(), 300); };
  const timer = setTimeout(remove, duration);
  el.addEventListener('animationend', () => {}, { once: true });
  // Allow early dismiss on click (pointer-events on via JS)
  el.style.pointerEvents = 'auto';
  el.addEventListener('click', () => { clearTimeout(timer); remove(); }, { once: true });
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Location Picker ──────────────────────────────────────────────────────────
async function loadBuiltinLocations() {
  const res = await fetch('/api/builtin-locations');
  const data = await res.json();
  state.allBuiltinLocations = data.locations;

  // Default: select all classic locations
  data.locations.filter(l => l.set === 'classic').forEach(l => state.selectedLocNames.add(l.Location));

  renderPickerGrid('classic', document.getElementById('picker-classic'));
  renderPickerGrid('spyfall2', document.getElementById('picker-spyfall2'));
  updatePickerCount();
}

function renderPickerGrid(set, container) {
  const locs = state.allBuiltinLocations.filter(l => l.set === set);
  container.innerHTML = locs.map(loc => {
    const checked = state.selectedLocNames.has(loc.Location);
    const roles = Array.from({length: 16}, (_, i) => loc[`Role${i+1}`]).filter(Boolean);
    const rolesEncoded = esc(roles.join('||'));
    return `
      <label class="picker-item ${checked ? 'checked' : ''}" data-name="${esc(loc.Location)}">
        <input type="checkbox" class="picker-checkbox" value="${esc(loc.Location)}" ${checked ? 'checked' : ''} />
        <div class="picker-item-top">
          <div class="picker-item-name">${esc(loc.Location)}</div>
          <span class="picker-info-btn" data-loc="${esc(loc.Location)}" data-roles="${rolesEncoded}" title="View roles">ℹ</span>
        </div>
      </label>
    `;
  }).join('');

  container.querySelectorAll('.picker-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const name = cb.value;
      const label = cb.closest('.picker-item');
      if (cb.checked) {
        state.selectedLocNames.add(name);
        label.classList.add('checked');
      } else {
        state.selectedLocNames.delete(name);
        label.classList.remove('checked');
      }
      updatePickerCount();
    });
  });

  // Info button — show roles modal without toggling the checkbox
  container.querySelectorAll('.picker-info-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const loc = btn.dataset.loc;
      const roles = btn.dataset.roles.split('||').filter(Boolean);
      showLocInfoModal(loc, roles);
    });
  });
}

function renderCsvPreview(locations) {
  const wrap = document.getElementById('csv-preview');
  const grid = document.getElementById('csv-preview-grid');
  if (!locations || locations.length === 0) { wrap.classList.add('hidden'); return; }

  grid.innerHTML = locations.map(loc => {
    const roles = Object.keys(loc)
      .filter(k => /^Role\d+$/i.test(k))
      .sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')))
      .map(k => loc[k]).filter(Boolean);
    const rolesEncoded = esc(roles.join('||'));
    const checked = state.selectedCsvLocNames.has(loc.Location);
    return `
      <label class="picker-item${checked ? ' checked' : ''}">
        <input type="checkbox" class="picker-checkbox" value="${esc(loc.Location)}" ${checked ? 'checked' : ''} />
        <div class="picker-item-top">
          <div class="picker-item-name">${esc(loc.Location)}</div>
          ${roles.length ? `<span class="picker-info-btn" data-loc="${esc(loc.Location)}" data-roles="${rolesEncoded}" title="View roles">ℹ</span>` : ''}
        </div>
      </label>
    `;
  }).join('');

  // Listen on checkbox change — label click natively toggles it, fires change once
  grid.querySelectorAll('.picker-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const label = cb.closest('.picker-item');
      if (cb.checked) {
        state.selectedCsvLocNames.add(cb.value);
        label.classList.add('checked');
      } else {
        state.selectedCsvLocNames.delete(cb.value);
        label.classList.remove('checked');
      }
      updateCsvCount();
    });
  });

  // Info button — show roles without toggling the checkbox
  grid.querySelectorAll('.picker-info-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      showLocInfoModal(btn.dataset.loc, btn.dataset.roles.split('||').filter(Boolean));
    });
  });

  updateCsvCount();
  wrap.classList.remove('hidden');
}

function updateCsvCount() {
  const n = state.selectedCsvLocNames.size;
  const total = state.loadedLocations?.length || 0;
  const countEl = document.getElementById('csv-count');
  const toggleBtn = document.getElementById('btn-toggle-all-csv');
  if (countEl) countEl.textContent = `${n} of ${total} selected`;
  if (toggleBtn) toggleBtn.textContent = n >= total ? 'Deselect All' : 'Select All';
}

function showLocInfoModal(location, roles) {
  document.getElementById('loc-modal-name').textContent = location;
  document.getElementById('loc-modal-roles').innerHTML = roles.map(r =>
    `<div class="loc-modal-role">${esc(r)}</div>`
  ).join('');
  document.getElementById('loc-info-modal').classList.remove('hidden');
}

function updatePickerCount() {
  const n = state.selectedLocNames.size;
  document.getElementById('picker-count').textContent = `${n} selected`;
  const total = state.allBuiltinLocations.length;
  const toggleBtn = document.getElementById('btn-toggle-all-loc');
  if (toggleBtn) toggleBtn.textContent = n >= total ? 'Deselect All' : 'Select All';
}

function setPickerSelection(filter) {
  state.selectedLocNames.clear();
  state.allBuiltinLocations.filter(filter).forEach(l => state.selectedLocNames.add(l.Location));
  renderPickerGrid('classic', document.getElementById('picker-classic'));
  renderPickerGrid('spyfall2', document.getElementById('picker-spyfall2'));
  updatePickerCount();
}

function getLocationsPayload() {
  if (state.locationSource === 'csv') {
    const selected = (state.loadedLocations || []).filter(l => state.selectedCsvLocNames.has(l.Location));
    return { locations: selected, locationNames: null };
  }
  // Picker mode: send only names — server resolves to full objects
  const names = [...state.selectedLocNames];
  return { locationNames: names, locations: null };
}

// ─── Setup Event Listeners ────────────────────────────────────────────────────
function setupListeners() {
  // Home buttons
  document.getElementById('btn-show-create').onclick = () => showScreen('create');
  document.getElementById('btn-show-join').onclick = () => showScreen('join');
  document.getElementById('btn-back-create').onclick = () => showScreen('home');
  document.getElementById('btn-back-join').onclick = () => showScreen('home');

  // Timer selector buttons (create screen) — scoped to [data-seconds] only
  document.querySelectorAll('[data-seconds]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-seconds]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.timerSeconds = parseInt(btn.dataset.seconds);
      document.getElementById('custom-timer').value = '';
    });
  });
  document.getElementById('custom-timer').addEventListener('input', (e) => {
    if (e.target.value) {
      document.querySelectorAll('[data-seconds]').forEach(b => b.classList.remove('active'));
      state.timerSeconds = parseInt(e.target.value) || 480;
    }
  });

  // Location source tabs
  document.querySelectorAll('.loc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.loc-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.locationSource = tab.dataset.tab;
      document.getElementById('tab-picker').classList.toggle('hidden', tab.dataset.tab !== 'picker');
      document.getElementById('tab-csv').classList.toggle('hidden', tab.dataset.tab !== 'csv');
    });
  });

  // Picker quick-select buttons
  document.getElementById('btn-select-classic').onclick = () => setPickerSelection(l => l.set === 'classic');
  document.getElementById('btn-select-spyfall2').onclick = () => setPickerSelection(l => l.set === 'spyfall2');
  const toggleAllBtn = document.getElementById('btn-toggle-all-loc');
  toggleAllBtn.onclick = () => {
    const allSelected = state.allBuiltinLocations.every(l => state.selectedLocNames.has(l.Location));
    setPickerSelection(allSelected ? () => false : () => true);
    toggleAllBtn.textContent = allSelected ? 'Select All' : 'Deselect All';
  };

  // CSV select all / deselect all
  document.getElementById('btn-toggle-all-csv').onclick = () => {
    const total = state.loadedLocations?.length || 0;
    if (state.selectedCsvLocNames.size >= total) {
      state.selectedCsvLocNames.clear();
    } else {
      state.loadedLocations?.forEach(l => state.selectedCsvLocNames.add(l.Location));
    }
    renderCsvPreview(state.loadedLocations);
  };

  // Number of spies buttons
  document.querySelectorAll('[data-spies]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-spies]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.numSpies = parseInt(btn.dataset.spies);
    });
  });

  // Max players buttons
  document.querySelectorAll('[data-maxp]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-maxp]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.maxPlayers = parseInt(btn.dataset.maxp);
    });
  });

  // CSV upload
  const csvInput = document.getElementById('csv-input');
  const fileDrop = document.getElementById('file-drop');
  const fileLabel = document.getElementById('file-label');
  const csvStatus = document.getElementById('csv-status');

  fileDrop.addEventListener('dragover', e => { e.preventDefault(); fileDrop.classList.add('drag-over'); });
  fileDrop.addEventListener('dragleave', () => fileDrop.classList.remove('drag-over'));
  fileDrop.addEventListener('drop', e => {
    e.preventDefault();
    fileDrop.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleCSV(e.dataTransfer.files[0]);
  });
  csvInput.addEventListener('change', () => { if (csvInput.files[0]) handleCSV(csvInput.files[0]); });

  async function handleCSV(file) {
    fileLabel.textContent = file.name;
    const formData = new FormData();
    formData.append('csv', file);
    try {
      const res = await fetch('/api/parse-csv', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) {
        csvStatus.className = 'csv-status error';
        csvStatus.textContent = '✗ ' + data.error;
      } else {
        state.loadedLocations = data.locations;
        state.selectedCsvLocNames = new Set(data.locations.map(l => l.Location));
        csvStatus.className = 'csv-status';
        csvStatus.textContent = `✓ Loaded ${data.count} locations`;
        renderCsvPreview(data.locations);
      }
      csvStatus.classList.remove('hidden');
    } catch (e) {
      csvStatus.className = 'csv-status error';
      csvStatus.textContent = '✗ Upload failed';
      csvStatus.classList.remove('hidden');
    }
  }

  // Create room
  document.getElementById('btn-create-room').onclick = async () => {
    const name = document.getElementById('create-name').value.trim();
    const errEl = document.getElementById('create-error');
    if (!name) { errEl.textContent = 'Enter a codename'; errEl.classList.remove('hidden'); return; }
    errEl.classList.add('hidden');

    const { locationNames, locations } = getLocationsPayload();
    if (state.locationSource === 'picker' && (!locationNames || locationNames.length === 0)) {
      errEl.textContent = 'Select at least one location';
      errEl.classList.remove('hidden');
      return;
    }
    if (state.locationSource === 'csv' && (!locations || locations.length === 0)) {
      errEl.textContent = 'Upload a CSV or switch to Pick Locations';
      errEl.classList.remove('hidden');
      return;
    }

    state.socket.emit('create-room', {
      name,
      locationNames,
      locations,
      timerSeconds: state.timerSeconds,
      numSpies: state.numSpies,
      maxPlayers: state.maxPlayers
    }, (res) => {
      if (!res.success) { errEl.textContent = res.error; errEl.classList.remove('hidden'); return; }
      state.myName = name;
      state.roomCode = res.code;
      state.roomState = res.roomState;
      state.isHost = true;
      sessionStorage.setItem('spycraft-session', JSON.stringify({ code: res.code, name }));
      showScreen('lobby');
      renderLobby();
    });
  };

  // Join room
  document.getElementById('btn-join-room').onclick = () => {
    const code = document.getElementById('join-code').value.trim().toUpperCase();
    const name = document.getElementById('join-name').value.trim();
    const asSpectator = document.getElementById('join-spectator').checked;
    const errEl = document.getElementById('join-error');
    if (!code) { errEl.textContent = 'Enter a room code'; errEl.classList.remove('hidden'); return; }
    if (!name) { errEl.textContent = 'Enter a codename'; errEl.classList.remove('hidden'); return; }
    errEl.classList.add('hidden');

    state.socket.emit('join-room', { code, name, asSpectator }, (res) => {
      if (!res.success) { errEl.textContent = res.error; errEl.classList.remove('hidden'); return; }
      state.myName = name;
      state.roomCode = code;
      state.roomState = res.roomState;
      state.isSpectator = asSpectator;
      state.isHost = false;
      sessionStorage.setItem('spycraft-session', JSON.stringify({ code, name }));
      navigateToPhase(res.roomState.phase);
    });
  };
  // Enter key for join
  document.getElementById('join-name').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('btn-join-room').click(); });
  document.getElementById('join-code').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });

  // Copy code
  document.getElementById('btn-copy-code').onclick = () => {
    navigator.clipboard.writeText(state.roomCode || '').then(() => {
      const btn = document.getElementById('btn-copy-code');
      btn.textContent = '✓';
      setTimeout(() => btn.textContent = '⧉', 1500);
    });
  };

  // Lobby timer buttons
  document.querySelectorAll('.btn-timer-sm').forEach(btn => {
    btn.addEventListener('click', () => {
      const sec = parseInt(btn.dataset.sec);
      state.socket.emit('update-timer', { timerSeconds: sec });
    });
  });

  // Start game
  document.getElementById('btn-start-game').onclick = () => {
    state.socket.emit('start-game', {}, (res) => {
      if (res?.error) showToast(res.error, 'error');
    });
  };

  // Raise / lower hand toggle
  document.getElementById('btn-raise-hand').onclick = () => {
    const btn = document.getElementById('btn-raise-hand');
    if (!state.hasRaisedHand) {
      state.hasRaisedHand = true;
      state.socket.emit('raise-hand');
      btn.textContent = '✋ Lower Hand';
      btn.classList.add('active');
    } else {
      state.hasRaisedHand = false;
      state.socket.emit('lower-hand');
      btn.textContent = '✋ Raise Hand';
      btn.classList.remove('active');
    }
  };

  // Leave room buttons
  document.getElementById('btn-leave-lobby').onclick = leaveRoom;
  document.getElementById('btn-leave-playing').onclick = leaveRoom;
  document.getElementById('btn-leave-results').onclick = leaveRoom;

  // Reset scores
  document.getElementById('btn-reset-scores').onclick = () => {
    state.socket.emit('reset-scores');
  };

  // Skip turn
  document.getElementById('btn-skip-turn').onclick = () => {
    state.socket.emit('skip-turn');
  };

  // Start voting
  document.getElementById('btn-start-voting').onclick = () => {
    state.socket.emit('start-voting');
  };

  // Force results
  document.getElementById('btn-force-results').onclick = () => {
    state.socket.emit('force-results');
  };

  // Reset room
  document.getElementById('btn-reset-room').onclick = () => {
    state.socket.emit('reset-room');
  };

  // Location info modal close
  document.getElementById('loc-info-close').onclick = () =>
    document.getElementById('loc-info-modal').classList.add('hidden');
  document.getElementById('loc-info-backdrop').onclick = () =>
    document.getElementById('loc-info-modal').classList.add('hidden');

  // About modal
  document.getElementById('btn-about').onclick = () =>
    document.getElementById('about-modal').classList.remove('hidden');
  document.getElementById('about-close').onclick = () =>
    document.getElementById('about-modal').classList.add('hidden');
  document.getElementById('about-backdrop').onclick = () =>
    document.getElementById('about-modal').classList.add('hidden');

  // Sound toggle
  document.getElementById('btn-sound-toggle').onclick = () => {
    const muted = SFX.toggleMute();
    document.getElementById('btn-sound-toggle').textContent = muted ? '🔇' : '🔊';
  };

  // Chat inputs
  setupChatInput('chat-input', 'btn-send-chat', 'all');
  setupChatInput('chat-input-play', 'btn-send-chat-play', 'play');
  setupChatInput('chat-input-vote', 'btn-send-chat-vote', 'vote');
}

function setupChatInput(inputId, btnId, panel) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!input || !btn) return;
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(inputId); });
  btn.onclick = () => sendChat(inputId);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  connectSocket();
  setupListeners();
  loadBuiltinLocations();
});
