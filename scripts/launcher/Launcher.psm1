Set-StrictMode -Version Latest

function Get-GoatPrerequisites {
    param([Parameter(Mandatory)][string]$Root, [ValidateSet('Desktop','Web','Production')][string]$Mode = 'Desktop')
    $missing = New-Object 'System.Collections.Generic.List[string]'
    $manifestPath = Join-Path $Root 'package.json'
    if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) { throw 'Raiz invalida: package.json ausente.' }
    $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
    if ($manifest.name -ne 'goat-hub-service') { throw 'Raiz invalida: este nao e o GOAT HUB Service.' }
    $nodePath = $null
    $nodeVersion = $null
    $pnpmVersion = $null
    $executable = Join-Path $Root 'src-tauri/target/release/goat-hub-service.exe'
    if ($Mode -eq 'Production') {
        if (-not (Test-Path -LiteralPath $executable -PathType Leaf)) {
            $missing.Add('Executavel de producao ausente. Compile pnpm tauri build --no-bundle; consulte docs/windows-setup.md. A versao web nao substitui esse arquivo.')
        }
    } else {
        $node = Get-Command node.exe -ErrorAction SilentlyContinue
        if ($node) {
            $nodePath = $node.Source
            $nodeVersion = (& $nodePath --version | Out-String).Trim()
            if ($LASTEXITCODE -ne 0 -or $nodeVersion -notmatch '^v24\.') { $missing.Add('Node.js 24.x necessario; consulte docs/windows-setup.md.') }
        } else { $missing.Add('Node.js 24.x nao encontrado no PATH.') }
        $pnpm = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
        if ($pnpm) {
            $pnpmVersion = (& $pnpm.Source --version | Out-String).Trim()
            $required = $manifest.packageManager -replace '^pnpm@', ''
            if ($LASTEXITCODE -ne 0 -or $pnpmVersion -ne $required) { $missing.Add("pnpm $required necessario; encontrado: $pnpmVersion") }
        } else { $missing.Add('pnpm nao encontrado no PATH. Instale a versao packageManager documentada.') }
        foreach ($relative in @('pnpm-lock.yaml', 'node_modules/vite/bin/vite.js', 'node_modules/@tauri-apps/cli/tauri.js')) {
            if (-not (Test-Path -LiteralPath (Join-Path $Root $relative) -PathType Leaf)) { $missing.Add("Ausente: $relative. Execute pnpm install --frozen-lockfile --ignore-scripts na raiz.") }
        }
        if ($Mode -eq 'Desktop') {
            foreach ($tool in @('cargo.exe', 'rustc.exe')) {
                if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { $missing.Add("$tool ausente no PATH; instale Rust MSVC conforme docs/windows-setup.md.") }
            }
            # cl.exe is normally outside PATH in a regular terminal. Detect VS through vswhere.
            $vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio/Installer/vswhere.exe'
            $vsPath = $null
            if (Test-Path -LiteralPath $vswhere) { $vsPath = & $vswhere -latest -products '*' -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath }
            if (-not $vsPath) { $missing.Add('Build Tools C++ x64/x86 nao detectados por vswhere. Consulte docs/windows-setup.md; nao basta ter Visual Studio Code.') }
            $sdkRoot = Join-Path ${env:ProgramFiles(x86)} 'Windows Kits/10/Include'
            $sdk = @(Get-ChildItem -LiteralPath $sdkRoot -Directory -ErrorAction SilentlyContinue | Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'um/Windows.h') })
            if ($sdk.Count -eq 0) { $missing.Add('Windows SDK com headers nao detectado no local padrao. Consulte docs/windows-setup.md.') }
        }
    }
    [pscustomobject]@{ mode=$Mode; ready=($missing.Count -eq 0); root=[IO.Path]::GetFullPath($Root); node=$nodePath; nodeVersion=$nodeVersion; pnpmVersion=$pnpmVersion; executable=$executable; missing=@($missing); limitation='Pre-check de arquivos e ferramentas; nao comprova compilacao, WebView2 funcional ou abertura de janela.' }
}

function Enter-GoatLaunchLock {
    param([Parameter(Mandatory)][string]$Root, [ValidatePattern('^(production|port-[0-9]+)$')][string]$Key)
    $directory = Join-Path $Root '.runtime'
    [void][IO.Directory]::CreateDirectory($directory)
    try { return [IO.File]::Open((Join-Path $directory "$Key.lock"), [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None) }
    catch { throw 'Nao foi possivel obter a trava: outro iniciador pode estar ativo, ou a pasta .runtime nao permite escrita. Nenhum processo foi encerrado.' }
}
Export-ModuleMember -Function Get-GoatPrerequisites, Enter-GoatLaunchLock
