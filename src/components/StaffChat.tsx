import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, MessageSquare, RefreshCw } from 'lucide-react';
import { collection, doc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Types ───────────────────────────────────────────────────────────────────
interface FirestoreMessage {
  id:   string;
  text: string;
  from: 'user' | 'staff';
  time: string;
}

interface ChatSession {
  sessionId:     string;
  messages:      FirestoreMessage[];
  createdAt:     string;
  lastActivity:  string;
  unreadByStaff: boolean;
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

/** Use the customer's first message as the session title. */
function sessionTitle(session: ChatSession): string {
  const first = session.messages.find(m => m.from === 'user');
  if (first) return first.text;
  return `Visitor ${session.sessionId.slice(0, 6).toUpperCase()}`;
}

/** Derive a consistent color from the session ID. */
function sessionColor(sessionId: string): string {
  const palette = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#DDA0DD','#F0A500','#7EC8E3','#B5936A'];
  let h = 0;
  for (const c of sessionId) h = (h * 31 + c.charCodeAt(0)) & 0xfffffff;
  return palette[h % palette.length];
}

function lastMsg(session: ChatSession): string {
  const m = session.messages[session.messages.length - 1];
  if (!m) return 'No messages yet';
  return (m.from === 'staff' ? 'You: ' : '') + m.text.slice(0, 60) + (m.text.length > 60 ? '…' : '');
}

function genId(prefix = 's') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
  onClose:        () => void;
  initialUnread:  number;
  onUnreadChange: (count: number) => void;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function StaffChat({ onClose, onUnreadChange }: Props) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [reply,    setReply]    = useState('');
  const [sending,  setSending]  = useState(false);
  const [loading,  setLoading]  = useState(true);
  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Real-time listener on all chat sessions ───────────────────────────────
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

  // Scroll to bottom when messages change
  const selectedSession = sessions.find(s => s.sessionId === selected);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession?.messages.length]);

  // Focus input when session selected
  useEffect(() => {
    if (selected) setTimeout(() => inputRef.current?.focus(), 100);
  }, [selected]);

  // ── Send reply ────────────────────────────────────────────────────────────
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

          {/* ── Session list ───────────────────────────────────────────────── */}
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
                {/* Unique colored avatar per visitor */}
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
                  <p className="text-xs text-gray-500 truncate">{lastMsg(sess)}</p>
                </div>
                {sess.unreadByStaff && (
                  <span className="shrink-0 w-2 h-2 rounded-full bg-[var(--teal)] mt-2" />
                )}
              </button>
            ))}
          </div>

          {/* ── Message thread ─────────────────────────────────────────────── */}
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
                    #{selectedSession.sessionId.slice(0, 8)} · started {timeAgo(selectedSession.createdAt ?? selectedSession.lastActivity)}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {selectedSession.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm text-sm text-gray-800 ${
                        msg.from === 'user' ? 'rounded-tl-sm bg-white' : 'rounded-tr-sm'
                      }`}
                      style={{ background: msg.from === 'staff' ? '#DCF8C6' : 'white' }}
                    >
                      <p className="leading-relaxed whitespace-pre-line break-words">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-gray-400">{formatTime(msg.time)}</span>
                      </div>
                    </div>
                  </div>
                ))}
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
