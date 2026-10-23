#Requires -Version 5.1
[CmdletBinding()]
param(
    [ValidateSet('Desktop', 'Web', 'Production')][string]$Mode = 'Desktop',
    [switch]$Check,
    [switch]$SmokeTest,
    [ValidateRange(1024, 65535)][int]$Port = 1420
)
$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'scripts/launcher/Launcher.psm1') -Force
$launchLock = $null
$exitCode = 1
try {
    if ($Mode -ne 'Web' -and ($SmokeTest -or $Port -ne 1420)) {
        throw 'SmokeTest e Port personalizado sao exclusivos do modo Web.'
    }
    $diagnostic = Get-GoatPrerequisites -Root $PSScriptRoot -Mode $Mode
    if ($Check) {
        $diagnostic | ConvertTo-Json -Depth 6
        if ($diagnostic.ready) { $exitCode = 0 }
    } else {
        if (-not $diagnostic.ready) { throw ($diagnostic.missing -join [Environment]::NewLine) }
        $launchLock = Enter-GoatLaunchLock -Root $PSScriptRoot -Key $(if ($Mode -eq 'Production') { 'production' } else { "port-$Port" })
        Push-Location -LiteralPath $PSScriptRoot
        try {
            if ($Mode -eq 'Production') {
                Write-Host 'PRODUCAO LOCAL: executavel compilado. Assinatura e validacao devem constar no relatorio do build.'
                $productionProcess = Start-Process -FilePath $diagnostic.executable -WorkingDirectory $PSScriptRoot -PassThru -Wait
                $exitCode = $productionProcess.ExitCode
            } else {
                Write-Host "DESENVOLVIMENTO $Mode - mantenha este terminal aberto; Ctrl+C encerra."
                & $diagnostic.node (Join-Path $PSScriptRoot 'scripts/start.mjs') $Mode.ToLowerInvariant() $Port $(if ($SmokeTest) { 'smoke' } else { 'run' })
                $exitCode = $LASTEXITCODE
            }
        } finally { Pop-Location }
    }
} catch {
    Write-Error -Message $_.Exception.Message -ErrorAction Continue
} finally {
    if ($null -ne $launchLock) { $launchLock.Dispose() }
}
exit $exitCode
