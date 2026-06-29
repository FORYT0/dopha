import { kv } from '@vercel/kv';

const ADMIN_PASS = 'dopha2025';
const KEY = 'dopha:catalog';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const products = await kv.get(KEY);
      res.status(200).json({ products: products ?? null });
    } catch {
      res.status(200).json({ products: null });
    }
    return;
  }

  if (req.method === 'POST') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { password, products } = req.body ?? {};
    if (password !== ADMIN_PASS) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    try {
      await kv.set(KEY, products);
      res.status(200).json({ ok: true });
    } catch (e) {
      console.error('KV catalog write error:', e);
      res.status(500).json({ error: 'Write failed' });
    }
    return;
  }

  res.status(405).end();
}
