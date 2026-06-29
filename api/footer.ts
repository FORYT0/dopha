import { kv } from '@vercel/kv';

const ADMIN_PASS = 'dopha2025';
const KEY = 'dopha:footer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const footer = await kv.get(KEY);
      res.status(200).json({ footer: footer ?? null });
    } catch {
      res.status(200).json({ footer: null });
    }
    return;
  }

  if (req.method === 'POST') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { password, footer } = req.body ?? {};
    if (password !== ADMIN_PASS) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    try {
      await kv.set(KEY, footer);
      res.status(200).json({ ok: true });
    } catch (e) {
      console.error('KV footer write error:', e);
      res.status(500).json({ error: 'Write failed' });
    }
    return;
  }

  res.status(405).end();
}
