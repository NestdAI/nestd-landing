// Compatibility entry point; the assertions execute landing.js in a browser-like VM.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
execFileSync(process.execPath, ['--test', '--test-name-pattern=language|mobile navigation',
  fileURLToPath(new URL('./marketing-behavior.test.mjs', import.meta.url))], { stdio: 'inherit' });
