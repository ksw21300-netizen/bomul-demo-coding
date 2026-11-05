import { connectDb } from '../server-src/db.js';
import app from '../server-src/app.js';

export default async function handler(req, res) {
  await connectDb();
  return app(req, res);
}
