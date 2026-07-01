import { useState, useMemo, useRef } from 'react';
import { Search, X, Cpu, ZoomIn } from 'lucide-react';
import {
  Cpu as CpuIcon, Wifi, Camera, Monitor, Thermometer, Ruler, Eye, Flame, Wind, Sun,
  Droplets, Mic, Heart, Cloud, AlertTriangle, Waves, CloudRain, Scale,
  Palette, Hand, Zap, Battery, Sliders, SlidersHorizontal, Timer,
  ToggleLeft, ToggleRight, Grid3x3, Power, Volume2, GitBranch,
  BatteryCharging, Triangle, Clock, Grid2x2, ArrowRightLeft, ArrowUpRight,
  Cog, ArrowDownUp, Plug, Gauge, PenTool, ArrowDown, LayoutGrid, Cable,
  Scissors, Wrench, Square, Activity, Bluetooth, Radio, Smartphone,
  CreditCard, Globe, MapPin, RotateCw, Car, BatteryFull, Box, ArrowUp,
  Shield, Calculator, Binary, Lightbulb, CircleDot,
  type LucideIcon,
} from 'lucide-react';
import { useStaff, type EditableProduct } from '../context/StaffContext';
import { categories } from '../data/products';
import ProductQuickView from '../components/ProductQuickView';

const iconMap: Record<string, LucideIcon> = {
  Cpu: CpuIcon, Wifi, Camera, Monitor, Thermometer, Ruler, Eye, Flame, Wind, Sun,
  Droplets, Mic, Heart, Cloud, AlertTriangle, Waves, CloudRain, Scale,
  Palette, Hand, Zap, Battery, Sliders, SlidersHorizontal, Timer,
  ToggleLeft, ToggleRight, Grid3x3, Power, Volume2, GitBranch,
  BatteryCharging, Triangle, Clock, Grid2x2, ArrowRightLeft, ArrowUpRight,
  Cog, ArrowDownUp, Plug, Gauge, PenTool, ArrowDown, LayoutGrid, Cable,
  Scissors, Wrench, Square, Activity, Bluetooth, Radio, Smartphone,
  CreditCard, Globe, MapPin, RotateCw, Car, BatteryFull, Box, ArrowUp,
  Shield, Calculator, Binary, Lightbulb, CircleDot,
  Waveform: Activity, Grab: Hand, Container: Box,
};

