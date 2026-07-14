import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Check, CheckCheck, RefreshCw, ShoppingBasket } from 'lucide-react';
import { doc, updateDoc, arrayUnion, onSnapshot, type DocumentSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  useChatContext, saveIdentity, normalizePhone, genSessionId, genMsgId,
  type FirestoreMessage, type OrderItem,
} from '../context/ChatContext';
import { doc as fsDoc, setDoc } from 'firebase/firestore';

// ── WhatsApp brand colours ──────────────────────────────────────────────────
const WA_DARK       = '#075E54';
const WA_GREEN      = '#25D366';
const WA_LIGHT      = '#128C7E';
const WA_BG         = '#ECE5DD';
const WA_BUBBLE_OUT = '#DCF8C6';
const WA_INPUT_BG   = '#F0F2F5';

// ── Types ───────────────────────────────────────────────────────────────────
type MsgStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

interface Message {
  id:                 string;
  text:               string;
  from:               'user' | 'shop';
  time:               string;
  status:             MsgStatus;
  isLocal?:           boolean;
  type?:              'text' | 'order' | 'quote' | 'payment';
  order?:             OrderItem[];
  orderRef?:          string;
  total?:             number;
  // payment
  paymentStatus?:     'pending' | 'success' | 'failed';
  checkoutRequestId?: string;
  mpesaRef?:          string;
  amount?:            number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const QUICK_REPLIES = [
  '📦 Is a specific item in stock?',
  '💰 Pricing & delivery details',
  '🛒 I want to place an order',
  '🛠️ I need technical help',
];

// WhatsApp logo
function WAIcon({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 180, 360].map(d => (
            <span key={d} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: `${d}ms`, animationDuration: '1s' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Order card (rendered inside chat bubbles) ─────────────────────────────────
function OrderCard({ items, orderRef, fromStaff = false }: { items: OrderItem[]; orderRef?: string; fromStaff?: boolean }) {
  return (
    <div className={`rounded-2xl overflow-hidden shadow-sm text-sm ${fromStaff ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
      style={{ background: 'white', minWidth: '210px' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#E7F8EE', borderBottom: '1px solid #d1f0dd' }}>
        <ShoppingBasket size={14} style={{ color: WA_GREEN }} />
        <span className="text-xs font-semibold text-gray-700">Order Request</span>
        {orderRef && <span className="ml-auto text-[10px] font-mono text-gray-400">{orderRef}</span>}
      </div>
      {/* Items */}
      <div className="divide-y divide-gray-100">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2 px-3 py-2">
            {item.image ? (
              <img src={item.image} alt={item.name}
                className="w-7 h-7 rounded-lg object-cover shrink-0 border border-gray-100" />
            ) : (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: WA_LIGHT }}>
                {item.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="flex-1 text-xs text-gray-800 truncate">{item.name}</span>
            <span className="text-xs font-semibold text-gray-500 shrink-0">×{item.qty}</span>
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className="px-3 py-2 text-[10px] text-gray-400 italic" style={{ borderTop: '1px solid #f0f0f0' }}>
        {items.reduce((s, i) => s + i.qty, 0)} unit{items.reduce((s, i) => s + i.qty, 0) !== 1 ? 's' : ''} · awaiting price quote…
      </div>
    </div>
  );
}

// ── Quote card (staff reply with prices — shown to customer) ─────────────────
function QuoteCard({ items, orderRef, total }: { items: OrderItem[]; orderRef?: string; total?: number }) {
  const grand = total ?? items.reduce((s, i) => s + (i.price || 0) * i.qty, 0);
  return (
    <div className="rounded-2xl rounded-tl-sm overflow-hidden shadow-sm text-sm bg-white" style={{ minWidth: '220px' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#EEF4FF', borderBottom: '1px solid #C7D7FC' }}>
        <CheckCheck size={14} style={{ color: '#3B5BDB' }} />
        <span className="text-xs font-semibold text-gray-700">Your Quote</span>
        {orderRef && <span className="ml-auto text-[10px] font-mono text-gray-400">{orderRef}</span>}
      </div>
      {/* Items */}
      <div className="divide-y divide-gray-100">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2 px-3 py-2.5">
            {item.image ? (
              <img src={item.image} alt={item.name}
                className="w-7 h-7 rounded-lg object-cover shrink-0 border border-gray-100" />
            ) : (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: '#3B5BDB' }}>
                {item.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-800 truncate block">{item.name}</span>
              {item.price != null && (
                <span className="text-[10px] text-gray-400">
                  KSh {item.price.toLocaleString()} × {item.qty}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-gray-800 shrink-0">
              KSh {((item.price || 0) * item.qty).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      {/* Total */}
      <div className="flex items-center justify-between px-3 py-2.5"
        style={{ background: '#EEF4FF', borderTop: '1px solid #C7D7FC' }}>
        <span className="text-xs font-semibold text-gray-600">Total</span>
        <span className="text-base font-extrabold" style={{ color: '#3B5BDB' }}>
          KSh {grand.toLocaleString()}
        </span>
      </div>
      <div className="px-3 py-1.5 text-[10px] text-gray-400 italic">
        Quoted by Dopha Electronics
      </div>
    </div>
  );
}

// ── Payment status card (shown to customer for type==='payment' messages) ─────
function PaymentCard({
  status, amount, mpesaRef,
}: {
  status: 'pending' | 'success' | 'failed';
  amount?: number;
  mpesaRef?: string | null;
}) {
  if (status === 'success') {
    return (
      <div className="rounded-2xl rounded-tl-sm overflow-hidden shadow-sm"
        style={{ background: '#F0FFF4', border: '1px solid #86EFAC', minWidth: '200px' }}>
        <div className="flex items-center gap-2 px-3 py-2"
          style={{ background: '#DCFCE7', borderBottom: '1px solid #86EFAC' }}>
          <CheckCheck size={14} className="text-green-600" />
          <span className="text-xs font-semibold text-green-800">Payment Confirmed ✓</span>
        </div>
        <div className="px-3 py-2.5">
          {amount != null && (
            <p className="text-sm font-bold text-gray-800">KSh {amount.toLocaleString()}</p>
          )}
          {mpesaRef && (
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">Ref: {mpesaRef}</p>
          )}
          <p className="text-[11px] text-green-700 mt-1">Thank you! Our team will process your order.</p>
        </div>
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="rounded-2xl rounded-tl-sm overflow-hidden shadow-sm"
        style={{ background: '#FFF5F5', border: '1px solid #FCA5A5', minWidth: '200px' }}>
        <div className="flex items-center gap-2 px-3 py-2"
          style={{ background: '#FEE2E2', borderBottom: '1px solid #FCA5A5' }}>
          <span className="text-red-500 text-sm font-bold">✕</span>
          <span className="text-xs font-semibold text-red-700">Payment Failed</span>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-xs text-gray-600">The payment was cancelled or timed out. You can try again.</p>
        </div>
      </div>
    );
  }
  // pending
  return (
    <div className="rounded-2xl rounded-tl-sm overflow-hidden shadow-sm"
      style={{ background: '#FFFDE7', border: '1px solid #FFE082', minWidth: '200px' }}>
      <div className="flex items-center gap-2 px-3 py-2"
        style={{ background: '#FFF9C4', borderBottom: '1px solid #FFE082' }}>
        <RefreshCw size={13} className="animate-spin text-amber-500" />
        <span className="text-xs font-semibold text-amber-800">Awaiting M-Pesa</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs text-gray-600">📱 Check your phone and enter your M-Pesa PIN.</p>
        {amount != null && (
          <p className="text-sm font-bold text-gray-800 mt-1">KSh {amount.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}

// ── M-Pesa Pay section (appears below QuoteCard when no payment exists yet) ───
function PaySection({
  total, orderRef, sessionId, defaultPhone,
}: {
  total: number;
  orderRef?: string;
  sessionId: string;
  defaultPhone?: string;
}) {
  const [step,  setStep]  = useState<'idle' | 'confirm' | 'loading'>('idle');
  const [phone, setPhone] = useState(defaultPhone || '');
  const [err,   setErr]   = useState('');

  const initiate = async () => {
    setErr('');
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9) { setErr('Enter a valid Kenyan phone number'); return; }
    setStep('loading');
    try {
      const r = await fetch('/api/mpesa/stkpush', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone, amount: total, orderRef, sessionId }),
      });
      if (!r.ok) {
        const d = await r.json() as { error?: string };
        setErr(d.error || 'Payment failed. Please try again.');
        setStep('confirm');
        return;
      }
      // success — payment message will appear via Firestore listener
      setStep('idle');
    } catch {
      setErr('Network error. Please try again.');
      setStep('confirm');
    }
  };

  return (
    <div className="mt-1 rounded-xl overflow-hidden border border-indigo-200"
      style={{ background: '#F8FAFF' }}>
      {step === 'idle' && (
        <button
          onClick={() => setStep('confirm')}
          className="w-full py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          style={{ background: '#3B5BDB' }}
        >
          💚 Pay KSh {total.toLocaleString()} with M-Pesa
        </button>
      )}
      {(step === 'confirm' || step === 'loading') && (
        <div className="p-3 flex flex-col gap-2">
          <p className="text-xs font-medium text-gray-600">Send M-Pesa prompt to:</p>
          <input
            type="tel"
            value={phone}
            onChange={e => { setPhone(e.target.value); setErr(''); }}
            placeholder="e.g. 0712 743 428"
            disabled={step === 'loading'}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-400 bg-white disabled:bg-gray-50"
          />
          {err && <p className="text-[11px] text-red-500">{err}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => { setStep('idle'); setErr(''); }}
              disabled={step === 'loading'}
              className="flex-1 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-white disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={initiate}
              disabled={step === 'loading' || !phone.trim()}
              className="flex-1 py-1.5 text-xs font-semibold text-white rounded-lg flex items-center justify-center gap-1 disabled:opacity-50"
              style={{ background: '#3B5BDB' }}
            >
              {step === 'loading'
                ? <><RefreshCw size={11} className="animate-spin" /> Sending…</>
                : 'Confirm & Pay'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Identity form ─────────────────────────────────────────────────────────────
interface StartFormProps { onSubmit: (name: string, phone: string) => void; }

function StartForm({ onSubmit }: StartFormProps) {
  const [name, setName]   = useState('');
  const [phone, setPhone] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => { nameRef.current?.focus(); }, []);

  const submit = () => { if (name.trim().length >= 2) onSubmit(name.trim(), phone.trim()); };

  return (
    <div className="flex-1 flex flex-col justify-center px-5 py-6 gap-4" style={{ background: WA_BG }}>
      <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
        <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-lg font-bold"
          style={{ background: WA_LIGHT }}>DE</div>
        <p className="font-semibold text-gray-800">Dopha Electronics</p>
        <p className="text-xs text-gray-500 mt-1">Tell us a bit about yourself so our team can help you personally.</p>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Your name *</label>
          <input ref={nameRef} type="text" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()} placeholder="e.g. John"
            className="w-full rounded-lg px-3 py-2 text-sm border border-gray-200 outline-none focus:border-green-400 transition-colors" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">
            WhatsApp / Phone <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()} placeholder="e.g. 0712 743 428"
            className="w-full rounded-lg px-3 py-2 text-sm border border-gray-200 outline-none focus:border-green-400 transition-colors" />
          <p className="text-[10px] text-gray-400 mt-1">Enter your number to restore this chat from any device later.</p>
        </div>
        <button onClick={submit} disabled={name.trim().length < 2}
          className="w-full py-2.5 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: WA_GREEN }}>
          Start Chat
        </button>
      </div>
    </div>
  );
}

// ── Persistence (messages only — identity lives in ChatContext) ───────────────
const MSG_KEY = 'dopha_chat_msgs';

function loadMessages(sessionId: string): Message[] {
  try {
    const raw = localStorage.getItem(MSG_KEY);
    if (!raw) return [];
    const stored = JSON.parse(raw) as { sessionId: string; messages: Message[] };
    if (stored.sessionId === sessionId) return stored.messages;
  } catch {}
  return [];
}

function saveMsgs(sessionId: string, messages: Message[]) {
  try { localStorage.setItem(MSG_KEY, JSON.stringify({ sessionId, messages })); } catch {}
}

// ── Main 