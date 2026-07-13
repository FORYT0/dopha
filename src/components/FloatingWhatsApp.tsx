import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Check, CheckCheck } from 'lucide-react';
import { useStaff } from '../context/StaffContext';

// ── WhatsApp brand colours ──────────────────────────────────────────────────
const WA_DARK        = '#075E54';
const WA_GREEN       = '#25D366';
const WA_LIGHT       = '#128C7E';
const WA_BG          = '#ECE5DD';
const WA_BUBBLE_OUT  = '#DCF8C6';
const WA_INPUT_BG    = '#F0F2F5';

// ── Types ───────────────────────────────────────────────────────────────────
interface Message {
  id:     string;
  text:   string;
  from:   'user' | 'shop';
  time:   string;   // ISO string
  status: 'sent' | 'delivered' | 'read';
}

// ── Static data ──────────────────────────────────────────────────────────────
const GREETING_MSG: Message = {
  id:     'greeting-001',
  text:   "👋 Hi there! Welcome to Dopha Electronics.\n\nWe stock 140+ electronic components — Arduino boards, sensors, resistors, capacitors, displays, power modules, cables, tools, and more.\n\nHow can we help you today?",
  from:   'shop',
  time:   new Date().toISOString(),
  status: 'read',
};

const AUTO_REPLY = (name: string): Message => ({
  id:     `auto-${Date.now()}`,
  text:   `✅ Message sent to ${name}!\n\nWhatsApp has opened in a new tab — just tap Send in WhatsApp and we'll get back to you shortly.\n\n⏰ We typically reply within minutes during business hours (Mon–Sat, 8AM–6PM EAT).`,
  from:   'shop',
  time:   new Date().toISOString(),
  status: 'read',
});

