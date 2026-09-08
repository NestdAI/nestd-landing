// Replaces the pre-launch form smoke test with the live download/attribution contract.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
execFileSync(process.execPath, ['--test', '--test-name-pattern=touch|click|props|stored|storage|Meta|product|section|SDK|App Store',
  fileURLToPath(new URL('./marketing-behavior.test.mjs', import.meta.url))], { stdio: 'inherit' });
