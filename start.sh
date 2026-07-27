#!/usr/bin/env bash
# CustomSpyFall launcher — Mac / Linux
# Usage: bash start.sh  (or chmod +x start.sh && ./start.sh)

ROOT="$(cd "$(dirname "$0")" && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; GRAY='\033[0;37m'; NC='\033[0m'

step() { echo -e "${CYAN}  >> $1${NC}"; }
ok()   { echo -e "${GREEN}  OK $1${NC}"; }
err()  { echo -e "${RED}  !! $1${NC}"; }

echo ""
echo -e "${GRAY}  ============================================${NC}"
echo -e "   CUSTOMSPYFALL LAUNCHER"
echo -e "${GRAY}  ============================================${NC}"
echo ""

# ── 1. Kill existing processes ────────────────────────────────────────────────
step "Stopping existing node / ngrok processes..."
pkill -f "node.*index.js" 2>/dev/null
pkill -f ngrok 2>/dev/null
sleep 1
ok "Cleared."

# ── 2. Start the Node server ──────────────────────────────────────────────────
step "Starting CustomSpyFall server..."
cd "$ROOT" && node server/index.js &
SERVER_PID=$!
sleep 2

# Health check
if curl -s --max-time 3 http://localhost:3000 > /dev/null 2>&1; then
    ok "Server is running on port 3000."
else
    err "Server did not respond. Make sure Node.js (v18+) is installed."
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# ── 3. Start ngrok ────────────────────────────────────────────────────────────
step "Starting ngrok tunnel..."
ngrok http 3000 > /dev/null 2>&1 &
NGROK_PID=$!
sleep 3

# ── 4. Fetch public URL ───────────────────────────────────────────────────────
step "Fetching public URL..."
URL=""
for PORT in 4040 4041; do
    RESP=$(curl -s --max-time 3 "http://localhost:$PORT/api/tunnels" 2>/dev/null)
    if [ -n "$RESP" ]; then
        URL=$(echo "$RESP" | python3 -c "
import sys, json
data = json.load(sys.stdin)
tunnels = data.get('tunnels', [])
if tunnels:
    print(tunnels[0]['public_url'])
" 2>/dev/null)
        [ -n "$URL" ] && break
    fi
done

# ── 5. Display result ─────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}  ============================================${NC}"
echo -e "${GREEN}   CUSTOMSPYFALL IS LIVE${NC}"
echo -e "${GREEN}  ============================================${NC}"

if [ -n "$URL" ]; then
    echo -e "${YELLOW}   $URL${NC}"
    echo ""
    echo "  Share that link with your friends."
    # Open browser (Mac: open, Linux: xdg-open)
    if command -v open > /dev/null 2>&1; then
        open "$URL"
    elif command -v xdg-open > /dev/null 2>&1; then
        xdg-open "$URL" &
    fi
else
    echo -e "${YELLOW}   URL not found.${NC}"
    echo "  Open http://localhost:4040 manually to get it."
fi

echo -e "${GREEN}  ============================================${NC}"
echo ""
echo -e "${GRAY}  Press Ctrl+C to stop everything...${NC}"
echo ""

# ── 6. Cleanup on exit ────────────────────────────────────────────────────────
trap 'echo ""; step "Shutting down..."; kill $SERVER_PID $NGROK_PID 2>/dev/null; ok "Done. Goodbye!"; exit 0' INT TERM

# Keep script alive
wait $SERVER_PID
