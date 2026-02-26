# CustomSpyFall 👁

A free, self-hosted multiplayer deduction game inspired by Spyfall — with full support for **custom locations via CSV upload**.

One or more players are secretly the **Spy**. They don't know the location. Everyone else does. Through careful questioning, agents try to expose the spy before time runs out — while the spy tries to blend in and guess the location.
<img width="1912" height="948" alt="image" src="https://github.com/user-attachments/assets/fa15c676-81f3-4f5a-a1ee-5d471523d35a" />
<img width="1912" height="948" alt="image" src="https://github.com/user-attachments/assets/c8846f01-8e53-48a2-91e7-a787d7dd5b86" />
<img width="1912" height="948" alt="image" src="https://github.com/user-attachments/assets/66b5f4e2-b795-4dd2-824f-e48a8942bc08" />
<img width="1912" height="948" alt="image" src="https://github.com/user-attachments/assets/a4ed83fe-0a82-4270-934e-84bbc7e3c0c8" />

> Built as a free, non-profit hobby project — made for playing with friends. I was not able to find a similar project online while looking up
> I eventually plan to deploy this online but for now the ngrok setup was enough to get it up and running when needed, tried it with custom csv with friends on different categories in discord and was overall fun experience.
> I added some default categorties (which are AI generated) but the entire idea of this is to allow your friend groups to host their own categories with the csv setup
Added some unique rules:
   - If a hand is raised host can give questioning rights
   - Host can also skip someone's turn
   - A spy wins 1 point if he wins, but gets to guess location if he guessed right he earns 2 additional points
   - if a spy is caught all the lobby wins 1 points
   - if the voting is a draw the spy wins
   - You can click on the location to view all available roles (not inside the game just in lobbies)
   - If someone doesn't want to ask in his turn hes free to skip

---

## Features

- 🗺️ **Custom locations** — upload any CSV; column names don't matter, anything after `Location` is a role
- 🎭 **52 built-in locations** — Spyfall Classic & Spyfall 2, each with 16 unique roles
- 👥 **Up to 16 players** per room
- 🕵️ **1–3 spies** configurable per round
- ⏱️ **Configurable timer** — 3, 5, 8, 10, 15 min or fully custom
- 💬 **In-game chat** across all phases (lobby, playing, voting)
- 🙋 **Hand-raise system** — signal you want to keep asking after the timer
- 📊 **Persistent scoreboard** across rounds
- 👁️ **Spectator mode** — watch without playing
- 🔊 **Sound effects** — clicks, ambient background, and game-end fanfares (Web Audio API, zero server load)
- 🔗 **Shareable 5-character room codes**
- 📱 **Mobile-friendly**

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [ngrok](https://ngrok.com/download) (free account) — only needed when sharing over the internet

---

## Running Locally

```bash
# 1. Clone the repo
git clone https://github.com/your-username/customspyfall.git
cd customspyfall

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

Open **`http://localhost:3000`** in your browser.


```bash
npm run dev
```

---

## Sharing Over the Internet with ngrok

ngrok punches a public HTTPS URL through to your local server so anyone anywhere can join.

### One-time ngrok setup

1. Sign up free at [ngrok.com](https://ngrok.com)
2. Download ngrok and add it to your system PATH
3. Add your auth token (shown in the ngrok dashboard):
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

### Quick start — Windows

**Double-click `start.bat`** in the project folder.

The script will automatically:
1. Kill any existing node / ngrok processes
2. Start the game server on port 3000
3. Start the ngrok tunnel
4. Print (and open) your **public URL**

Press **Enter** in the terminal window to stop everything cleanly.

### Quick start — Mac / Linux

```bash
bash start.sh
```

Or make it executable once and just run it:

```bash
chmod +x start.sh
./start.sh
```

The script does the same thing as the Windows version — kills old processes, starts the server, starts ngrok, prints your public URL, and opens it in the browser. Press **Ctrl+C** to stop everything cleanly.

### Manual start (any platform)

```bash
# Terminal 1 — game server
npm start

# Terminal 2 — public tunnel
ngrok http 3000
```

Copy the `https://xxxx-xxxx.ngrok-free.app` URL from the ngrok output and share it with your friends.

> **Free tier note:** Visitors see a one-time "Visit Site" browser warning from ngrok — just click through it. The URL also changes every time you restart ngrok.

---

## Custom Locations — CSV Format

The first column must be named **`Location`**. Every column after that is treated as a role — **name them anything you like**.

```csv
Location,Role,Job,Alias,Title
Space Station,Commander,Engineer,Scientist,Pilot
Haunted House,Ghost,Hunter,Caretaker,Visitor
Pirates Cove,Captain,Lookout,Cook,Prisoner,Navigator,Surgeon
```

- Column names don't matter (`Role`, `Job`, `Character`, anything works)
- Rows can have different numbers of roles
- Up to 16 roles per location are used
- Roles are distributed to non-spy players; extras cycle if the player count exceeds role count

Upload the CSV on the **Create Room** screen under **Upload CSV**.

---

## How to Play

1. **Host** creates a room, picks locations (or uploads a CSV), sets the timer and player count
2. Share the **5-character room code** with friends — they join on the same URL
3. Everyone enters their codename and the host clicks **START MISSION**
4. Each player privately sees their **location + role** — or `???` if they're the spy
5. Players take turns asking each other questions about the location (keeping it vague enough that the spy can't guess immediately)
6. When time runs out or the host starts a vote, everyone votes on who they think is the spy
7. **Agents win** by correctly voting out the spy. **Spy wins** by surviving the vote or correctly guessing the location before being caught

---

## Project Structure

```
customspyfall/
├── server/
│   ├── index.js              # Express + Socket.IO server, API routes
│   ├── gameManager.js        # All game logic — rooms, rounds, voting, scoring
│   ├── builtinLocations.js   # 52 built-in locations × 16 roles each
│   └── defaultLocations.csv  # Fallback CSV if no file is uploaded
├── client/
│   └── public/
│       ├── index.html        # Single-page app shell + all screen markup
│       ├── app.js            # Client-side logic, socket events, rendering
│       ├── style.css         # Dark spy-thriller theme
│       └── favicon.svg       # Browser tab icon (spy eye)
├── start.bat                 # Windows: double-click launcher (calls start.ps1)
├── start.ps1                 # Windows: PowerShell launcher (server + ngrok + URL)
├── start.sh                  # Mac/Linux: bash launcher (server + ngrok + URL)
├── package.json
└── README.md
```

State is kept **in-memory** on the server — no database needed. Rooms are cleaned up automatically after 6 hours or when all players disconnect.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Server | Node.js, Express |
| Real-time | Socket.IO (WebSockets) |
| Frontend | Vanilla JS, HTML5, CSS3 |
| Audio | Web Audio API (client-side only) |
| CSV parsing | csv-parse |

---

## License

Free to use for personal and non-commercial purposes.
Created by **Magdy Abo Youssef** 🕵️
