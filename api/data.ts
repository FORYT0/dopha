import { put, list } from '@vercel/blob';

const ADMIN_PASS = 'dopha2025';
const BLOB_PATH  = 'dopha/data.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  // Allow same-origin reads (needed when Vite dev server proxies differ)
  res.setHeader('Access-Control-Allow-Origin', '*');

  // ── GET — return published data ───────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: BLOB_PATH });
      const blob = blobs.find(b => b.pathname === BLOB_PATH);
      if (!blob) {
        return res.status(200).json({ data: null });
      }
      // Fetch the blob content (public URL — no token needed)
      const json = await fetch(blob.url).then(r => r.json());
      return res.status(200).json({ data: json });
    } catch (e) {
      console.error('Blob GET error:', e);
      return res.status(200).json({ data: null });
    }
  }

  // ── POST — save all data ──────────────────────────────────────────────────
  if (req.method === 'POST') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { password, products, footer, content } = req.body ?? {};

    if (password !== ADMIN_PASS) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      await put(
        BLOB_PATH,
        JSON.stringify({ products, footer, content }),
        {
          access:             'public',
          addRandomSuffix:    false,
          contentType:        'application/json',
          cacheControlMaxAge: 0,   // always fetch fresh
        }
      );
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('Blob POST error:', e);
      return res.status(500).json({ error: 'Write failed' });
    }
  }

  return res.status(405).end();
}
