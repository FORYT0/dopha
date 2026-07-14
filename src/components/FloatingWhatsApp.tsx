import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Check, CheckCheck, RefreshCw } from 'lucide-react';
import { doc, setDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  id:       string;
  text:     string;
  from:     'user' | 'shop';
  time:     string;
  status:   MsgStatus;
  isLocal?: boolean;
}

interface FirestoreMessage {
  id:   string;
  text: string;
  from: 'user' | 'staff';
  time: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function genId(prefix = 'x') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function genSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Normalize phone → consistent session key regardless of format entered. */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0') && digits.length >= 9) return '254' + digits.slice(1);
  if (digits.length >= 9) return '254' + digits.slice(-9);
  return digits;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const QUICK_REPLIES = [
  '📦 Is a specific item in stock?',
  '💰 Pricing & delivery details',
  '🛒 I want to place an order',
  '🛠️ I need technical help',
];

// WhatsApp logo SVG
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

// ── Persistence ───────────────────────────────────────────────────────────────
const STORE_KEY = 'dopha_chat_v2';

interface StoredChat {
  sessionId:     string;
  customerName:  string;
  customerPhone: string;
  messages:      Message[];
}

function loadStored(): StoredChat {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as StoredChat;
  } catch {}
  return { sessionId: genSessionId(), customerName: '', customerPhone: '', messages: [] };
}

function saveStored(data: StoredChat) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch {}
}

// ── Start-chat form ───────────────────────────────────────────────────────────
interface StartFormProps {
  onSubmit: (name: string, phone: string) => void;
}

