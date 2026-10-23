#requires -Version 5.1
Set-StrictMode -Version Latest

function Get-GoatInventoryDefinitions {
    # Every property is an explicit allowlist. Never serialize a raw CIM instance.
    @(
        @{ Id = 'cpu'; Label = 'CPU'; Class = 'Win32_Processor'; Filter = $null; Fields = @('Name|Modelo|', 'Manufacturer|Fabricante|', 'NumberOfCores|Nucleos|', 'NumberOfLogicalProcessors|Processadores logicos|', 'MaxClockSpeed|Clock maximo informado|MHz') }
        @{ Id = 'memory'; Label = 'Memoria RAM'; Class = 'Win32_PhysicalMemory'; Filter = $null; Fields = @('Manufacturer|Fabricante|', 'Capacity|Capacidade|bytes', 'ConfiguredClockSpeed|Clock configurado informado|MHz', 'SMBIOSMemoryType|Tipo SMBIOS|') }
        @{ Id = 'gpu'; Label = 'GPU'; Class = 'Win32_VideoController'; Filter = $null; Fields = @('Name|Modelo|', 'AdapterCompatibility|Fabricante informado|', 'VideoProcessor|Processador de video|', 'DriverVersion|Versao do driver|') }
        @{ Id = 'baseboard'; Label = 'Placa-mae'; Class = 'Win32_BaseBoard'; Filter = $null; Fields = @('Manufacturer|Fabricante|', 'Product|Modelo|', 'Version|Versao|') }
        @{ Id = 'bios'; Label = 'BIOS / UEFI'; Class = 'Win32_BIOS'; Filter = $null; Fields = @('Manufacturer|Fabricante|', 'SMBIOSBIOSVersion|Versao|', 'ReleaseDate|Data informada|') }
        @{ Id = 'os'; Label = 'Windows'; Class = 'Win32_OperatingSystem'; Filter = $null; Fields = @('Caption|Sistema|', 'Version|Versao|', 'BuildNumber|Build|', 'OSArchitecture|Arquitetura|', 'TotalVisibleMemorySize|Memoria visivel|KiB', 'FreePhysicalMemory|Memoria livre na coleta|KiB') }
        @{ Id = 'storage'; Label = 'Armazenamento'; Class = 'Win32_DiskDrive'; Filter = $null; Fields = @('Model|Modelo|', 'MediaType|Tipo informado|', 'InterfaceType|Interface informada|', 'Size|Capacidade|bytes', 'Status|Estado informado pelo provedor|') }
        @{ Id = 'network'; Label = 'Rede'; Class = 'Win32_NetworkAdapter'; Filter = 'PhysicalAdapter = TRUE'; Fields = @('Name|Modelo|', 'Manufacturer|Fabricante|', 'AdapterType|Tipo|', 'Speed|Velocidade nominal informada|bit/s', 'NetEnabled|Habilitado|') }
        @{ Id = 'drivers'; Label = 'Drivers de video, rede e audio'; Class = 'Win32_PnPSignedDriver'; Filter = "DeviceClass = 'DISPLAY' OR DeviceClass = 'NET' OR DeviceClass = 'MEDIA'"; Fields = @('DeviceName|Dispositivo|', 'DeviceClass|Classe|', 'Manufacturer|Fabricante|', 'DriverVersion|Versao|', 'DriverDate|Data informada|', 'IsSigned|Assinatura informada|') }
    )
}

function ConvertTo-GoatInventoryValue {
    param($Value)
    if ($null -eq $Value) { return $null }
    if ($Value -is [datetime]) { return $Value.ToUniversalTime().ToString('o') }
    if ($Value -is [bool]) { return $Value }
    if ($Value -is [byte] -or $Value -is [uint16] -or $Value -is [uint32] -or $Value -is [uint64] -or $Value -is [int16] -or $Value -is [int32] -or $Value -is [int64] -or $Value -is [decimal] -or $Value -is [double]) {
        # JS cannot represent larger integers exactly. Preserve those as strings.
        if ([double]$Value -gt 9007199254740991 -or [double]$Value -lt -9007199254740991) { return $Value.ToString([cultureinfo]::InvariantCulture) }
        return $Value
    }
    if ($Value -is [string]) {
        $clean = ($Value -replace '[\x00-\x1f\x7f]', ' ').Trim()
        if ($clean.Length -eq 0) { return $null }
        if ($clean.Length -gt 256) { $clean = $clean.Substring(0, 256) }
        return $clean
    }
    return $null
}

