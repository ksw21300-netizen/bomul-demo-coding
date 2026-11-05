import { connectDb } from '../src/db.js';
import app from '../src/app.js';

export default async function handler(req, res) {
  await connectDb();
  return app(req, res);
}
