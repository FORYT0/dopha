import { useState, type RefObject } from 'react';
import {
  Cpu, Wifi, Camera, Monitor, Thermometer, Ruler, Eye, Flame, Wind, Sun,
  Droplets, Mic, Heart, Cloud, AlertTriangle, Waves, CloudRain, Scale,
  Palette, Hand, Zap, Battery, Sliders, SlidersHorizontal, Timer,
  ToggleLeft, ToggleRight, Grid3x3, Power, Volume2, GitBranch, ArrowRight,
  BatteryCharging, Triangle, Clock, Grid2x2, ArrowRightLeft, ArrowUpRight,
  Cog, ArrowDownUp, Plug, Gauge, PenTool, ArrowDown, LayoutGrid, Cable,
  Scissors, Wrench, Square, Activity, Bluetooth, Radio, Smartphone,
  CreditCard, Globe, MapPin, RotateCw, Car, BatteryFull, Box, ArrowUp,
  Shield, Calculator, Binary, Lightbulb, CircleDot, Plus, Pencil, Trash2,
  AlertCircle, type LucideIcon,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStaff, type EditableProduct } from '../context/StaffContext';
import ProductEditModal from './ProductEditModal';
import ProductQuickView from './ProductQuickView';

const iconMap: Record<string, LucideIcon> = {
  Cpu, Wifi, Camera, Monitor, Thermometer, Ruler, Eye, Flame, Wind, Sun,
  Droplets, Mic, Heart, Cloud, AlertTriangle, Waves, CloudRain, Scale,
  Palette, Hand, Zap, Battery, Sliders, SlidersHorizontal, Timer,
  ToggleLeft, ToggleRight, Grid3x3, Power, Volume2, GitBranch, ArrowRight,
  BatteryCharging, Triangle, Clock, Grid2x2, ArrowRightLeft, ArrowUpRight,
  Cog, ArrowDownUp, Plug, Gauge, PenTool, ArrowDown, LayoutGrid, Cable,
  Scissors, Wrench, Square, Activity, Bluetooth, Radio, Smartphone,
  CreditCard, Globe, MapPin, RotateCw, Car, BatteryFull, Box, ArrowUp,
  Shield, Calculator, Binary, Lightbulb, CircleDot,
  Waveform: Activity, Grab: Hand, Container: Box,
};

export type ViewMode = 'grid' | 'list';

interface ProductCardProps {
  product: EditableProduct;
  viewMode?: ViewMode;
  /** Ref forwarded for scroll-to-highlight */
  innerRef?: RefObject<HTMLDivElement | null>;
  highlighted?: boolean;
}

