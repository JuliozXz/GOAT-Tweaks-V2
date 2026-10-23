#requires -Version 5.1
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$OutputPath,
    [ValidateRange(1, 30)][int]$OperationTimeoutSec = 8
)
$ErrorActionPreference = 'Stop'
try {
    if ([Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT) { throw 'Este coletor requer Windows.' }
    Import-Module (Join-Path $PSScriptRoot 'Inventory.psm1') -Force
    $inventory = Get-GoatInventory -OperationTimeoutSec $OperationTimeoutSec
    $path = Export-GoatInventory -Inventory $inventory -OutputPath $OutputPath
    Write-Host ('Inventario exportado: ' + $path)
    $failures = @($inventory.sections | Where-Object { $_.status -eq 'error' }).Count
    if ($failures -gt 0) { Write-Warning ('Secoes com erro de coleta: ' + $failures + '. Consulte os estados no JSON; exportacao nao comprova disponibilidade.') }
    if ($failures -eq $inventory.sections.Count) { exit 2 }
    exit 0
} catch {
    Write-Error ('Falha no inventario: ' + $_.Exception.Message) -ErrorAction Continue
    exit 1
}
