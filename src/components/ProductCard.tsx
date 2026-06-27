import { useState } from 'react';
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

interface ProductCardProps {
  product: EditableProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isStaff, deleteProduct } = useStaff();
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const IconComponent = iconMap[product.icon] ?? Cpu;

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      icon: product.icon,
    });
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteProduct(product.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
    }
  };

  return (
    <>
      <div className="relative bg-white rounded-2xl border border-[var(--medium-gray)] overflow-hidden hover:border-[var(--teal)] hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 group">

        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-3 left-3 z-10 text-[11px] font-bold px-3 py-1 rounded-full ${product.badge === 'sale' ? 'bg-[var(--amber)] text-white' : 'bg-[var(--teal)] text-white'}`}>
            {product.badge === 'sale' ? 'SALE' : 'TUM FAVE'}
          </span>
        )}

        {/* Staff edit/delete buttons — visible on hover */}
        {isStaff && (
          <div className="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowEdit(true)}
              className="w-8 h-8 bg-white border border-[var(--medium-gray)] rounded-lg flex items-center justify-center text-[var(--teal)] hover:bg-[var(--teal)] hover:text-white hover:border-[var(--teal)] transition-all shadow-sm"
              title="Edit product"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={handleDelete}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm border ${confirmDelete ? 'bg-red-500 text-white border-red-500' : 'bg-white border-[var(--medium-gray)] text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500'}`}
              title={confirmDelete ? 'Click again to confirm delete' : 'Delete product'}
            >
              {confirmDelete ? <AlertCircle size={13} /> : <Trash2 size={13} />}
            </button>
          </div>
        )}

        {/* Product image / icon area */}
        <div className="h-44 bg-gradient-to-br from-[var(--light-gray)] to-white flex items-center justify-center overflow-hidden border-b border-[var(--medium-gray)] relative">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-white shadow-md border border-[var(--medium-gray)] flex items-center justify-center text-[var(--teal)] transition-transform duration-300 group-hover:scale-110">
              <IconComponent size={36} strokeWidth={1.5} />
            </div>
          )}
          {/* Staff mode teal indicator bar */}
          {isStaff && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--teal)] to-transparent opacity-60" />
          )}
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
            <p className="text-[11px] text-orange-500 font-medium mb-2">
              Only {product.stock} left in stock
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-extrabold text-[var(--teal)]">
                KSh {product.price.toLocaleString()}
              </span>
              {product.oldPrice && (
                <span className="text-sm text-[var(--text-muted)] line-through">
                  KSh {product.oldPrice.toLocaleString()}
                </span>
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
    </>
  );
}
