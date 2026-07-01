import { useEffect, useMemo } from 'react';
import { X, Plus, ShoppingCart, Package, Cpu, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStaff, type EditableProduct } from '../context/StaffContext';

interface Props {
  product: EditableProduct;
  onClose: () => void;
}

// Suggest related items: same category, different product, sorted by relevance
function useRelated(product: EditableProduct, all: EditableProduct[]) {
  return useMemo(() => {
    const sameSubcat = all.filter(p => p.id !== product.id && p.subcategory === product.subcategory);
    const sameCat   = all.filter(p => p.id !== product.id && p.category === product.category && p.subcategory !== product.subcategory);
    const combined  = [...sameSubcat, ...sameCat].slice(0, 4);
    return combined;
  }, [product, all]);
}

// Mini card for related product
function RelatedCard({ product, onSelect }: { product: EditableProduct; onSelect: () => void }) {
  const { addToCart } = useCart();
  const { hidePrices } = useStaff();

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--medium-gray)] hover:border-[var(--teal)] transition-colors group">
      {/* Thumbnail */}
      <div
        className="w-14 h-14 rounded-lg bg-[var(--light-gray)] flex items-center justify-center shrink-0 overflow-hidden border border-[var(--medium-gray)] cursor-pointer"
        onClick={onSelect}
      >
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
        ) : (
          <Cpu size={20} className="text-[var(--teal)]" />
        )}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onSelect}>
        <p className="text-xs font-semibold text-[var(--charcoal)] line-clamp-2 leading-snug">{product.name}</p>
        {!hidePrices && <p className="text-xs text-[var(--teal)] font-bold mt-0.5">KSh {product.price.toLocaleString()}</p>}
      </div>
      {/* Add button */}
      <button
        onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, icon: product.icon })}
        className="w-8 h-8 rounded-lg bg-[var(--teal-light)] text-[var(--teal)] flex items-center justify-center hover:bg-[var(--teal)] hover:text-white transition-all shrink-0"
        aria-label={`Add ${product.name}`}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function ProductQuickView({ product, onClose }: Props) {
  const { addToCart } = useCart();
  const { products, hidePrices } = useStaff();
  const related = useRelated(product, products);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleAdd = () => {
    addToCart({ id: product.id, name: product.name, price: product.price, icon: product.icon });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Sheet / modal */}
      <div
        className="relative z-10 bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle on mobile */}
        <div className="sm:hidden w-10 h-1 bg-[var(--medium-gray)] rounded-full mx-auto mt-3 mb-1" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--light-gray)] flex items-center justify-center hover:bg-[var(--medium-gray)] transition-colors z-10"
        >
          <X size={16} />
        </button>

        {/* Product image */}
        <div className="h-56 sm:h-64 bg-gradient-to-br from-[var(--light-gray)] to-white flex items-center justify-center border-b border-[var(--medium-gray)] overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-contain p-6" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-white shadow-md border border-[var(--medium-gray)] flex items-center justify-center text-[var(--teal)]">
              <Cpu size={44} strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="p-5">
          {/* Badge + category */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold text-[var(--teal)] uppercase tracking-wider">
              {product.subcategory || product.category}
            </span>
            {product.badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.badge === 'sale' ? 'bg-[var(--amber)] text-white' : 'bg-[var(--teal)] text-white'}`}>
                {product.badge === 'sale' ? 'SALE' : 'TOP PICK'}
              </span>
            )}
          </div>

          {/* Name */}
          <h2 className="text-lg font-bold text-[var(--charcoal)] mb-2 leading-snug">{product.name}</h2>

          {/* Description */}
          <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">{product.desc}</p>

          {/* Stock */}
          {product.stock <= 10 && (
            <div className="flex items-center gap-1.5 text-orange-500 text-xs font-medium mb-3">
              <Package size={13} /> Only {product.stock} left in stock
            </div>
          )}

          {/* Price + CTA */}
          {!hidePrices && (
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[var(--teal)]">KSh {product.price.toLocaleString()}</span>
                {product.oldPrice && (
                  <span className="text-sm text-[var(--text-muted)] line-through">KSh {product.oldPrice.toLocaleString()}</span>
                )}
              </div>
              {product.oldPrice && (
                <span className="text-xs font-bold text-[var(--amber)] bg-[var(--amber-light)] px-2 py-1 rounded-full">
                  Save KSh {(product.oldPrice - product.price).toLocaleString()}
                </span>
              )}
            </div>
          )}

          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[var(--teal)] hover:bg-[var(--teal-dark)] text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <ShoppingCart size={17} /> Add to Cart
          </button>

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-bold text-[var(--charcoal)] uppercase tracking-wider">You may also need</h3>
                <ArrowRight size={13} className="text-[var(--text-muted)]" />
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {related.map(rel => (
                  <RelatedCard
                    key={rel.id}
                    product={rel}
                    onSelect={() => {
                      // Swap to the related product's quick view is handled by parent
                      onClose();
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
