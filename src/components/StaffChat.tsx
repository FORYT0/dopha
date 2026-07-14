import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, MessageSquare, RefreshCw, ShoppingBasket, CheckCheck } from 'lucide-react';
import { collection, doc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { FirestoreMessage, OrderItem } from '../context/ChatContext';

// ── Types ───────────────────────────────────────────────────────────────────
interface PaymentStatusEntry {
  status:    'pending' | 'success' | 'failed';
  mpesaRef?: string | null;
  updatedAt?: string;
}

interface ChatSession {
  sessionId:       string;
  customerName?:   string;
  customerPhone?:  string;
  messages:        FirestoreMessage[];
  createdAt:       string;
  lastActivity:    string;
  unreadByStaff:   boolean;
  paymentStatuses?: Record<string, PaymentStatusEntry>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  const d   = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString()
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function sessionTitle(session: ChatSession): string {
  if (session.customerName) return session.customerName;
  const first = session.messages.find(m => m.from === 'user');
  if (first) return first.text.slice(0, 40);
  return `Visitor ${session.sessionId.slice(0, 6).toUpperCase()}`;
}

function sessionColor(sessionId: string): string {
  const palette = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#DDA0DD','#F0A500','#7EC8E3','#B5936A'];
  let h = 0;
  for (const c of sessionId) h = (h * 31 + c.charCodeAt(0)) & 0xfffffff;
  return palette[h % palette.length];
}

function lastMsgPreview(session: ChatSession): string {
  const m = session.messages[session.messages.length - 1];
  if (!m) return 'No messages yet';
  if (m.type === 'order' && m.order) {
    const total = m.order.reduce((s, i) => s + i.qty, 0);
    return `🛒 Order: ${total} item${total !== 1 ? 's' : ''}`;
  }
  if (m.type === 'quote') return `💬 Quote sent — KSh ${(m.total || 0).toLocaleString()}`;
  if (m.type === 'payment') {
    const ps = session.paymentStatuses?.[m.checkoutRequestId || ''];
    const status = ps?.status ?? m.paymentStatus ?? 'pending';
    if (status === 'success') return `✅ Payment confirmed — KSh ${(m.amount || 0).toLocaleString()}`;
    if (status === 'failed')  return '❌ Payment failed';
    return `💳 M-Pesa payment — KSh ${(m.amount || 0).toLocaleString()}`;
  }
  return (m.from === 'staff' ? 'You: ' : '') + m.text.slice(0, 60) + (m.text.length > 60 ? '…' : '');
}

function genId(prefix = 's') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Item thumbnail (shared by QuoteEditor + QuoteCard) ────────────────────────
function ItemThumb({ item, size = 28 }: { item: OrderItem; size?: number }) {
  if (item.image) {
    return (
      <img src={item.image} alt={item.name}
        className="rounded-lg object-cover shrink-0 border border-gray-100"
        style={{ width: size, height: size }} />
    );
  }
  return (
    <div className="rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ width: size, height: size, background: '#128C7E' }}>
      {item.name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Quote Editor (interactive — staff fills in prices) ────────────────────────
interface QuoteEditorProps {
  items:         OrderItem[];
  orderRef?:     string;
  msgId:         string;
  quoteSent:     boolean;
  prices:        Record<number, string>;
  onPriceChange: (itemId: number, price: string) => void;
  onSend:        () => void;
  sending:       boolean;
}

function QuoteEditor({ items, orderRef, quoteSent, prices, onPriceChange, onSend, sending }: QuoteEditorProps) {
  const total = items.reduce((sum, item) => {
    const p = parseFloat(prices[item.id] || '0') || 0;
    return sum + p * item.qty;
  }, 0);

  const allPriced = items.every(item => {
    const p = parseFloat(prices[item.id] ?? '');
    return !isNaN(p) && p > 0;
  });

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm text-sm bg-white border border-gray-100"
      style={{ minWidth: '260px', maxWidth: '340px' }}>

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2"
        style={{ background: quoteSent ? '#EEF4FF' : '#E7F8EE', borderBottom: `1px solid ${quoteSent ? '#C7D7FC' : '#d1f0dd'}` }}>
        {quoteSent
          ? <CheckCheck size={14} style={{ color: '#3B5BDB' }} />
          : <ShoppingBasket size={14} style={{ color: '#128C7E' }} />}
        <span className="text-xs font-semibold text-gray-700">
          {quoteSent ? 'Quote Sent ✓' : 'Order Request'}
        </span>
        {orderRef && <span className="ml-auto text-[10px] font-mono text-gray-400">{orderRef}</span>}
      </div>

      {/* Items with price inputs */}
      <div className="divide-y divide-gray-100">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2 px-3 py-2.5">
            <ItemThumb item={item} size={28} />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-800 truncate block">{item.name}</span>
              <span className="text-[10px] text-gray-400">qty: {item.qty}</span>
            </div>
            <div className="shrink-0 flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 font-medium">KSh</span>
              {quoteSent ? (
                <span className="text-xs font-semibold text-gray-700 w-20 text-right">
                  {prices[item.id] ? Number(prices[item.id]).toLocaleString() : (item.price || 0).toLocaleString()}
                </span>
              ) : (
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={prices[item.id] ?? ''}
                  onChange={e => onPriceChange(item.id, e.target.value)}
                  className="w-20 text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-teal-400 transition-colors text-right bg-gray-50 focus:bg-white"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total + Send */}
      <div className="flex items-center justify-between gap-3 px-3 py-2.5"
        style={{ background: quoteSent ? '#EEF4FF' : '#F0FFFE', borderTop: `1px solid ${quoteSent ? '#C7D7FC' : '#e0f2f0'}` }}>
        <div>
          <div className="text-[10px] text-gray-400 mb-0.5">Total</div>
          <div className={`text-sm font-bold ${total > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
            {total > 0 ? `KSh ${total.toLocaleString()}` : '—'}
          </div>
        </div>
        {!quoteSent && (
          <button
            onClick={onSend}
            disabled={!allPriced || sending}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            style={{ background: '#25D366' }}
            title={allPriced ? 'Send quote to customer' : 'Set all prices first'}
          >
            {sending
              ? <><RefreshCw size={12} className="animate-spin" /> Sending…</>
              : <><Send size={12} /> Send Quote</>}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Quote card (staff's own sent-quote view, right side) ──────────────────────
function QuoteCard({ items, orderRef, total }: { items: OrderItem[]; orderRef?: string; total?: number }) {
  const grand = total ?? items.reduce((s, i) => s + (i.price || 0) * i.qty, 0);
  return (
    <div className="rounded-2xl rounded-tr-sm overflow-hidden shadow-sm text-sm bg-white border border-blue-100"
      style={{ minWidth: '220px', maxWidth: '320px' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2"
        style={{ background: '#EEF4FF', borderBottom: '1px solid #C7D7FC' }}>
        <CheckCheck size={14} style={{ color: '#3B5BDB' }} />
        <span className="text-xs font-semibold text-gray-700">Quote Sent</span>
        {orderRef && <span className="ml-auto text-[10px] font-mono text-gray-400">{orderRef}</span>}
      </div>
      {/* Items */}
      <div className="divide-y divide-gray-100">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2 px-3 py-2.5">
            <ItemThumb item={item} size={26} />
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
    </div>
  );
}

// ── Payment card (staff view — shows customer payment status) ────────────────
function StaffPaymentCard({
  msg, paymentStatuses,
}: {
  msg: FirestoreMessage;
  paymentStatuses?: Record<string, PaymentStatusEntry>;
}) {
  const ps     = paymentStatuses?.[msg.checkoutRequestId || ''];
  const status = (ps?.status ?? msg.paymentStatus ?? 'pending') as 'pending' | 'success' | 'failed';
  const mRef   = ps?.mpesaRef ?? msg.mpesaRef;

  const base = 'rounded-2xl rounded-tl-sm overflow-hidden shadow-sm text-sm';

  if (status === 'success') {
    return (
      <div className={base} style={{ background: '#F0FFF4', border: '1px solid #86EFAC', minWidth: '200px' }}>
        <div className="flex items-center gap-2 px-3 py-2"
          style={{ background: '#DCFCE7', borderBottom: '1px solid #86EFAC' }}>
          <CheckCheck size={14} className="text-green-600" />
          <span className="text-xs font-semibold text-green-800">Payment Confirmed ✓</span>
          {msg.amount != null && (
            <span className="ml-auto text-xs font-bold text-green-700">KSh {msg.amount.toLocaleString()}</span>
          )}
        </div>
        <div className="px-3 py-2">
          {mRef && <p className="text-[10px] text-gray-400 font-mono">Ref: {mRef}</p>}
          <p className="text-xs text-gray-600 mt-0.5">Customer payment received.</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className={base} style={{ background: '#FFF5F5', border: '1px solid #FCA5A5', minWidth: '200px' }}>
        <div className="flex items-center gap-2 px-3 py-2"
          style={{ background: '#FEE2E2', borderBottom: '1px solid #FCA5A5' }}>
          <span className="text-red-500 font-bold text-sm">✕</span>
          <span className="text-xs font-semibold text-red-700">Payment Failed</span>
          {msg.amount != null && (
            <span className="ml-auto text-xs text-red-600">KSh {msg.amount.toLocaleString()}</span>
          )}
        </div>
        <div className="px-3 py-2">
          <p className="text-xs text-gray-500">Customer cancelled or payment timed out.</p>
        </div>
      </div>
    );
  }

  // pending
  return (
    <div className={base} style={{ background: '#FFFDE7', border: '1px solid #FFE082', minWidth: '200px' }}>
      <div className="flex items-center gap-2 px-3 py-2"
        style={{ background: '#FFF9C4', borderBottom: '1px solid #FFE082' }}>
        <RefreshCw size={13} className="animate-spin text-amber-500" />
        <span className="text-xs font-semibold text-amber-800">Awaiting M-Pesa</span>
        {msg.amount != null && (
          <span className="ml-auto text-xs font-bold text-amber-700">KSh {msg.amount.toLocaleString()}</span>
        )}
      </div>
      <div className="px-3 py-2">
        <p className="text-xs text-gray-500">Prompt sent to customer's phone. Waiting for PIN…</p>
      </div>
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
  onClose:        () => void;
  initialUnread:  number;
  onUnreadChange: (count: number) => void;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function StaffChat({ onClose, onUnreadChange }: Props) {
  const [sessions,     setSessions]     = useState<ChatSession[]>([]);
  const [selected,     setSelected]     = useState<string | null>(null);
  const [reply,        setReply]        = useState('');
  const [sending,      setSending]      = useState(false);
  const [quoteSending, setQuoteSending] = useState(false);
  const [loading,      setLoading]      = useState(true);

  // Per-order-message price inputs: { messageId -> { itemId -> priceString } }
  const [quotePrices, setQuotePrices] = useState<Record<string, Record<number, string>>>({});

  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Real-time listener ────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'chats'), (snapshot) => {
      const all: ChatSession[] = snapshot.docs
        .map(d => d.data() as ChatSession)
        .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
      setSessions(all);
      onUnreadChange(all.filter(s => s.unreadByStaff).length);
      setLoading(false);
    });
    return () => unsub();
  }, [onUnreadChange]);

  // Mark session read when opened
  useEffect(() => {
    if (!selected) return;
    const sess = sessions.find(s => s.sessionId === selected);
    if (!sess?.unreadByStaff) return;
    updateDoc(doc(db, 'chats', selected), { unreadByStaff: false }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const selectedSession = sessions.find(s => s.sessionId === selected);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession?.messages.length]);

  useEffect(() => {
    if (selected) setTimeout(() => inputRef.current?.focus(), 100);
  }, [selected]);

  // ── Price input handler ───────────────────────────────────────────────────
  const handlePriceChange = useCallback((msgId: string, itemId: number, price: string) => {
    setQuotePrices(prev => ({
      ...prev,
      [msgId]: { ...(prev[msgId] || {}), [itemId]: price },
    }));
  }, []);

  // ── Send quote ────────────────────────────────────────────────────────────
  const sendQuote = useCallback(async (orderMsg: FirestoreMessage) => {
    if (!selected || quoteSending) return;
    const prices = quotePrices[orderMsg.id] || {};

    const pricedItems: OrderItem[] = (orderMsg.order || []).map(item => ({
      ...item,
      price: Math.round(parseFloat(prices[item.id] || '0')) || 0,
    }));
    const total = pricedItems.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);

    const quoteMsg: FirestoreMessage = {
      id:       genId('q'),
      text:     `Quote for ${orderMsg.orderRef || 'your order'}: Total KSh ${total.toLocaleString()}`,
      from:     'staff',
      time:     new Date().toISOString(),
      type:     'quote',
      order:    pricedItems,
      orderRef: orderMsg.orderRef,
      total,
    };

    setQuoteSending(true);
    try {
      await updateDoc(doc(db, 'chats', selected), {
        messages:     arrayUnion(quoteMsg),
        lastActivity: new Date().toISOString(),
      });
    } catch {}
    setQuoteSending(false);
  }, [selected, quoteSending, quotePrices]);

  // ── Send text reply ───────────────────────────────────────────────────────
  const sendReply = useCallback(async () => {
    const text = reply.trim();
    if (!text || !selected || sending) return;
    setSending(true);
    setReply('');

    const msg: FirestoreMessage = {
      id:   genId('s'),
      text,
      from: 'staff',
      time: new Date().toISOString(),
      type: 'text',
    };

    try {
      await updateDoc(doc(db, 'chats', selected), {
        messages:      arrayUnion(msg),
        lastActivity:  new Date().toISOString(),
        unreadByStaff: false,
      });
    } catch {}
    setSending(false);
  }, [reply, selected, sending]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[70] flex items-stretch bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="ml-auto w-full max-w-3xl flex flex-col bg-white shadow-2xl h-full" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 bg-[var(--charcoal)] text-white">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-[var(--teal)]" />
            <span className="font-semibold">Live Chats</span>
            {sessions.filter(s => s.unreadByStaff).length > 0 && (
              <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {sessions.filter(s => s.unreadByStaff).length} new
              </span>
            )}
          </div>
          <button onClick={onClose} title="Close" className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <X size={18} className="text-white/70" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">

          {/* ── Session list ──────────────────────────────────────────────── */}
          <div className={`shrink-0 flex flex-col border-r border-gray-100 bg-gray-50 overflow-y-auto ${selected ? 'hidden sm:flex' : 'flex'} sm:w-72 w-full`}>
            {loading && (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                <RefreshCw size={18} className="animate-spin mr-2" /> Loading…
              </div>
            )}
            {!loading && sessions.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm gap-2 p-8 text-center">
                <MessageSquare size={32} strokeWidth={1.5} />
                <p>No chats yet.</p>
                <p className="text-xs text-gray-300">When customers send messages they'll appear here.</p>
              </div>
            )}
            {sessions.map(sess => (
              <button
                key={sess.sessionId}
                onClick={() => setSelected(sess.sessionId)}
                className={`w-full text-left px-4 py-3.5 border-b border-gray-100 hover:bg-white transition-colors flex items-start gap-3 ${
                  selected === sess.sessionId ? 'bg-white border-l-2 border-l-[var(--teal)]' : ''
                }`}
              >
                <div
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: sessionColor(sess.sessionId) }}
                >
                  {sess.sessionId.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {sessionTitle(sess).slice(0, 28)}{sessionTitle(sess).length > 28 ? '…' : ''}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-1">{formatTime(sess.lastActivity)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {sess.customerPhone ? `+${sess.customerPhone} · ` : ''}{lastMsgPreview(sess)}
                  </p>
                </div>
                {sess.unreadByStaff && (
                  <span className="shrink-0 w-2 h-2 rounded-full bg-[var(--teal)] mt-2" />
                )}
              </button>
            ))}
          </div>

          {/* ── Message thread ────────────────────────────────────────────── */}
          {selected && selectedSession ? (
            <div className="flex-1 flex flex-col min-h-0 bg-[#ECE5DD]">
              {/* Thread header */}
              <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-[#075E54] text-white">
                <button onClick={() => setSelected(null)} className="sm:hidden p-1 hover:bg-white/10 rounded-full">
                  <X size={16} />
                </button>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: sessionColor(selectedSession.sessionId) }}
                >
                  {selectedSession.sessionId.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {sessionTitle(selectedSession).slice(0, 35)}{sessionTitle(selectedSession).length > 35 ? '…' : ''}
                  </p>
                  <p className="text-[11px] text-green-300">
                    {selectedSession.customerPhone
                      ? `+${selectedSession.customerPhone} · `
                      : `#${selectedSession.sessionId.slice(0, 8)} · `}
                    started {timeAgo(selectedSession.createdAt ?? selectedSession.lastActivity)}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {selectedSession.messages
                  .slice()
                  .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
                  .map(msg => {
                    // ── M-Pesa payment message ──
                    if (msg.type === 'payment') {
                      return (
                        <div key={msg.id} className="flex justify-start">
                          <div>
                            <StaffPaymentCard
                              msg={msg}
                              paymentStatuses={selectedSession.paymentStatuses}
                            />
                            <div className="mt-1 pl-1">
                              <span className="text-[10px] text-gray-400">{formatTime(msg.time)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // ── Order request (from customer) with interactive QuoteEditor ──
                    if (msg.type === 'order' && msg.order) {
                      const quoteSent = selectedSession.messages.some(
                        m => m.type === 'quote' && m.orderRef === msg.orderRef,
                      );
                      return (
                        <div key={msg.id} className="flex justify-start">
                          <div>
                            <QuoteEditor
                              items={msg.order}
                              orderRef={msg.orderRef}
                              msgId={msg.id}
                              quoteSent={quoteSent}
                              prices={quotePrices[msg.id] || {}}
                              onPriceChange={(itemId, price) => handlePriceChange(msg.id, itemId, price)}
                              onSend={() => sendQuote(msg)}
                              sending={quoteSending}
                            />
                            <div className="mt-1 pl-1">
                              <span className="text-[10px] text-gray-400">{formatTime(msg.time)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // ── Sent quote (from staff) ──
                    if (msg.type === 'quote' && msg.order) {
                      return (
                        <div key={msg.id} className="flex justify-end">
                          <div>
                            <QuoteCard items={msg.order} orderRef={msg.orderRef} total={msg.total} />
                            <div className="mt-1 pr-1 text-right">
                              <span className="text-[10px] text-gray-400">{formatTime(msg.time)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // ── Regular text message ──
                    return (
                      <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-start' : 'justify-end'}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm text-sm text-gray-800 ${
                            msg.from === 'user' ? 'rounded-tl-sm' : 'rounded-tr-sm'
                          }`}
                          style={{ background: msg.from === 'staff' ? '#DCF8C6' : 'white' }}
                        >
                          <p className="leading-relaxed whitespace-pre-line break-words">{msg.text}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-[10px] text-gray-400">{formatTime(msg.time)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                <div ref={endRef} />
              </div>

              {/* Reply input */}
              <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-[#F0F2F5] border-t border-black/5">
                <input
                  ref={inputRef}
                  type="text"
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }}}
                  placeholder="Reply to customer…"
                  className="flex-1 rounded-full px-4 py-2.5 text-sm bg-white outline-none border border-transparent focus:border-gray-300 transition-colors"
                />
                <button
                  onClick={sendReply}
                  disabled={!reply.trim() || sending}
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:scale-95 hover:scale-105"
                  style={{ background: '#25D366' }}
                >
                  {sending
                    ? <RefreshCw size={15} className="text-white animate-spin" />
                    : <Send size={15} className="text-white" style={{ transform: 'translateX(1px)' }} />
                  }
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex flex-1 items-center justify-center bg-[#ECE5DD]">
              <div className="text-center text-gray-400">
                <MessageSquare size={40} strokeWidth={1} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
