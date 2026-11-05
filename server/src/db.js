import dns from 'node:dns';
import mongoose from 'mongoose';
import { seedLegendCourses } from './controllers/legendCourses.js';

const LOCAL_MONGODB_URI = 'mongodb://127.0.0.1:27017/coding-bomul';

let connecting;

function mongoUri() {
  const atlas = (process.env.MONGO_ATLAS_URL || process.env.MONGOOB_ATLAS_URL || '').trim();
  return atlas || LOCAL_MONGODB_URI;
}

function usingAtlas(uri) {
  return uri.startsWith('mongodb+srv://') || uri.includes('mongodb.net');
}

function prepareAtlasDns() {
  const servers = dns.getServers();
  if (servers.every((server) => server === '127.0.0.1' || server === '::1' || server.startsWith('127.0.0.1'))) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
  dns.setDefaultResultOrder('ipv4first');
}

export async function connectDb() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!connecting) {
    connecting = (async () => {
      const uri = mongoUri();
      if (process.env.VERCEL && uri === LOCAL_MONGODB_URI) {
        const error = new Error('MongoDB 주소가 없습니다. MONGO_ATLAS_URL을 확인하세요.');
        error.status = 500;
        throw error;
      }
      const atlas = usingAtlas(uri);
      if (atlas) prepareAtlasDns();
      const timeoutMs = process.env.VERCEL ? 8000 : (atlas ? 15000 : 5000);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: timeoutMs });
      await seedLegendCourses();
      console.log(`MongoDB 연결됨: ${mongoose.connection.name} (${atlas ? 'Atlas' : '로컬'})`);
      return mongoose.connection;
    })().catch((error) => {
      connecting = undefined;
      throw error;
    });
  }
  return connecting;
}
