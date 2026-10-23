#requires -Version 5.1
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
Import-Module (Join-Path $PSScriptRoot '../../scripts/inventory/Inventory.psm1') -Force
$script:assertions = 0
function Assert-That([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw $Message }
    $script:assertions++
}
$script:queries = @()
$fixtureQuery = {
    param($ClassName, $Properties, $Filter, $Timeout)
    $script:queries += [pscustomobject]@{ Class = $ClassName; Properties = $Properties; Filter = $Filter; Timeout = $Timeout }
    $row = [ordered]@{}
    foreach ($property in $Properties) { $row[$property] = 'fixture' }
    $row['SerialNumber'] = 'PRIVATE-IDENTIFIER'
    $row['UserName'] = 'PRIVATE-USER'
    $row['MACAddress'] = 'PRIVATE-MAC'
    if ($ClassName -eq 'Win32_Processor') { $row['NumberOfCores'] = 8; $row['NumberOfLogicalProcessors'] = 16; $row['MaxClockSpeed'] = 0 }
    if ($ClassName -eq 'Win32_NetworkAdapter') { $row['NetEnabled'] = $false }
    if ($ClassName -eq 'Win32_PhysicalMemory') { $row['Capacity'] = [uint64]34359738368 }
    if ($ClassName -eq 'Win32_OperatingSystem') { $row['FreePhysicalMemory'] = 0 }
    [pscustomobject]$row
}
$inventory = Get-GoatInventory -Query $fixtureQuery -OperationTimeoutSec 3
Assert-That ($inventory.schemaVersion -eq 1) 'schema version'
Assert-That ($inventory.sections.Count -eq 9) 'all nine explicit classes'
Assert-That ($script:queries.Count -eq 9) 'one query per class'
Assert-That (@($script:queries | Where-Object { $_.Timeout -ne 3 }).Count -eq 0) 'timeout forwarded'
Assert-That (($script:queries | Where-Object { $_.Class -eq 'Win32_NetworkAdapter' }).Filter -eq 'PhysicalAdapter = TRUE') 'network scope'
Assert-That (($script:queries | Where-Object { $_.Class -eq 'Win32_PnPSignedDriver' }).Filter -eq "DeviceClass = 'DISPLAY' OR DeviceClass = 'NET' OR DeviceClass = 'MEDIA'") 'driver scope'
$json = $inventory | ConvertTo-Json -Depth 12
Assert-That ($json -notmatch 'PRIVATE|SerialNumber|UserName|MACAddress') 'privacy allowlist'
$cpu = $inventory.sections | Where-Object { $_.id -eq 'cpu' }
Assert-That ($cpu.status -eq 'partial') 'unknown provider sentinel yields partial'
$clock = $cpu.records[0].fields | Where-Object { $_.key -eq 'MaxClockSpeed' }
Assert-That ($null -eq $clock.value -and $clock.confidence -eq 'unknown') 'unknown clock stays null'
$network = $inventory.sections | Where-Object { $_.id -eq 'network' }
Assert-That (($network.records[0].fields | Where-Object { $_.key -eq 'NetEnabled' }).value -eq $false) 'false remains meaningful false'
$memory = $inventory.sections | Where-Object { $_.id -eq 'memory' }
Assert-That (($memory.records[0].fields | Where-Object { $_.key -eq 'Capacity' }).value -eq 34359738368) '64-bit capacity preserved'
$os = $inventory.sections | Where-Object { $_.id -eq 'os' }
Assert-That (($os.records[0].fields | Where-Object { $_.key -eq 'FreePhysicalMemory' }).value -eq 0) 'real zero free memory preserved'
Assert-That (@($inventory.sections | Where-Object { $_.source -notlike 'CIM root/cimv2 Win32_*' -or $_.collectedAt -notmatch 'Z$' }).Count -eq 0) 'source and UTC time'
$empty = Get-GoatInventory -Query { param($ClassName, $Properties, $Filter, $Timeout) }
Assert-That (@($empty.sections | Where-Object { $_.status -eq 'unavailable' -and $_.records.Count -eq 0 }).Count -eq 9) 'empty results unavailable'
$failed = Get-GoatInventory -Query {
    param($ClassName, $Properties, $Filter, $Timeout)
    if ($ClassName -eq 'Win32_Processor') { throw 'PRIVATE-HOSTNAME path C:\private' }
    [pscustomobject]@{ Name = 'test'; Caption = 'test' }
}
Assert-That ($failed.sections[0].status -eq 'error') 'query failure explicit'
Assert-That ($failed.sections[1].status -eq 'partial') 'one failure does not abort other classes'
Assert-That (($failed | ConvertTo-Json -Depth 12) -notmatch 'PRIVATE|C:\\private') 'exception is sanitized'
$bounded = Get-GoatInventory -Query { param($ClassName, $Properties, $Filter, $Timeout) 1..130 | ForEach-Object { [pscustomobject]@{ Name = 'fixture' } } }
Assert-That ($bounded.sections[0].records.Count -eq 128 -and $bounded.sections[0].status -eq 'partial') 'output records capped'
$long = Get-GoatInventory -Query { param($ClassName, $Properties, $Filter, $Timeout) [pscustomobject]@{ Name = ('x' * 300); Manufacturer = "a`nb" } }
Assert-That ($long.sections[0].records[0].fields[0].value.Length -eq 256) 'bounded strings'
Assert-That ($long.sections[0].records[0].fields[1].value -eq 'a b') 'control characters removed'
$unknown = Get-GoatInventory -Query { param($ClassName, $Properties, $Filter, $Timeout) [pscustomobject]@{ Unrelated = 'ignored' } }
Assert-That ($unknown.sections[0].confidence -eq 'unknown') 'no fields means unknown confidence'
$large = Get-GoatInventory -Query { param($ClassName, $Properties, $Filter, $Timeout) [pscustomobject]@{ Capacity = [uint64]18446744073709551615 } }
$largeCapacity = ($large.sections[1].records[0].fields | Where-Object { $_.key -eq 'Capacity' }).value
Assert-That ($largeCapacity -is [string] -and $largeCapacity -eq '18446744073709551615') 'unsafe JS integer preserved as string'
$target = Join-Path $PSScriptRoot ('inventory-fixture-' + [guid]::NewGuid().ToString('N') + '.json')
try {
    $written = Export-GoatInventory -Inventory $inventory -OutputPath $target
    Assert-That ($written -eq [IO.Path]::GetFullPath($target)) 'explicit export target'
    $parsed = [IO.File]::ReadAllText($target) | ConvertFrom-Json
    Assert-That ($parsed.sections.Count -eq 9) 'JSON round-trip'
    $before = [IO.File]::ReadAllText($target)
    $blocked = $false
    try { Export-GoatInventory -Inventory $empty -OutputPath $target } catch { $blocked = $true }
    Assert-That $blocked 'existing output refused'
    Assert-That ([IO.File]::ReadAllText($target) -eq $before) 'existing output preserved'
    Assert-That (@(Get-ChildItem -LiteralPath $PSScriptRoot -Filter '.goat-inventory-*.tmp').Count -eq 0) 'no temporary files after success'
} finally {
    if ([IO.File]::Exists($target)) { [IO.File]::Delete($target) }
}
Write-Output ('PASS: ' + $script:assertions + ' inventory assertions; PowerShell ' + $PSVersionTable.PSVersion)