const QUICK_REPLIES = [
  '📦 Is a specific product in stock?',
  '💰 What are your delivery charges?',
  '🛒 I want to place an order',
  '🛠️ I need technical help',
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// WhatsApp SVG logo (official path)
function WhatsAppSVG({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// Typing indicator dots
function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 180, 360].map(delay => (
            <span
              key={delay}
              className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: `${delay}ms`, animationDuration: '1s' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function FloatingWhatsApp() {
  const { siteContent } = useStaff();

  // Strip non-digits from the stored WhatsApp number
  const phoneNumber = siteContent.whatsapp.replace(/\D/g, '') || '254700000000';
  const shopName    = 'Dopha Electronics';

  // ── State ──────────────────────────────────────────────────────────────────
  const [open,   setOpen]   = useState(false);
  const [input,  setInput]  = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);

  // Load messages from localStorage (lazy initialiser — no ordering issues)
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem('dopha_chat_v1');
      if (raw) return (JSON.parse(raw) as { messages: Message[] }).messages ?? [];
    } catch {}
    return [];
  });

  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Persist messages ───────────────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem('dopha_chat_v1', JSON.stringify({ messages }));
    } catch {}
  }, [messages]);

  // ── First open: show greeting after a short delay ──────────────────────────
  useEffect(() => {
    if (!open) return;

    // Clear unread counter
    setUnread(0);

    if (messages.length === 0) {
      setTyping(true);
      const t = setTimeout(() => {
        setTyping(false);
        setMessages([{ ...GREETING_MSG, time: new Date().toISOString() }]);
      }, 1600);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Scroll to bottom on new content ───────────────────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // ── Focus input when opened ────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ── Send handler ───────────────────────────────────────────────────────────
  const send = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id:     `u-${Date.now()}`,
      text:   trimmed,
      from:   'user',
      time:   new Date().toISOString(),
      status: 'sent',
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Tick: sent → delivered
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m => m.id === userMsg.id ? { ...m, status: 'delivered' } : m),
      );
    }, 700);

    // Open WhatsApp in new tab with message pre-filled
    const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(trimmed)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Auto-reply: typing indicator then message
    setTimeout(() => setTyping(true), 1400);
    setTimeout(() => {
      setTyping(false);
      const reply = AUTO_REPLY(shopName);
      setMessages(prev => [...prev, reply]);
      if (!open) setUnread(n => n + 1);
    }, 3800);
  }, [phoneNumber, shopName, open]);

  // ── Clear chat ─────────────────────────────────────────────────────────────
  const clearChat = useCallback(() => {
    setMessages([]);
    try { localStorage.removeItem('dopha_chat_v1'); } catch {}
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Chat card ────────────────────────────────────────────────────── */}
      <div
        className="pointer-events-auto flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-black/5"
        style={{
          width:          '360px',
          height:         '520px',
          maxWidth:       'calc(100vw - 2rem)',
          background:     WA_BG,
          // Slide-up / scale animation via CSS custom props
          transformOrigin: 'bottom right',
          transform:       open ? 'scale(1) translateY(0)'  : 'scale(0.85) translateY(20px)',
          opacity:         open ? 1 : 0,
          pointerEvents:   open ? 'auto' : 'none',
          transition:      'transform 0.22s cubic-bezier(.22,1,.36,1), opacity 0.18s ease',
        }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div
          className="shrink-0 flex items-center gap-3 px-4 py-3"
          style={{ background: WA_DARK }}
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold select-none"
              style={{ background: WA_LIGHT }}
            >
              DE
            </div>
            {/* Online dot */}
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2"
              style={{ borderColor: WA_DARK }}
            />
          </div>

          {/* Name + status */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{shopName}</p>
            <p className="text-green-300 text-xs">● Online · typically replies in minutes</p>
          </div>

          {/* Clear + Close */}
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                title="Clear chat"
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              title="Close"
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={17} className="text-white/70" />
            </button>
          </div>
        </div>

        {/* ── Messages area ─────────────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
          style={{ background: WA_BG }}
        >
          {/* Privacy notice */}
          <div className="flex justify-center mb-2">
            <span
              className="text-[10px] text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5 text-center leading-snug max-w-[270px]"
            >
              🔒 Messages open WhatsApp and are sent directly to our team.
            </span>
          </div>

          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-3 py-2 shadow-sm text-sm text-gray-800 ${
                  msg.from === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
                }`}
                style={{ background: msg.from === 'user' ? WA_BUBBLE_OUT : 'white' }}
              >
                <p className="leading-relaxed whitespace-pre-line break-words">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-gray-400">{formatTime(msg.time)}</span>
                  {msg.from === 'user' && (
                    msg.status === 'read'
                      ? <CheckCheck size={12} className="text-sky-500" />
                      : msg.status === 'delivered'
                        ? <CheckCheck size={12} className="text-gray-400" />
                        : <Check size={12} className="text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing dots */}
          {typing && <TypingDots />}

          {/* Scroll anchor */}
          <div ref={endRef} />
        </div>

        {/* ── Quick replies (visible when conversation is fresh) ─────────── */}
        {messages.length <= 1 && !typing && (
          <div
            className="shrink-0 flex gap-2 px-3 py-2 overflow-x-auto scrollbar-none"
            style={{ background: WA_BG }}
          >
            {QUICK_REPLIES.map(qr => (
              <button
                key={qr}
                onClick={() => send(qr)}
                className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-400 transition-colors whitespace-nowrap shadow-sm"
              >
                {qr}
              </button>
            ))}
          </div>
        )}

        {/* ── Input bar ─────────────────────────────────────────────────── */}
        <div
          className="shrink-0 flex items-center gap-2 px-3 py-3 border-t border-black/5"
          style={{ background: WA_INPUT_BG }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Type a message"
            className="flex-1 rounded-full px-4 py-2.5 text-sm bg-white outline-none border border-transparent focus:border-gray-300 transition-colors"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim()}
            title="Send"
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 disabled:opacity-40 disabled:scale-95 hover:scale-105 active:scale-95"
            style={{ background: WA_GREEN }}
          >
            <Send size={16} className="text-white" style={{ transform: 'translateX(1px)' }} />
          </button>
        </div>
      </div>

      {/* ── Floating toggle button ────────────────────────────────────────── */}
      <div className="relative">
        {/* Pulse ring — only when closed */}
        {!open && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-25 pointer-events-none"
            style={{ background: WA_GREEN }}
          />
        )}

        <button
          onClick={() => setOpen(o => !o)}
          title={open ? 'Close chat' : 'Chat with us on WhatsApp'}
          className="relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95"
          style={{ background: WA_GREEN }}
          aria-label={open ? 'Close WhatsApp chat' : 'Open WhatsApp chat'}
        >
          {/* Animated icon swap */}
          <span
            className="absolute transition-all duration-200"
            style={{ opacity: open ? 1 : 0, transform: open ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)' }}
          >
            <X size={26} className="text-white" />
          </span>
          <span
            className="absolute transition-all duration-200"
            style={{ opacity: open ? 0 : 1, transform: open ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)' }}
          >
            <WhatsAppSVG size={28} />
          </span>
        </button>

        {/* Unread badge */}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold pointer-events-none">
            {unread}
          </span>
        )}
      </div>
    </div>
  );
}
