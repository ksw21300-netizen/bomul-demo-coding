import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const clientDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(clientDir, '../server/src');
const dest = join(clientDir, 'server-src');

if (!existsSync(source)) process.exit(0);

rmSync(dest, { recursive: true, force: true });
cpSync(source, dest, { recursive: true });
