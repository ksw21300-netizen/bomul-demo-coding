import { existsSync } from 'node:fs';
import dns from 'node:dns';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import app from './app.js';
import { seedLegendCourses } from './controllers/legendCourses.js';

const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env');
if (existsSync(envPath)) process.loadEnvFile(envPath);

const { PORT = 4000 } = process.env;
const LOCAL_MONGODB_URI = 'mongodb://127.0.0.1:27017/coding-bomul';
const mongoUri = process.env.MONGODB_ATLAS_URL?.trim()
  || process.env.MONGO_URI?.trim()
  || LOCAL_MONGODB_URI;
const usingAtlas = mongoUri.startsWith('mongodb+srv://') || mongoUri.includes('mongodb.net');

if (usingAtlas) {
  // Node가 127.0.0.1 DNS만 쓰면 mongodb+srv 조회가 거절된다. 공개 DNS로 우회한다.
  const servers = dns.getServers();
  if (servers.every((server) => server === '127.0.0.1' || server === '::1' || server.startsWith('127.0.0.1'))) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
  dns.setDefaultResultOrder('ipv4first');
}

try {
  // Atlas는 DNS 조회가 있어 조금 더 기다리고, 로컬은 꺼져 있으면 빨리 실패한다.
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: usingAtlas ? 15000 : 5000 });
} catch (error) {
  console.error('MongoDB 연결 실패:', error.message);
  process.exit(1);
}
await seedLegendCourses();
console.log(`MongoDB 연결됨: ${mongoose.connection.name} (${usingAtlas ? 'Atlas' : '로컬'})`);

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