function StartForm({ onSubmit }: StartFormProps) {
  const [name,  setName]  = useState('');
  const [phone, setPhone] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const submit = () => {
    if (name.trim().length < 2) return;
    onSubmit(name.trim(), phone.trim());
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-5 py-6 gap-4" style={{ background: WA_BG }}>
      {/* Welcome card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
        <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-lg font-bold" style={{ background: WA_LIGHT }}>
          DE
        </div>
        <p className="font-semibold text-gray-800">Dopha Electronics</p>
        <p className="text-xs text-gray-500 mt-1">Tell us a bit about yourself so our team can help you personally.</p>
      </div>

      {/* Fields */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Your name *</label>
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="e.g. John"
            className="w-full rounded-lg px-3 py-2 text-sm border border-gray-200 outline-none focus:border-green-400 transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">
            WhatsApp / Phone
            <span className="ml-1 font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="e.g. 0712 743 428"
            className="w-full rounded-lg px-3 py-2 text-sm border border-gray-200 outline-none focus:border-green-400 transition-colors"
          />
          <p className="text-[10px] text-gray-400 mt-1">
            Enter your number to restore this chat from any device later.
          </p>
        </div>

        <button
          onClick={submit}
          disabled={name.trim().length < 2}
          className="w-full py-2.5 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: WA_GREEN }}
        >
          Start Chat
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FloatingWhatsApp() {
  const initial = useRef(loadStored());

  const [sessionId,     setSessionId]     = useState(initial.current.sessionId);
  const [customerName,  setCustomerName]  = useState(initial.current.customerName);
  const [customerPhone, setCustomerPhone] = useState(initial.current.customerPhone);
  const [messages,      setMessages]      = useState<Message[]>(initial.current.messages);
  const [open,          setOpen]          = useState(false);
  const [input,         setInput]         = useState('');
  const [typing,        setTyping]        = useState(false);
  const [unread,        setUnread]        = useState(0);
  const [sending,       setSending]       = useState(false);

  const hasIdentity = customerName.length > 0;

  // IDs of staff messages already shown (prevent duplicates & track for badge)
  const seenStaffIds = useRef<Set<string>>(
    new Set(initial.current.messages.filter(m => m.from === 'shop' && !m.isLocal).map(m => m.id)),
  );

  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Persist everything to localStorage ───────────────────────────────────
  useEffect(() => {
    saveStored({ sessionId, customerName, customerPhone, messages });
  }, [sessionId, customerName, customerPhone, messages]);

  // ── Handle form submit ────────────────────────────────────────────────────
  const handleStartChat = useCallback((name: string, phone: string) => {
    const normalized = normalizePhone(phone);
    // Phone-based session ID allows cross-device restoration
    const sid = normalized ? `ph-${normalized}` : genSessionId();
    setCustomerName(name);
    setCustomerPhone(normalized);
    setSessionId(sid);
    setMessages([]);
    seenStaffIds.current.clear();
  }, []);

  // ── Greeting after identity is set + chat opens ───────────────────────────
  const prevOpen = useRef(false);
  useEffect(() => {
    if (!open) { setUnread(0); prevOpen.current = false; return; }
    setUnread(0);
    if (prevOpen.current) return; // already shown greeting this session
    prevOpen.current = true;
    if (!hasIdentity) return; // wait for form
    if (messages.length === 0) {
      setTyping(true);
      const t = setTimeout(() => {
        setTyping(false);
        setMessages([{
          id:      'greeting',
          text:    `👋 Hi ${customerName}! Welcome to Dopha Electronics.\n\nWe have 140+ components in stock — Arduino, sensors, resistors, capacitors, displays, modules and more.\n\nWhat can we help you with today?`,
          from:    'shop',
          time:    new Date().toISOString(),
          status:  'read',
          isLocal: true,
        }]);
      }, 1200);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hasIdentity]);

  // ── Firestore real-time listener ──────────────────────────────────────────
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    if (!hasIdentity) return; // don't listen before identity set
    const unsub = onSnapshot(doc(db, 'chats', sessionId), (snap) => {
      if (!snap.exists()) return;
      const data    = snap.data() as { messages?: FirestoreMessage[] };
      const allMsgs = (data.messages ?? []).slice().sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
      );

      setMessages(prev => {
        const localOnly = prev.filter(m => m.isLocal);
        const inFlight  = prev.filter(m => !m.isLocal && m.from === 'user' && m.status === 'sending');
        const fromStore: Message[] = allMsgs.map(m => ({
          id:     m.id,
          text:   m.text,
          from:   m.from === 'staff' ? ('shop' as const) : ('user' as const),
          time:   m.time,
          status: 'read' as MsgStatus,
        }));
        const storeIds    = new Set(fromStore.map(m => m.id));
        const stillFlying = inFlight.filter(m => !storeIds.has(m.id));
        return [...localOnly, ...fromStore, ...stillFlying]
          .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      });

      // Auto-open + badge for new staff messages
      const newStaff = allMsgs.filter(
        m => m.from === 'staff' && !seenStaffIds.current.has(m.id),
      );
      if (newStaff.length > 0) {
        newStaff.forEach(m => seenStaffIds.current.add(m.id));
        if (!openRef.current) {
          const hasRecent = newStaff.some(
            m => Date.now() - new Date(m.time).getTime() < 24 * 60 * 60 * 1000,
          );
          if (hasRecent) setOpen(true);
          else setUnread(n => n + newStaff.length);
        }
      }
    });
    return () => unsub();
  }, [sessionId, hasIdentity]);

  // ── Scroll / focus ────────────────────────────────────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open && hasIdentity) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open, hasIdentity]);

  // ── Send message ──────────────────────────────────────────────────────────
  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending || !hasIdentity) return;

    const msgId = genId('u');
    const now   = new Date().toISOString();
    const fsMsg: FirestoreMessage = { id: msgId, text: trimmed, from: 'user', time: now };
    const uiMsg: Message          = { id: msgId, text: trimmed, from: 'user', time: now, status: 'sending' };

    setMessages(prev => [...prev, uiMsg]);
    setInput('');
    setSending(true);

    try {
      const docRef = doc(db, 'chats', sessionId);
      try {
        await updateDoc(docRef, {
          messages:      arrayUnion(fsMsg),
          lastActivity:  now,
          unreadByStaff: true,
        });
      } catch {
        // First message — create document with customer info
        await setDoc(docRef, {
          sessionId,
          customerName,
          customerPhone: customerPhone || null,
          messages:      [fsMsg],
          createdAt:     now,
          lastActivity:  now,
          unreadByStaff: true,
        });
      }
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'delivered' } : m));
    } catch {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'failed' } : m));
    } finally {
      setSending(false);
    }
  }, [sending, hasIdentity, sessionId, customerName, customerPhone]);

  // ── Clear chat ────────────────────────────────────────────────────────────
  const clearChat = useCallback(() => {
    try { localStorage.removeItem(STORE_KEY); } catch {}
    window.location.reload();
  }, []);

  const hasUserSentAnything = messages.some(m => m.from === 'user');

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Chat card */}
      <div
        className="flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-black/5"
        style={{
          width:           '360px',
          height:          '520px',
          maxWidth:        'calc(100vw - 1.5rem)',
          background:      WA_BG,
          transformOrigin: 'bottom right',
          transform:       open ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(20px)',
          opacity:         open ? 1 : 0,
          pointerEvents:   open ? 'auto' : 'none',
          transition:      'transform 0.22s cubic-bezier(.22,1,.36,1), opacity 0.18s ease',
        }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center gap-3 px-4 py-3" style={{ background: WA_DARK }}>
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold select-none" style={{ background: WA_LIGHT }}>
              DE
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2" style={{ borderColor: WA_DARK }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">Dopha Electronics</p>
            <p className="text-green-300 text-xs">● Online · We reply in minutes</p>
          </div>
          <div className="flex items-center gap-1">
            {hasUserSentAnything && (
              <button onClick={clearChat} title="Clear chat" className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" />
                </svg>
              </button>
            )}
            <button onClick={() => setOpen(false)} title="Close" className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
              <X size={17} className="text-white/70" />
            </button>
          </div>
        </div>

        {/* Body — form OR chat */}
        {!hasIdentity ? (
          <StartForm onSubmit={handleStartChat} />
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2" style={{ background: WA_BG }}>
              <div className="flex justify-center mb-2">
                <span className="text-[10px] bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg px-3 py-1.5 text-center leading-snug max-w-[270px]">
                  🔒 Messages go directly to our team. We reply here in this chat.
                </span>
              </div>

              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[82%] rounded-2xl px-3 py-2 shadow-sm text-sm text-gray-800 ${msg.from === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                    style={{ background: msg.from === 'user' ? WA_BUBBLE_OUT : 'white' }}
                  >
                    <p className="leading-relaxed whitespace-pre-line break-words">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-gray-400">{formatTime(msg.time)}</span>
                      {msg.from === 'user' && (
                        msg.status === 'sending'   ? <RefreshCw size={11} className="text-gray-400 animate-spin" /> :
                        msg.status === 'failed'    ? <span className="text-[10px] text-red-400">!</span> :
                        msg.status === 'read'      ? <CheckCheck size={12} className="text-sky-500" /> :
                        msg.status === 'delivered' ? <CheckCheck size={12} className="text-gray-400" /> :
                                                      <Check size={12} className="text-gray-400" />
                      )}
                    </div>
                    {msg.status === 'failed' && (
                      <p className="text-[10px] text-red-400 mt-0.5">Failed to send — tap to retry</p>
                    )}
                  </div>
                </div>
              ))}

              {hasUserSentAnything && !messages.some(m => m.from === 'shop' && !m.isLocal) && !typing && (
                <div className="flex justify-center">
                  <span className="text-[10px] text-gray-400 bg-white/60 rounded-full px-3 py-1">
                    Our team will reply here shortly…
                  </span>
                </div>
              )}

              {typing && <TypingDots />}
              <div ref={endRef} />
            </div>

            {/* Quick replies */}
            {messages.length <= 1 && !typing && (
              <div className="shrink-0 flex gap-2 px-3 py-2 overflow-x-auto scrollbar-none" style={{ background: WA_BG }}>
                {QUICK_REPLIES.map(qr => (
                  <button key={qr} onClick={() => send(qr)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-400 transition-colors whitespace-nowrap shadow-sm">
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="shrink-0 flex items-center gap-2 px-3 py-3 border-t border-black/5" style={{ background: WA_INPUT_BG }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }}}
                placeholder="Type a message"
                className="flex-1 rounded-full px-4 py-2.5 text-sm bg-white outline-none border border-transparent focus:border-gray-300 transition-colors"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || sending}
                className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 disabled:opacity-40 disabled:scale-95 hover:scale-105 active:scale-95"
                style={{ background: WA_GREEN }}
              >
                {sending
                  ? <RefreshCw size={15} className="text-white animate-spin" />
                  : <Send size={16} className="text-white" style={{ transform: 'translateX(1px)' }} />
                }
              </button>
            </div>
          </>
        )}
      </div>

      {/* Floating button */}
      <div className="relative">
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-25 pointer-events-none" style={{ background: WA_GREEN }} />
        )}
        <button
          onClick={() => setOpen(o => !o)}
          title={open ? 'Close chat' : 'Chat with us'}
          className="relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95"
          style={{ background: WA_GREEN }}
          aria-label={open ? 'Close chat' : 'Open chat'}
        >
          <span className="absolute transition-all duration-200" style={{ opacity: open ? 1 : 0, transform: open ? 'scale(1)' : 'scale(0.5) rotate(-90deg)' }}>
            <X size={26} className="text-white" />
          </span>
          <span className="absolute transition-all duration-200" style={{ opacity: open ? 0 : 1, transform: open ? 'scale(0.5) rotate(90deg)' : 'scale(1)' }}>
            <WAIcon size={28} />
          </span>
        </button>

        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold pointer-events-none">
            {unread}
          </span>
        )}
      </div>
    </div>
  );
}
