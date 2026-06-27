import { X, Plus, Minus, ShoppingBasket } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartSidebar() {
  const { cart, isOpen, setIsOpen, totalPrice, removeFromCart, updateQty, showToast } = useCart();

  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast('Your cart is empty!');
    } else {
      const items = cart.map(c => `${c.name} x${c.qty}`).join(', ');
      const msg = `Hi! I want to order: ${items}. Total: KSh ${totalPrice.toLocaleString()}`;
      window.open(`https://wa.me/2547XXXXXXXX?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div className={`fixed top-0 right-0 w-full max-w-[400px] h-screen bg-white z-[70] border-l border-[var(--medium-gray)] flex flex-col transition-transform duration-400 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--medium-gray)]">
          <h3 className="text-lg font-bold text-[var(--charcoal)] flex items-center gap-2">
            <ShoppingBasket size={20} className="text-[var(--teal)]" />
            Your Cart
          </h3>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-[var(--light-gray)] rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

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
                <div className="w-14 h-14 rounded-lg bg-white border border-[var(--medium-gray)] flex items-center justify-center shrink-0">
                  <span className="text-xl text-[var(--teal)] font-bold">{item.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[var(--charcoal)] truncate">{item.name}</h4>
                  <p className="text-sm font-bold text-[var(--teal)]">KSh {item.price.toLocaleString()}</p>
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

        <div className="border-t border-[var(--medium-gray)] p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-medium">Total</span>
            <span className="text-xl font-extrabold text-[var(--teal)]">KSh {totalPrice.toLocaleString()}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full py-3.5 bg-[var(--teal)] hover:bg-[var(--teal-dark)] text-white font-bold rounded-xl transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
}
