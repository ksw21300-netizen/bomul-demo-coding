import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDb } from './db.js';

const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env');
if (existsSync(envPath)) process.loadEnvFile(envPath);

const { PORT = 4000 } = process.env;

try {
  await connectDb();
} catch (error) {
  console.error('MongoDB 연결 실패:', error.message);
  process.exit(1);
}

const server = app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});

function shutdown(signal) {
  server.close(() => {
    mongoose.disconnect().finally(() => {
      if (signal === 'SIGUSR2') {
        process.kill(process.pid, 'SIGUSR2');
        return;
      }
      process.exit(0);
    });
  });
}

process.once('SIGUSR2', () => shutdown('SIGUSR2'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
