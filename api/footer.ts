import { put, list } from '@vercel/blob';

const ADMIN_PASS = 'dopha2025';
const BLOB_PATH  = 'dopha/footer.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: BLOB_PATH });
      const blob = blobs.find(b => b.pathname === BLOB_PATH);
      if (!blob) {
        res.status(200).json({ footer: null });
        return;
      }
      const data = await fetch(blob.url).then(r => r.json());
      res.status(200).json({ footer: data });
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
      await put(BLOB_PATH, JSON.stringify(footer), {
        access:            'public',
        addRandomSuffix:   false,
        contentType:       'application/json',
        cacheControlMaxAge: 0,
      });
      res.status(200).json({ ok: true });
    } catch (e) {
      console.error('Blob footer write error:', e);
      res.status(500).json({ error: 'Write failed' });
    }
    return;
  }

  res.status(405).end();
}