export default function VisualGuidePage() {
  const { products, hidePrices } = useStaff();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [selected, setSelected] = useState<EditableProduct | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let result = [...products];
    if (activeCategory) result = result.filter(p => p.category === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q))
      );
    }
    return result;
  }, [products, query, activeCategory]);

  const grouped = useMemo(() => {
    const map = new Map<string, EditableProduct[]>();
    for (const p of filtered) {
      const key = p.subcategory || p.category;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return [...map.entries()];
  }, [filtered]);

  const clearSearch = () => { setQuery(''); inputRef.current?.focus(); };

  return (
    <div className="pt-16 min-h-screen bg-[var(--light-gray)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--medium-gray)]">
        <div className="max-w-[1280px] mx-auto px-[5%] py-12">
          <div className="text-sm text-[var(--text-muted)] mb-3">
            <span className="hover:text-[var(--teal)] cursor-pointer">Home</span>
            <span className="mx-2">/</span>
            <span className="text-[var(--charcoal)]">Visual Component Guide</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--charcoal)] mb-2">
            Visual Component Guide
          </h1>
          <p className="text-[var(--text-muted)] mb-8 max-w-xl">
            Identify any electronic component by how it looks. Browse {products.length}+ components with real product photos — great for students and beginners.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, type, or description… e.g. "resistor", "NPN transistor", "I2C""
              className="w-full bg-white border-2 border-[var(--medium-gray)] rounded-2xl pl-12 pr-12 py-4 text-sm outline-none focus:border-[var(--teal)] transition-colors shadow-sm"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[var(--light-gray)] transition-colors"
              >
                <X size={16} className="text-[var(--text-muted)]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category filter strip */}
      <div className="bg-white border-b border-[var(--medium-gray)] sticky top-16 z-30 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-[5%]">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none">
            <button
              onClick={() => setActiveCategory('')}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeCategory === '' ? 'bg-[var(--teal)] text-white' : 'bg-[var(--light-gray)] text-[var(--charcoal)] hover:bg-[var(--teal-light)] hover:text-[var(--teal)]'}`}
            >
              All ({products.length})
            </button>
            {categories.map(cat => {
              const count = products.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? '' : cat.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeCategory === cat.id ? 'bg-[var(--teal)] text-white' : 'bg-[var(--light-gray)] text-[var(--charcoal)] hover:bg-[var(--teal-light)] hover:text-[var(--teal)]'}`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results summary */}
      <div className="max-w-[1280px] mx-auto px-[5%] pt-6 pb-2">
        <p className="text-sm text-[var(--text-muted)]">
          {query || activeCategory
            ? <><span className="font-semibold text-[var(--charcoal)]">{filtered.length}</span> component{filtered.length !== 1 ? 's' : ''} found{query && <> for "<span className="text-[var(--teal)]">{query}</span>"</>}</>
            : <><span className="font-semibold text-[var(--charcoal)]">{filtered.length}</span> components — click any to learn more and add to cart</>
          }
        </p>
      </div>

      {/* Component grid — grouped by subcategory */}
      <div className="max-w-[1280px] mx-auto px-[5%] pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <Cpu size={52} className="mx-auto mb-4 text-[var(--text-muted)] opacity-30" />
            <p className="text-lg font-semibold text-[var(--charcoal)] mb-2">No components found</p>
            <p className="text-sm text-[var(--text-muted)]">Try a different search term or clear the filter</p>
            <button onClick={() => { setQuery(''); setActiveCategory(''); }} className="mt-4 px-5 py-2.5 bg-[var(--teal)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--teal-dark)] transition-colors">
              Clear search
            </button>
          </div>
        ) : (query || activeCategory) ? (
          /* Flat grid when searching */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mt-4">
            {filtered.map(p => (
              <ComponentCard
                key={p.id}
                product={p}
                hidePrices={hidePrices}
                hovered={hoveredId === p.id}
                onHover={() => setHoveredId(p.id)}
                onLeave={() => setHoveredId(null)}
                onClick={() => setSelected(p)}
              />
            ))}
          </div>
        ) : (
          /* Grouped view when browsing */
          grouped.map(([groupName, items]) => (
            <div key={groupName} className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-base font-bold text-[var(--charcoal)]">{groupName}</h2>
                <span className="text-xs font-semibold text-[var(--teal)] bg-[var(--teal-light)] px-2.5 py-0.5 rounded-full">
                  {items.length}
                </span>
                <div className="flex-1 h-px bg-[var(--medium-gray)]" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {items.map(p => (
                  <ComponentCard
                    key={p.id}
                    product={p}
                    hidePrices={hidePrices}
                    hovered={hoveredId === p.id}
                    onHover={() => setHoveredId(p.id)}
                    onLeave={() => setHoveredId(null)}
                    onClick={() => setSelected(p)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <ProductQuickView product={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

interface CardProps {
  product: EditableProduct;
  hidePrices: boolean;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

function ComponentCard({ product, hidePrices, hovered, onHover, onLeave, onClick }: CardProps) {
  const IconComponent = (iconMap[product.icon] ?? CpuIcon) as LucideIcon;

  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`group bg-white rounded-2xl border overflow-hidden text-left transition-all duration-200 ${hovered ? 'border-[var(--teal)] shadow-lg -translate-y-1' : 'border-[var(--medium-gray)] hover:border-[var(--teal)] hover:shadow-md'}`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-[var(--light-gray)] to-white flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-[var(--medium-gray)] flex items-center justify-center text-[var(--teal)]">
            <IconComponent size={28} strokeWidth={1.5} />
          </div>
        )}

        {/* Zoom hint */}
        <div className={`absolute inset-0 bg-[var(--teal)]/10 flex items-center justify-center transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center">
            <ZoomIn size={16} className="text-[var(--teal)]" />
          </div>
        </div>

        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${product.badge === 'sale' ? 'bg-[var(--amber)] text-white' : 'bg-[var(--teal)] text-white'}`}>
            {product.badge === 'sale' ? 'SALE' : 'NEW'}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[10px] font-semibold text-[var(--teal)] uppercase tracking-wider mb-0.5 truncate">
          {product.subcategory || product.category}
        </p>
        <p className="text-xs font-semibold text-[var(--charcoal)] leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </p>
        {!hidePrices && (
          <p className="text-sm font-extrabold text-[var(--teal)] mt-1.5">
            KSh {product.price.toLocaleString()}
          </p>
        )}
      </div>
    </button>
  );
}