function Get-GoatInventory {
    [CmdletBinding()]
    param(
        [ValidateRange(1, 30)][int]$OperationTimeoutSec = 8,
        # Dependency injection for isolated tests; not exposed by the entry script.
        [scriptblock]$Query = {
            param($ClassName, $Properties, $Filter, $Timeout)
            $arguments = @{ Namespace = 'root/cimv2'; ClassName = $ClassName; Property = $Properties; OperationTimeoutSec = $Timeout; ErrorAction = 'Stop' }
            if ($Filter) { $arguments.Filter = $Filter }
            Get-CimInstance @arguments
        }
    )
    $sections = @()
    foreach ($definition in (Get-GoatInventoryDefinitions)) {
        $timestamp = [datetime]::UtcNow.ToString('o')
        $source = 'CIM root/cimv2 ' + $definition.Class
        $properties = @($definition.Fields | ForEach-Object { ($_ -split '\|', 3)[0] })
        $section = [ordered]@{ id = $definition.Id; label = $definition.Label; source = $source; collectedAt = $timestamp; status = 'unavailable'; confidence = 'unknown'; records = @(); error = $null }
        try {
            $rows = @(& $Query $definition.Class $properties $definition.Filter $OperationTimeoutSec)
            $partial = $rows.Count -gt 128
            $records = @()
            $index = 0
            $reportedFields = 0
            foreach ($row in ($rows | Select-Object -First 128)) {
                $fields = @()
                foreach ($descriptor in $definition.Fields) {
                    $parts = $descriptor -split '\|', 3
                    $property = $row.PSObject.Properties[$parts[0]]
                    $value = $null
                    if ($null -ne $property) { $value = ConvertTo-GoatInventoryValue $property.Value }
                    # Provider sentinel zero is unknown for capacities, core counts and clocks.
                    if ($null -ne $value -and $parts[0] -in @('NumberOfCores','NumberOfLogicalProcessors','MaxClockSpeed','Capacity','ConfiguredClockSpeed','Size','Speed','TotalVisibleMemorySize','SMBIOSMemoryType') -and $value -eq 0) { $value = $null }
                    $fieldStatus = 'reported'; $confidence = 'reported'
                    if ($null -eq $value) { $fieldStatus = 'unavailable'; $confidence = 'unknown'; $partial = $true }
                    else { $reportedFields++ }
                    $unit = $null
                    if ($parts[2]) { $unit = $parts[2] }
                    $fields += [pscustomobject][ordered]@{ key = $parts[0]; label = $parts[1]; value = $value; unit = $unit; status = $fieldStatus; confidence = $confidence }
                }
                $records += [pscustomobject]@{ index = $index; fields = @($fields) }
                $index++
            }
            $section.records = @($records)
            if ($records.Count -gt 0) {
                $section.status = 'available'
                $section.confidence = 'reported'
                if ($reportedFields -eq 0) { $section.confidence = 'unknown' }
                if ($partial) { $section.status = 'partial' }
            }
        } catch {
            # Provider messages may contain hostnames/paths. Only stable, safe errors leave the collector.
            $section.status = 'error'
            $section.error = [pscustomobject]@{ code = 'query-failed'; message = 'Consulta local indisponivel; verifique o provedor CIM e as permissoes sem elevar automaticamente.' }
        }
        $sections += [pscustomobject]$section
    }
    [pscustomobject][ordered]@{
        schemaVersion = 1
        collector = [pscustomobject]@{ name = 'goat-hub-cim'; version = '0.1.0'; powershellVersion = $PSVersionTable.PSVersion.ToString() }
        collectedAt = [datetime]::UtcNow.ToString('o')
        sections = @($sections)
    }
}

function Export-GoatInventory {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)]$Inventory, [Parameter(Mandatory = $true)][string]$OutputPath)
    $target = [IO.Path]::GetFullPath($OutputPath)
    $directory = [IO.Path]::GetDirectoryName($target)
    if (-not [IO.Directory]::Exists($directory)) { throw 'A pasta de destino deve existir.' }
    if ([IO.File]::Exists($target) -or [IO.Directory]::Exists($target)) { throw 'O destino ja existe; escolha outro arquivo para preservar os dados anteriores.' }
    $temporary = [IO.Path]::Combine($directory, '.goat-inventory-' + [guid]::NewGuid().ToString('N') + '.tmp')
    $ownedTemporary = $false
    try {
        $json = $Inventory | ConvertTo-Json -Depth 12
        $stream = [IO.File]::Open($temporary, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
        $ownedTemporary = $true
        $writer = New-Object IO.StreamWriter($stream, (New-Object Text.UTF8Encoding($false)))
        try { $writer.Write($json) } finally { $writer.Dispose() }
        # Same-directory rename is atomic; fails instead of overwriting an existing destination.
        [IO.File]::Move($temporary, $target)
        $ownedTemporary = $false
    } finally {
        if ($ownedTemporary -and [IO.File]::Exists($temporary)) { [IO.File]::Delete($temporary) }
    }
    return $target
}

Export-ModuleMember -Function Get-GoatInventory, Export-GoatInventory
