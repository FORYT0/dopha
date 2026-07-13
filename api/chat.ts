import { put, list } from '@vercel/blob';

const ADMIN_PASS = 'dopha2025';
const BLOB_PATH  = 'dopha/chats.json';

// ── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id:   string;
  text: string;
  from: 'user' | 'staff';
  time: string;
}

interface ChatSession {
  sessionId:      string;
  messages:       ChatMessage[];
  createdAt:      string;
  lastActivity:   string;
  unreadByStaff:  boolean;
}

interface ChatStore {
  sessions: Record<string, ChatSession>;
}

// ── Blob helpers ─────────────────────────────────────────────────────────────
async function readChats(): Promise<ChatStore> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATH });
    const blob = blobs.find(b => b.pathname === BLOB_PATH);
    if (!blob) return { sessions: {} };
    const json = await fetch(`${blob.url}?t=${Date.now()}`).then(r => r.json());
    return json as ChatStore;
  } catch {
    return { sessions: {} };
  }
}

async function writeChats(data: ChatStore): Promise<void> {
  await put(BLOB_PATH, JSON.stringify(data), {
    access:             'public',
    addRandomSuffix:    false,
    contentType:        'application/json',
    cacheControlMaxAge: 0,
  });
}

// ── Handler ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── TEMP diagnostic: test a minimal blob write ────────────────────────────
  if (req.method === 'GET' && req.query.diagwrite === '1') {
    try {
      await put('dopha/diag-test.json', JSON.stringify({ ok: true, ts: Date.now() }), {
        access: 'public', addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 0,
      });
      return res.status(200).json({ blobWrite: 'ok' });
    } catch (e) {
      return res.status(500).json({ blobWrite: 'failed', error: e instanceof Error ? e.message : String(e) });
    }
  }

  // ── GET ── poll messages ──────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { session, staff, password } = req.query as Record<string, string>;

    // Staff: all sessions
    if (staff === '1') {
      if (password !== ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });
      const store = await readChats();
      const sessions = Object.values(store.sessions).sort(
        (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
      );
      return res.status(200).json({ sessions });
    }

    // Customer: their session's messages
    if (session) {
      const store = await readChats();
      const sess = store.sessions[session];
      return res.status(200).json({ messages: sess?.messages ?? [] });
    }

    return res.status(400).json({ error: 'Missing session parameter' });
  }

  // ── POST ── send message ──────────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      // Step 1: parse body
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body = typeof req.body === 'string'
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        ? JSON.parse(req.body)
        : (req.body ?? {});
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { sessionId, text, password } = body;

      if (!sessionId || !String(text ?? '').trim()) {
        return res.status(400).json({ error: 'Missing required fields', bodyType: typeof req.body });
      }

      // Step 2: read existing store
      const isStaff = password === ADMIN_PASS;
      const store   = await readChats();

      // Step 3: add session & message
      if (!store.sessions[sessionId]) {
        store.sessions[sessionId] = {
          sessionId,
          messages:      [],
          createdAt:     new Date().toISOString(),
          lastActivity:  new Date().toISOString(),
          unreadByStaff: true,
        };
      }
      const sess = store.sessions[sessionId];
      const msg: ChatMessage = {
        id:   `${isStaff ? 's' : 'u'}-${Date.now()}`,
        text: String(text).trim(),
        from: isStaff ? 'staff' : 'user',
        time: new Date().toISOString(),
      };
      sess.messages.push(msg);
      sess.lastActivity  = new Date().toISOString();
      sess.unreadByStaff = !isStaff;

      // Step 4: write — verify JSON is valid before sending
      const serialized = JSON.stringify(store);
      await put(BLOB_PATH, serialized, {
        access:             'public',
        addRandomSuffix:    false,
        contentType:        'application/json',
        cacheControlMaxAge: 0,
      });

      return res.status(200).json({ success: true, message: msg });
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      const stack  = e instanceof Error ? e.stack?.split('\n').slice(0, 3).join(' | ') : '';
      console.error('Chat POST error:', errMsg, stack);
      return res.status(500).json({ error: errMsg, stack });
    }
  }

  // ── PATCH ── mark session read by staff ───────────────────────────────────
  if (req.method === 'PATCH') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { sessionId, password } = req.body ?? {};
    if (password !== ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });

    const store = await readChats();
    if (store.sessions[sessionId]) {
      store.sessions[sessionId].unreadByStaff = false;
      await writeChats(store);
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}
