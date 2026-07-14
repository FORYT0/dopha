import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore, doc, updateDoc, arrayUnion, setDoc,
} from 'firebase/firestore';

// ── Firebase (same project as frontend) ─────────────────────────────────────
const FB_CONFIG = {
  apiKey:    'AIzaSyASTxsK_MfvVDxpZf_1-MwO3duQuhp4sl8',
  authDomain:'dopha-5002f.firebaseapp.com',
  projectId: 'dopha-5002f',
};
const fbApp = getApps().length > 0 ? getApps()[0] : initializeApp(FB_CONFIG);
const db    = getFirestore(fbApp);

// ── Daraja base URL ──────────────────────────────────────────────────────────
const DARAJA = process.env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

// ── Get OAuth token ──────────────────────────────────────────────────────────
async function getToken(): Promise<string> {
  const b64 = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const res = await fetch(
    `${DARAJA}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${b64}` } }
  );
  if (!res.ok) throw new Error(`Daraja auth failed: ${res.status}`);
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

// ── Normalize phone to 254XXXXXXXXX ─────────────────────────────────────────
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('0')   && digits.length === 10) return '254' + digits.slice(1);
  if (digits.length === 9)                               return '254' + digits;
  return digits;
}

// ── Handler ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    phone: rawPhone,
    amount,
    orderRef,
    sessionId,
  } = req.body as {
    phone: string;
    amount: number;
    orderRef?: string;
    sessionId: string;
  };

  if (!rawPhone || !amount || !sessionId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const phone      = normalizePhone(rawPhone);
  const shortcode  = process.env.MPESA_SHORTCODE!;
  const passkey    = process.env.MPESA_PASSKEY!;
  const callbackUrl = `${process.env.MPESA_CALLBACK_URL}/api/mpesa/callback`;

  try {
    // 1. Get access token
    const token = await getToken();

    // 2. Build STK Push payload
    const ts       = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${ts}`).toString('base64');

    const stkRes = await fetch(`${DARAJA}/mpesa/stkpush/v1/processrequest`, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password:          password,
        Timestamp:         ts,
        TransactionType:   'CustomerPayBillOnline',
        Amount:            Math.ceil(amount),
        PartyA:            phone,
        PartyB:            shortcode,
        PhoneNumber:       phone,
        CallBackURL:       callbackUrl,
        AccountReference:  orderRef || 'DOPHA',
        TransactionDesc:   `Dopha Electronics ${orderRef || 'Order'}`,
      }),
    });

    const stk = await stkRes.json() as {
      ResponseCode:      string;
      ResponseDescription: string;
      CheckoutRequestID: string;
    };

    if (stk.ResponseCode !== '0') {
      console.error('STK Push rejected:', stk);
      return res.status(400).json({ error: stk.ResponseDescription || 'STK Push failed' });
    }

    const checkoutRequestId = stk.CheckoutRequestID;
    const msgId = `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now   = new Date().toISOString();

    // 3. Write pending payment message to the chat session
    const paymentMsg = {
      id:                msgId,
      text:              `M-Pesa payment — KSh ${Math.ceil(amount).toLocaleString()}`,
      from:              'user',
      time:              now,
      type:              'payment',
      paymentStatus:     'pending',
      amount:            Math.ceil(amount),
      orderRef:          orderRef ?? null,
      checkoutRequestId,
    };

    try {
      await updateDoc(doc(db, 'chats', sessionId), {
        messages:      arrayUnion(paymentMsg),
        lastActivity:  now,
        unreadByStaff: true,
      });
    } catch {
      // Session doc might not exist yet (edge case) — create it
      await setDoc(doc(db, 'chats', sessionId), {
        sessionId,
        messages:      [paymentMsg],
        createdAt:     now,
        lastActivity:  now,
        unreadByStaff: true,
      });
    }

    // 4. Write lookup so callback can find the session
    await setDoc(doc(db, 'mpesa_lookups', checkoutRequestId), {
      sessionId,
      msgId,
      amount:    Math.ceil(amount),
      orderRef:  orderRef ?? null,
      createdAt: now,
    });

    return res.status(200).json({ ok: true, checkoutRequestId, msgId });
  } catch (err) {
    console.error('STK Push error:', err);
    return res.status(500).json({ error: 'Payment initiation failed. Try again.' });
  }
}
