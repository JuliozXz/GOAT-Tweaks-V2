import { spawn } from 'node:child_process';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const [mode, portValue = '1420', action = 'run'] = process.argv.slice(2);
const port = Number(portValue);
if (!['web', 'desktop'].includes(mode) || !Number.isInteger(port) || port < 1024 || port > 65535 || !['run', 'smoke'].includes(action)) {
  throw new Error('Argumentos invalidos. Use GOAT-HUB.ps1.');
}
process.chdir(root);
if (mode === 'web') {
  const { createServer } = await import('vite');
  const server = await createServer({ root, server: { host: '127.0.0.1', port, strictPort: true, open: false } });
  const stop = async () => { await server.close(); process.exit(0); };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  try {
    await server.listen();
    const response = await fetch(`http://127.0.0.1:${port}`, { signal: AbortSignal.timeout(10000) });
    const html = await response.text();
    if (!response.ok || !html.includes('GOAT HUB')) throw new Error('Servidor respondeu sem a pagina esperada.');
    console.log(`WEB DE DESENVOLVIMENTO: http://127.0.0.1:${port} (nao e o aplicativo desktop nativo).`);
    if (action === 'smoke') {
      // Request the actual entry module too, so a missing entry is not a false ready signal.
      const entry = await fetch(`http://127.0.0.1:${port}/src/main.tsx`, { signal: AbortSignal.timeout(10000) });
      if (!entry.ok || !(await entry.text()).includes('/src/components/App.tsx')) throw new Error('Modulo principal indisponivel.');
      const canary = `private-smoke-${randomUUID()}.txt`;
      const privateDirectory = path.join(root, '.runtime');
      await mkdir(privateDirectory, { recursive: true });
      const canaryPath = path.join(privateDirectory, canary);
      await writeFile(canaryPath, 'SYNTHETIC-PRIVATE-CANARY', { flag: 'wx' });
      try {
        const denied = await fetch(`http://127.0.0.1:${port}/.runtime/${canary}`, { signal: AbortSignal.timeout(10000) });
        if (denied.status !== 403 || (await denied.text()).includes('SYNTHETIC-PRIVATE-CANARY')) throw new Error('Pasta privada nao esta protegida pelo servidor.');
      } finally { await unlink(canaryPath); }
      console.log('SMOKE PASS: HTTP e modulo principal acessiveis; pasta privada bloqueada; renderizacao nao avaliada aqui.');
      await server.close();
    }
  } catch (error) { await server.close(); console.error(`Falha ao iniciar/verificar o modo Web: ${error.message}`); process.exitCode = 1; }
} else {
  if (action !== 'run' || port !== 1420) throw new Error('Desktop usa apenas a porta 1420 configurada no Tauri.');
  const child = spawn(process.execPath, [path.join(root, 'node_modules/@tauri-apps/cli/tauri.js'), 'dev'], {
    cwd: root, stdio: 'inherit', windowsHide: true,
  });
  console.log('Tauri dev solicitado; aguarde o resultado do compilador e a janela. Ainda nao confirma inicializacao.');
  child.on('error', error => { console.error(error.message); process.exitCode = 1; });
  child.on('exit', code => { process.exitCode = code ?? 1; });
}
