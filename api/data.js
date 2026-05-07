import { parse } from 'url';

export default async function handler(req, res) {
  const SUPA_URL = process.env.SUPABASE_URL;
  const SUPA_KEY = process.env.SUPABASE_KEY;

  if (!SUPA_URL || !SUPA_KEY) {
    return res.status(500).json({ error: 'Server config error' });
  }

  const { method } = req;
  const { query } = parse(req.url, true);
  const path = query.path || '';

  // body 읽기
  let body = null;
  if (method !== 'GET' && method !== 'DELETE') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString();
    if (raw) body = JSON.parse(raw);
  }

  try {
    const url = `${SUPA_URL}/rest/v1/${path}`;
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
        'Prefer': 'return=representation'
      }
    };
    if (body) opts.body = JSON.stringify(body);

    const response = await fetch(url, opts);
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    res.status(response.status).json(data || []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
