import {
  Cpu, Wifi, Camera, Monitor, Thermometer, Ruler, Eye, Flame, Wind, Sun,
  Droplets, Mic, Heart, Cloud, AlertTriangle, Waves, CloudRain, Scale,
  Palette, Hand, Zap, Battery, Sliders, SlidersHorizontal, Timer,
  ToggleLeft, ToggleRight, Grid3x3, Power, Volume2, GitBranch, ArrowRight,
  BatteryCharging, Triangle, Clock, Grid2x2, ArrowRightLeft, ArrowUpRight,
  Cog, ArrowDownUp, Plug, Gauge, PenTool, ArrowDown, LayoutGrid, Cable,
  Scissors, Wrench, Square, Activity, Bluetooth, Radio, Smartphone,
  CreditCard, Globe, MapPin, RotateCw, Car, BatteryFull, Box, ArrowUp,
  Shield, Calculator, Binary, Lightbulb, CircleDot, Plus, type LucideIcon,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Product } from '../data/products';

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
  // Aliases for names used in products.ts that differ from lucide exports
  Waveform: Activity,
  Grab: Hand,
  Container: Box,
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const IconComponent = iconMap[product.icon] ?? Cpu;

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      icon: product.icon,
    });
  };

  return (
    <div className="relative bg-white rounded-2xl border border-[var(--medium-gray)] overflow-hidden hover:border-[var(--teal)] hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 group">
      {product.badge && (
        <span
          className={`absolute top-3 left-3 z-10 text-[11px] font-bold px-3 py-1 rounded-full ${
            product.badge === 'sale'
              ? 'bg-[var(--amber)] text-white'
              : 'bg-[var(--teal)] text-white'
          }`}
        >
          {product.badge === 'sale' ? 'SALE' : 'TUM FAVE'}
        </span>
      )}

      {/* Product image area */}
      <div className="h-44 bg-gradient-to-br from-[var(--light-gray)] to-white flex items-center justify-center overflow-hidden border-b border-[var(--medium-gray)]">
        <div className="w-20 h-20 rounded-2xl bg-white shadow-md border border-[var(--medium-gray)] flex items-center justify-center text-[var(--teal)] transition-transform duration-300 group-hover:scale-110">
          <IconComponent size={36} strokeWidth={1.5} />
        </div>
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

        {/* Stock indicator */}
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
  );
}
