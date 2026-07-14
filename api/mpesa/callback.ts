import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

// ── Firebase ──────────────────────────────────────────────────────────────────
const FB_CONFIG = {
  apiKey:     'AIzaSyASTxsK_MfvVDxpZf_1-MwO3duQuhp4sl8',
  authDomain: 'dopha-5002f.firebaseapp.com',
  projectId:  'dopha-5002f',
};
const fbApp = getApps().length > 0 ? getApps()[0] : initializeApp(FB_CONFIG);
const db    = getFirestore(fbApp);

// Daraja expects this exact response to acknowledge receipt
const ACK = { ResultCode: 0, ResultDesc: 'Accepted' };

// ── Handler ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  // Always respond 200 to Daraja first — they retry on failures
  if (req.method !== 'POST') {
    return res.status(200).json(ACK);
  }

  try {
    const cb = req.body?.Body?.stkCallback as {
      CheckoutRequestID:  string;
      ResultCode:         number;
      ResultDesc:         string;
      CallbackMetadata?:  { Item: Array<{ Name: string; Value: unknown }> };
    } | undefined;

    if (!cb) return res.status(200).json(ACK);

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = cb;
    const success = ResultCode === 0;

    // Extract M-Pesa receipt number on success
    let mpesaRef: string | null = null;
    if (success && CallbackMetadata?.Item) {
      const receipt = CallbackMetadata.Item.find(i => i.Name === 'MpesaReceiptNumber');
      if (receipt?.Value) mpesaRef = String(receipt.Value);
    }

    // Look up which session owns this checkout request
    const lookupSnap = await getDoc(doc(db, 'mpesa_lookups', CheckoutRequestID));
    if (!lookupSnap.exists()) {
      console.warn('mpesa_lookups: no entry for', CheckoutRequestID);
      return res.status(200).json(ACK);
    }

    const { sessionId } = lookupSnap.data() as { sessionId: string; msgId: string };
    const now = new Date().toISOString();

    // ── Write payment result to session doc as a nested map ──────────────────
    // We DON'T modify the messages array (avoids race conditions).
    // Instead we write to paymentStatuses.{checkoutRequestId} — the frontend
    // reads this alongside the message for the live status.
    await updateDoc(doc(db, 'chats', sessionId), {
      [`paymentStatuses.${CheckoutRequestID}`]: {
        status:    success ? 'success' : 'failed',
        mpesaRef:  mpesaRef,
        updatedAt: now,
      },
      unreadByStaff: true,   // ping staff of payment outcome
      lastActivity:  now,
    });

  } catch (err) {
    // Log but still return 200 so Daraja doesn't retry indefinitely
    console.error('M-Pesa callback error:', err);
  }

  return res.status(200).json(ACK);
}
