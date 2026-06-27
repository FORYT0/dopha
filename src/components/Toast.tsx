import { CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toast } = useCart();

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-3 bg-white border border-[var(--teal)] rounded-xl px-5 py-3.5 shadow-lg transition-all duration-400 ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
    >
      <CheckCircle size={18} className="text-[var(--teal)] shrink-0" />
      <span className="text-sm font-medium text-[var(--charcoal)]">{toast.message}</span>
    </div>
  );
}
