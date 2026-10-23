#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
Import-Module (Join-Path $root 'scripts/launcher/Launcher.psm1') -Force
$assertions = 0
function Assert($Condition, [string]$Message) {
    if (-not $Condition) { throw "FAIL: $Message" }
    $script:assertions++
}
function Assert-Throws([scriptblock]$Action, [string]$Message) {
    $thrown = $false
    try { & $Action | Out-Null } catch { $thrown = $true }
    Assert $thrown $Message
}
$fixture = Join-Path ([IO.Path]::GetTempPath()) ('goat launcher ' + [guid]::NewGuid().ToString('N'))
[void][IO.Directory]::CreateDirectory($fixture)
try {
    Assert-Throws { Get-GoatPrerequisites -Root $fixture -Mode Web } 'Reject missing manifest'
    [IO.File]::WriteAllText((Join-Path $fixture 'package.json'), '{"name":"other","packageManager":"pnpm@11.25.0"}')
    Assert-Throws { Get-GoatPrerequisites -Root $fixture -Mode Web } 'Reject wrong project'
    [IO.File]::WriteAllText((Join-Path $fixture 'package.json'), '{"name":"goat-hub-service","packageManager":"pnpm@11.25.0"}')
    $missing = Get-GoatPrerequisites -Root $fixture -Mode Web
    Assert (-not $missing.ready) 'Missing dependencies block startup'
    Assert ($missing.missing.Count -ge 3) 'Missing files are named'
    $production = Get-GoatPrerequisites -Root $fixture -Mode Production
    Assert (-not $production.ready) 'Missing production binary blocks startup'
    $first = Enter-GoatLaunchLock -Root $fixture -Key port-1420
    try { Assert-Throws { Enter-GoatLaunchLock -Root $fixture -Key port-1420 } 'Duplicate launcher blocked' }
    finally { $first.Dispose() }
    $second = Enter-GoatLaunchLock -Root $fixture -Key port-1420
    $second.Dispose()
    Assert $true 'Lock reusable after exit, including leftover lock file'
    $web = Get-GoatPrerequisites -Root $root -Mode Web
    Assert $web.ready 'Current repository prerequisites ready'
    # Real startup, from a different directory; script root contains all paths.
    $listener = New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback, 0)
    $listener.Start()
    $port = $listener.LocalEndpoint.Port
    Push-Location -LiteralPath $fixture
    try {
        $ErrorActionPreference = 'Continue'
        $collision = & powershell.exe -NoProfile -File (Join-Path $root 'GOAT-HUB.ps1') -Mode Web -SmokeTest -Port $port 2>&1
        $collisionExit = $LASTEXITCODE
        $ErrorActionPreference = 'Stop'
        Assert ($collisionExit -ne 0) 'Occupied port fails, never kills existing listener'
        Assert ($listener.Server.IsBound) 'Existing listener preserved'
        $listener.Stop()
        # PS5.1 wraps native stderr as ErrorRecord even for expected Vite 403 diagnostics.
        # Assert the actual process exit and readiness marker instead of treating stderr as exit.
        $ErrorActionPreference = 'Continue'
        $output = & powershell.exe -NoProfile -File (Join-Path $root 'GOAT-HUB.ps1') -Mode Web -SmokeTest -Port $port 2>&1
        $smokeExit = $LASTEXITCODE
        $ErrorActionPreference = 'Stop'
        Assert ($smokeExit -eq 0) ("Real web smoke exit code: " + ($output -join ' '))
        Assert (($output -join ' ') -match 'SMOKE PASS') 'HTTP and entry module really served'
        Assert (($output -join ' ') -match 'nao e o aplicativo desktop') 'Browser explicitly distinguished'
        # A new listener proves bounded smoke released the port.
        $listener.Start()
        Assert ($listener.Server.IsBound) 'Smoke shut down its own server'
    } finally { $listener.Stop(); Pop-Location }
    Write-Host "PASS: $assertions launcher assertions; PowerShell $($PSVersionTable.PSVersion)."
} finally {
    $expectedParent = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\')
    if ([IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($fixture)) -eq $expectedParent -and (Split-Path -Leaf $fixture) -like 'goat launcher *') {
        Remove-Item -LiteralPath $fixture -Recurse -Force
    }
}
