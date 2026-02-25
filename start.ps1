$host.UI.RawUI.WindowTitle = "SpyCraft Launcher"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Step($msg) { Write-Host "  >> $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "  OK $msg" -ForegroundColor Green }
function Write-Err($msg)  { Write-Host "  !! $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "  ============================================" -ForegroundColor DarkGray
Write-Host "   SPYCRAFT LAUNCHER" -ForegroundColor White
Write-Host "  ============================================" -ForegroundColor DarkGray
Write-Host ""

# ── 1. Kill existing processes ────────────────────────────────────────────────
Write-Step "Stopping existing node / ngrok processes..."
Get-Process node  -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process ngrok -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1
Write-OK "Cleared."

# ── 2. Start the Node server ──────────────────────────────────────────────────
Write-Step "Starting SpyCraft server..."
$serverScript = Join-Path $ROOT "server\index.js"

$server = Start-Process node `
    -ArgumentList $serverScript `
    -WorkingDirectory $ROOT `
    -WindowStyle Hidden `
    -PassThru

Start-Sleep -Seconds 2

# Health check
try {
    Invoke-WebRequest "http://localhost:3000" -UseBasicParsing -TimeoutSec 3 | Out-Null
    Write-OK "Server is running on port 3000."
}
catch {
    Write-Err "Server did not respond. Make sure Node.js is installed."
    Read-Host "`nPress Enter to exit"
    exit 1
}

# ── 3. Start ngrok ────────────────────────────────────────────────────────────
Write-Step "Starting ngrok tunnel..."

$ngrok = Start-Process ngrok `
    -ArgumentList "http 3000" `
    -WindowStyle Hidden `
    -PassThru

Start-Sleep -Seconds 3

# ── 4. Fetch public URL ───────────────────────────────────────────────────────
Write-Step "Fetching public URL..."
$url = ""

foreach ($port in @(4040,4041)) {
    try {
        $data = Invoke-RestMethod "http://localhost:$port/api/tunnels"
        if ($data.tunnels.Count -gt 0) {
            $url = $data.tunnels[0].public_url
            break
        }
    }
    catch {}
}

# ── 5. Display result ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ============================================" -ForegroundColor Green
Write-Host "   SPYCRAFT IS LIVE" -ForegroundColor Green
Write-Host "  ============================================" -ForegroundColor Green

if ($url -ne "") {
    Write-Host "   $url" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Share that link with your friends." -ForegroundColor White
    Start-Process $url
}
else {
    Write-Host "   URL not found." -ForegroundColor Yellow
    Write-Host "   Open http://localhost:4040 manually to get it." -ForegroundColor White
}

Write-Host "  ============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Press Enter to stop everything..." -ForegroundColor DarkGray
Write-Host ""

Read-Host

# ── 6. Cleanup ────────────────────────────────────────────────────────────────
Write-Host ""
Write-Step "Shutting down server and tunnel..."

if ($server) { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue }
if ($ngrok)  { Stop-Process -Id $ngrok.Id  -Force -ErrorAction SilentlyContinue }

Write-OK "Done. Goodbye!"
Start-Sleep -Seconds 1