export default function handler(req, res) {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.statusCode = 200;
  res.end(JSON.stringify({ status: 'ok', probe: 'vercel-api' }));
}
