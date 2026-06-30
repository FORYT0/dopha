import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Cpu } from 'lucide-react';
import { useStaff } from '../context/StaffContext';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const { products } = useStaff();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<typeof products>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSuggestions([]);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const updateSuggestions = useCallback((q: string) => {
    if (!q.trim()) { setSuggestions([]); return; }
    const lower = q.toLowerCase();
    const matched = products
      .filter(p =>
        p.name.toLowerCase().includes(lower) ||
        p.desc.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(lower))
      )
      .slice(0, 8);
    setSuggestions(matched);
  }, [products]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    updateSuggestions(q);
  };

  const goToProduct = (productId: number) => {
    onClose();
    navigate(`/products?highlight=${productId}&search=${encodeURIComponent(query)}`);
  };

  const searchAll = () => {
    if (!query.trim()) return;
    onClose();
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Search panel */}
      <div
        className="relative z-10 bg-white w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--medium-gray)]">
          <Search size={20} className="text-[var(--teal)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={e => { if (e.key === 'Enter') searchAll(); }}
            placeholder="Search components, sensors, modules…"
            className="flex-1 text-base text-[var(--charcoal)] outline-none placeholder:text-[var(--text-muted)]"
          />
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--light-gray)] transition-colors">
            <X size={20} className="text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-[var(--medium-gray)]">
            {suggestions.map(product => (
              <button
                key={product.id}
                onClick={() => goToProduct(product.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--light-gray)] transition-colors text-left group"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-xl bg-[var(--light-gray)] flex items-center justify-center shrink-0 overflow-hidden border border-[var(--medium-gray)]">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Cpu size={20} className="text-[var(--teal)]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--charcoal)] truncate">{product.name}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{product.subcategory || product.category}</p>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[var(--teal)]">KSh {product.price.toLocaleString()}</p>
                </div>

                <ArrowRight size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))}

            {/* See all results */}
            <button
              onClick={searchAll}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold text-[var(--teal)] hover:bg-[var(--teal-light)] transition-colors"
            >
              See all results for "{query}" <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Empty state */}
        {query.length > 1 && suggestions.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            No components found for "<span className="font-medium text-[var(--charcoal)]">{query}</span>"
          </div>
        )}

        {/* Quick tips when empty */}
        {!query && (
          <div className="px-4 py-4">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {['Arduino', 'ESP32', 'DHT22', 'OLED', 'Resistor', 'LED', 'Servo', 'Relay'].map(term => (
                <button
                  key={term}
                  onClick={() => { setQuery(term); updateSuggestions(term); }}
                  className="px-3 py-1.5 rounded-full bg-[var(--light-gray)] text-xs font-medium text-[var(--charcoal)] hover:bg-[var(--teal-light)] hover:text-[var(--teal)] transition-colors border border-[var(--medium-gray)]"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
