import { useState, useRef, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBasket, Send, RefreshCw, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useChatContext, normalizePhone, genSessionId, saveIdentity } from '../context/ChatContext';

// ── Inline identity form ─────────────────────────────────────────────────────
interface QuoteFormProps {
  onSubmit: (name: string, phone: string) => void;
  onCancel: () => void;
  busy: boolean;
}

function QuoteForm({ onSubmit, onCancel, busy }: QuoteFormProps) {
  const [name,  setName]  = useState('');
  const [phone, setPhone] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => { nameRef.current?.focus(); }, []);

  const canSubmit = name.trim().length >= 2 && !busy;

  return (
    <div className="flex flex-col gap-3 p-4 bg-[var(--light-gray)] rounded-xl border border-[var(--medium-gray)]">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare size={16} className="text-[var(--teal)]" />
        <span className="text-sm font-semibold text-[var(--charcoal)]">Who should we quote?</span>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">Your name *</label>
        <input
          ref={nameRef}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && canSubmit && onSubmit(name.trim(), phone.trim())}
          placeholder="e.g. John"
          className="w-full rounded-lg px-3 py-2 text-sm border border-[var(--medium-gray)] outline-none focus:border-[var(--teal)] transition-colors bg-white"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">
          Phone <span className="font-normal text-gray-400">(optional — to restore chat on any device)</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && canSubmit && onSubmit(name.trim(), phone.trim())}
          placeholder="e.g. 0712 743 428"
          className="w-full rounded-lg px-3 py-2 text-sm border border-[var(--medium-gray)] outline-none focus:border-[var(--teal)] transition-colors bg-white"
        />
      </div>

      <div className="flex gap-2 mt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-xl text-sm border border-[var(--medium-gray)] text-gray-500 hover:bg-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit(name.trim(), phone.trim())}
          disabled={!canSubmit}
          className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-[var(--teal)] hover:bg-[var(--teal-dark)] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {busy
            ? <><RefreshCw size={14} className="animate-spin" /> Sending…</>
            : <><Send size={14} /> Send Request</>}
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CartSidebar() {
  const { cart, isOpen, setIsOpen, removeFromCart, updateQty, clearCart, showToast } = useCart();
  const { hasIdentity, identify, sendOrder } = useChatContext();

  const [showForm, setShowForm]   = useState(false);
  const [sending,  setSending]    = useState(false);

  // Reset form visibility when cart closes
  useEffect(() => { if (!isOpen) setShowForm(false); }, [isOpen]);

  // ── Quote flow ─────────────────────────────────────────────────────────────
  const dispatchOrder = async (name?: string, phone?: string) => {
    if (cart.length === 0) { showToast('Your cart is empty!'); return; }
    if (sending) return;

    // Identify if needed
    if (name) {
      const norm = normalizePhone(phone ?? '');
      const sid  = norm ? `ph-${norm}` : genSessionId();
      identify(name, phone ?? '');
      saveIdentity({ sessionId: sid, customerName: name, customerPhone: norm });
    }

    setSending(true);
    try {
      const ref = await sendOrder(cart);
      clearCart();
      setIsOpen(false);   // close cart drawer
      // chat widget opens automatically via sendOrder → setIsOpen(true) in ChatContext
      showToast(`Quote request ${ref} sent! Check the chat for our reply.`);
    } catch {
      showToast('Failed to send — please try again.');
    } finally {
      setSending(false);
      setShowForm(false);
    }
  };

  const handleQuoteClick = () => {
    if (cart.length === 0) { showToast('Your cart is empty!'); return; }
    if (hasIdentity) {
      // Already know who they are — send directly
      dispatchOrder();
    } else {
      // Show the inline form
      setShowForm(true);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div className={`fixed top-0 right-0 w-full max-w-[400px] h-screen bg-white z-[70] border-l border-[var(--medium-gray)] flex flex-col transition-transform duration-400 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--medium-gray)]">
          <h3 className="text-lg font-bold text-[var(--charcoal)] flex items-center gap-2">
            <ShoppingBasket size={20} className="text-[var(--teal)]" />
            Your Cart
          </h3>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-[var(--light-gray)] rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
              <ShoppingBasket size={48} className="mb-4 opacity-40" />
              <p className="text-base">Your cart is empty</p>
              <p className="text-sm mt-1 opacity-70">Add components to get started!</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 p-3 bg-[var(--light-gray)] rounded-xl mb-3 border border-[var(--medium-gray)]">
                {item.image ? (
                  <img src={item.image} alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0 border border-[var(--medium-gray)]" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-white border border-[var(--medium-gray)] flex items-center justify-center shrink-0">
                    <span className="text-xl text-[var(--teal)] font-bold">{item.name.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[var(--charcoal)] truncate">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded bg-white border border-[var(--medium-gray)] flex items-center justify-center hover:border-[var(--teal)] transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded bg-white border border-[var(--medium-gray)] flex items-center justify-center hover:border-[var(--teal)] transition-colors">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeFromCart(item.id)} className="ml-auto text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--medium-gray)] p-5 flex flex-col gap-3">
          {/* Inline quote form */}
          {showForm && (
            <QuoteForm
              busy={sending}
              onCancel={() => setShowForm(false)}
              onSubmit={(name, phone) => dispatchOrder(name, phone)}
            />
          )}

          {/* CTA button */}
          {!showForm && (
            <button
              onClick={handleQuoteClick}
              disabled={sending}
              className="w-full py-3.5 bg-[var(--teal)] hover:bg-[var(--teal-dark)] text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending
                ? <><RefreshCw size={16} className="animate-spin" /> Sending…</>
                : <><MessageSquare size={16} /> Request a Quote</>
              }
            </button>
          )}

          {!showForm && !sending && (
            <p className="text-[11px] text-center text-gray-400">
              Our team will reply with item prices in the chat
            </p>
          )}
        </div>
      </div>
    </>
  );
}