export default function ProductCard({ product, viewMode = 'grid', innerRef, highlighted }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isStaff, deleteProduct, hidePrices } = useStaff();
  const [showEdit, setShowEdit] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const IconComponent = iconMap[product.icon] ?? Cpu;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ id: product.id, name: product.name, price: product.price, icon: product.icon, image: product.image });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      deleteProduct(product.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEdit(true);
  };

  const highlightClass = highlighted ? 'ring-2 ring-[var(--teal)] ring-offset-2' : '';

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <>
        <div
          ref={innerRef}
          onClick={() => setShowQuickView(true)}
          className={`relative bg-white rounded-xl border border-[var(--medium-gray)] overflow-hidden hover:border-[var(--teal)] hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-0 group ${highlightClass}`}
        >
          {/* Image */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-gradient-to-br from-[var(--light-gray)] to-white flex items-center justify-center border-r border-[var(--medium-gray)] overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-contain p-2" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-[var(--medium-gray)] flex items-center justify-center text-[var(--teal)]">
                <IconComponent size={24} strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 px-4 py-3">
            <div className="text-[10px] font-semibold text-[var(--teal)] uppercase tracking-wider mb-0.5">
              {product.subcategory || product.category}
            </div>
            <h3 className="text-sm font-semibold text-[var(--charcoal)] mb-1 leading-snug line-clamp-1">
              {product.name}
            </h3>
            <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed hidden sm:block">
              {product.desc}
            </p>
            {product.stock <= 10 && (
              <p className="text-[10px] text-orange-500 font-medium mt-1">Only {product.stock} left</p>
            )}
          </div>

          {/* Price + Add */}
          <div className="shrink-0 flex flex-col items-end gap-2 pr-4 py-3">
            {product.badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.badge === 'sale' ? 'bg-[var(--amber)] text-white' : 'bg-[var(--teal)] text-white'}`}>
                {product.badge === 'sale' ? 'SALE' : 'TOP'}
              </span>
            )}
            {!hidePrices && (
              <div className="text-right">
                <span className="text-base font-extrabold text-[var(--teal)] block">KSh {product.price.toLocaleString()}</span>
                {product.oldPrice && (
                  <span className="text-xs text-[var(--text-muted)] line-through">KSh {product.oldPrice.toLocaleString()}</span>
                )}
              </div>
            )}
            <button
              onClick={handleAdd}
              className="w-9 h-9 rounded-lg bg-[var(--teal-light)] border border-[var(--teal)]/20 text-[var(--teal)] flex items-center justify-center hover:bg-[var(--teal)] hover:text-white transition-all"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Staff controls */}
          {isStaff && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={handleEdit} className="w-7 h-7 bg-white border border-[var(--medium-gray)] rounded-md flex items-center justify-center text-[var(--teal)] hover:bg-[var(--teal)] hover:text-white hover:border-[var(--teal)] transition-all shadow-sm">
                <Pencil size={11} />
              </button>
              <button onClick={handleDelete} className={`w-7 h-7 rounded-md flex items-center justify-center transition-all shadow-sm border ${confirmDelete ? 'bg-red-500 text-white border-red-500' : 'bg-white border-[var(--medium-gray)] text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500'}`}>
                {confirmDelete ? <AlertCircle size={11} /> : <Trash2 size={11} />}
              </button>
            </div>
          )}
        </div>

        {showEdit && <ProductEditModal product={product} onClose={() => setShowEdit(false)} />}
        {showQuickView && <ProductQuickView product={product} onClose={() => setShowQuickView(false)} />}
      </>
    );
  }

  // ── GRID VIEW (default) ───────────────────────────────────────────────────
  return (
    <>
      <div
        ref={innerRef}
        onClick={() => setShowQuickView(true)}
        className={`relative bg-white rounded-2xl border border-[var(--medium-gray)] overflow-hidden hover:border-[var(--teal)] hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 group cursor-pointer ${highlightClass}`}
      >
        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-3 left-3 z-10 text-[11px] font-bold px-3 py-1 rounded-full ${product.badge === 'sale' ? 'bg-[var(--amber)] text-white' : 'bg-[var(--teal)] text-white'}`}>
            {product.badge === 'sale' ? 'SALE' : 'TOP PICK'}
          </span>
        )}

        {/* Staff edit/delete */}
        {isStaff && (
          <div className="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleEdit} className="w-8 h-8 bg-white border border-[var(--medium-gray)] rounded-lg flex items-center justify-center text-[var(--teal)] hover:bg-[var(--teal)] hover:text-white hover:border-[var(--teal)] transition-all shadow-sm">
              <Pencil size={13} />
            </button>
            <button onClick={handleDelete} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm border ${confirmDelete ? 'bg-red-500 text-white border-red-500' : 'bg-white border-[var(--medium-gray)] text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500'}`}>
              {confirmDelete ? <AlertCircle size={13} /> : <Trash2 size={13} />}
            </button>
          </div>
        )}

        {/* Product image */}
        <div className="h-44 bg-gradient-to-br from-[var(--light-gray)] to-white flex items-center justify-center overflow-hidden border-b border-[var(--medium-gray)] relative">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-white shadow-md border border-[var(--medium-gray)] flex items-center justify-center text-[var(--teal)] transition-transform duration-300 group-hover:scale-110">
              <IconComponent size={36} strokeWidth={1.5} />
            </div>
          )}
          {isStaff && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--teal)] to-transparent opacity-60" />}
        </div>

        <div className="p-5">
          <div className="text-[11px] font-semibold text-[var(--teal)] uppercase tracking-wider mb-1.5">
            {product.subcategory || product.category}
          </div>
          <h3 className="text-[15px] font-semibold text-[var(--charcoal)] mb-2 leading-snug line-clamp-2">
            {product.name}
          </h3>
          <p className="text-[13px] text-[var(--text-muted)] mb-4 line-clamp-2 leading-relaxed">
            {product.desc}
          </p>

          {product.stock <= 10 && (
            <p className="text-[11px] text-orange-500 font-medium mb-2">Only {product.stock} left in stock</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {!hidePrices && (
                <>
                  <span className="text-lg font-extrabold text-[var(--teal)]">KSh {product.price.toLocaleString()}</span>
                  {product.oldPrice && (
                    <span className="text-sm text-[var(--text-muted)] line-through">KSh {product.oldPrice.toLocaleString()}</span>
                  )}
                </>
              )}
            </div>
            <button
              onClick={handleAdd}
              className="w-10 h-10 rounded-xl bg-[var(--teal-light)] border border-[var(--teal)]/20 text-[var(--teal)] flex items-center justify-center hover:bg-[var(--teal)] hover:text-white transition-all shrink-0"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>

      {showEdit && <ProductEditModal product={product} onClose={() => setShowEdit(false)} />}
      {showQuickView && <ProductQuickView product={product} onClose={() => setShowQuickView(false)} />}
    </>
  );
}
