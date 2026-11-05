import { connectDb } from '../server-src/db.js';
import app from '../server-src/app.js';

function restoreApiUrl(req) {
  const forwarded = req.headers['x-forwarded-uri'] || req.headers['x-invoke-path'];
  if (typeof forwarded !== 'string' || !forwarded.startsWith('/api')) return;
  req.url = forwarded;
}

export default async function handler(req, res) {
  restoreApiUrl(req);
  await connectDb();
  return app(req, res);
}
