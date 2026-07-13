import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, MessageSquare, RefreshCw, User } from 'lucide-react';

const ADMIN_PASS = 'dopha2025';

// ── Types ───────────────────────────────────────────────────────────────────
interface BackendMessage {
  id:   string;
  text: string;
  from: 'user' | 'staff';
  time: string;
}

interface ChatSession {
  sessionId:      string;
  messages:       BackendMessage[];
  createdAt:      string;
  lastActivity:   string;
  unreadByStaff:  boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function lastMsg(session: ChatSession): string {
  const m = session.messages[session.messages.length - 1];
  if (!m) return 'No messages yet';
  return (m.from === 'staff' ? 'You: ' : '') + m.text.slice(0, 60) + (m.text.length > 60 ? '…' : '');
}

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
  onClose:      () => void;
  initialUnread: number;
  onUnreadChange: (count: number) => void;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function StaffChat({ onClose, onUnreadChange }: Props) {
  const [sessions,  setSessions]  = useState<ChatSession[]>([]);
  const [selected,  setSelected]  = useState<string | null>(null);
  const [reply,     setReply]     = useState('');
  const [sending,   setSending]   = useState(false);
  const [loading,   setLoading]   = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endRef      = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  // ── Fetch all sessions ─────────────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    try {
      const res  = await fetch(`/api/chat?staff=1&password=${ADMIN_PASS}`);
      if (!res.ok) return;
      const data = await res.json() as { sessions: ChatSession[] };
      setSessions(data.sessions);
      const unreadCount = data.sessions.filter(s => s.unreadByStaff).length;
      onUnreadChange(unreadCount);
    } catch {}
    setLoading(false);
  }, [onUnreadChange]);

  // Poll every 4 seconds
  useEffect(() => {
    fetchSessions();
    intervalRef.current = setInterval(fetchSessions, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchSessions]);

  // Mark session as read when selected
  useEffect(() => {
    if (!selected) return;
    const sess = sessions.find(s => s.sessionId === selected);
    if (sess?.unreadByStaff) {
      fetch('/api/chat', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sessionId: selected, password: ADMIN_PASS }),
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Scroll chat to bottom when messages change
  const selectedSession = sessions.find(s => s.sessionId === selected);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession?.messages.length]);

  // Focus input when session selected
  useEffect(() => {
    if (selected) setTimeout(() => inputRef.current?.focus(), 100);
  }, [selected]);

  // ── Send reply ────────────────────────────────────────────────────────
  const sendReply = useCallback(async () => {
    const text = reply.trim();
    if (!text || !selected || sending) return;
    setSending(true);
    setReply('');
    try {
      await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sessionId: selected, text, password: ADMIN_PASS }),
      });
      await fetchSessions(); // refresh immediately
    } catch {}
    setSending(false);
  }, [reply, selected, sending, fetchSessions]);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[70] flex items-stretch bg-black/40 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
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
          <div className="flex items-center gap-2">
            <button onClick={fetchSessions} title="Refresh" className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <RefreshCw size={15} className="text-white/70" />
            </button>
            <button onClick={onClose} title="Close" className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <X size={18} className="text-white/70" />
            </button>
          </div>
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
                {/* Avatar */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={18} className="text-gray-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      Customer
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                      {formatTime(sess.lastActivity)}
                    </span>
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
                <button
                  onClick={() => setSelected(null)}
                  className="sm:hidden p-1 hover:bg-white/10 rounded-full"
                >
                  <X size={16} />
                </button>
                <div className="w-8 h-8 rounded-full bg-[#128C7E] flex items-center justify-center text-xs font-bold">C</div>
                <div>
                  <p className="text-sm font-semibold">Customer</p>
                  <p className="text-[11px] text-green-300">{selectedSession.messages.length} messages</p>
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
            // No session selected (desktop)
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
