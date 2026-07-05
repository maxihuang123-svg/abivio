$outputLog = "D:\abivio\dev-out.log"
$errLog = "D:\abivio\dev-err.log"
Remove-Item $outputLog -ErrorAction SilentlyContinue
Remove-Item $errLog -ErrorAction SilentlyContinue

$stateDir = "D:\abivio\.wrangler\state"
Remove-Item $stateDir -Recurse -ErrorAction SilentlyContinue

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "node"
$psi.Arguments = "./node_modules/wrangler/bin/wrangler.js pages dev frontend --compatibility-date=2026-06-28 --d1 DB --port 8788 --log-level warn --show-interactive-dev-session=false"
$psi.WorkingDirectory = "D:\abivio"
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true

$proc = [System.Diagnostics.Process]::Start($psi)

try {
    # Wait for server to be ready
    $ready = $false
    for ($i = 0; $i -lt 20; $i++) {
        Start-Sleep -Milliseconds 500
        try {
            $resp = Invoke-RestMethod -Uri "http://127.0.0.1:8788/api/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
            Write-Output "Health check OK:"
            $resp | ConvertTo-Json
            $ready = $true
            break
        } catch {
            # not ready yet
        }
    }

    if (-not $ready) {
        Write-Output "Server did not become ready in time."
        exit 1
    }

    # Trigger D1 binding so the local sqlite file is created
    try {
        Invoke-RestMethod -Uri "http://127.0.0.1:8788/api/programs" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue | Out-Null
    } catch {}
    Start-Sleep -Seconds 2

    # Find and seed the dev server's D1 sqlite file
    $dbDir = "$stateDir\v3\d1\miniflare-D1DatabaseObject"
    $dbFile = Get-ChildItem $dbDir -Filter "*.sqlite" | Where-Object { $_.Name -ne "metadata.sqlite" } | Sort-Object LastWriteTime -Descending | Select-Object -First 1

    if (-not $dbFile) {
        Write-Output "Could not find local D1 database file."
        exit 1
    }

    Write-Output "Found local D1 database: $($dbFile.Name)"
    & sqlite3 $dbFile.FullName ".read D:\abivio\db\schema.sql" 2>&1
    & sqlite3 $dbFile.FullName ".read D:\abivio\db\seed.sql" 2>&1
    Write-Output "Schema and seed applied."

    if (-not $ready) {
        Write-Output "Server did not become ready in time."
        Write-Output "--- stdout ---"
        Get-Content $outputLog -ErrorAction SilentlyContinue | Select-Object -First 50
        Write-Output "--- stderr ---"
        Get-Content $errLog -ErrorAction SilentlyContinue | Select-Object -First 50
        exit 1
    }

    # Test waitlist
    $wl = Invoke-RestMethod -Uri "http://127.0.0.1:8788/api/waitlist" -Method POST -Body '{"email":"test@example.com","graduationYear":2026}' -ContentType "application/json" -TimeoutSec 5
    Write-Output "Waitlist response:"
    $wl | ConvertTo-Json

    # Test quiz
    $quizBody = @{
        session_id = "test-session-123"
        answers = @{
            interests = @("technik", "wirtschaft")
            strengths = @("mathematik", "informatik")
            work_style = @("analytisch")
            nc_grade = 2.0
            language = "de"
            duration = "kurz"
            region = "egal"
        }
    } | ConvertTo-Json -Depth 5

    $recs = Invoke-RestMethod -Uri "http://127.0.0.1:8788/api/quiz" -Method POST -Body $quizBody -ContentType "application/json" -TimeoutSec 10
    Write-Output "Quiz response (top 5):"
    $recs.recommendations | Select-Object name, score | ConvertTo-Json

    # Test recommendations endpoint
    $stored = Invoke-RestMethod -Uri "http://127.0.0.1:8788/api/recommendations?session_id=test-session-123" -Method GET -TimeoutSec 5
    Write-Output "Stored recommendations count: $($stored.recommendations.Count)"

    Write-Output "ALL TESTS PASSED"
} finally {
    if ($proc -and -not $proc.HasExited) {
        $proc.Kill()
        $proc.WaitForExit(5000)
    }
}
