import { useState, useRef } from 'react';
import { X, Upload, Image, Tag, DollarSign, Package, Info, Check, Trash2 } from 'lucide-react';
import { useStaff, type EditableProduct } from '../context/StaffContext';
import { categories } from '../data/products';

interface Props {
  product: EditableProduct;
  onClose: () => void;
}

const BADGES = [
  { value: '', label: 'None' },
  { value: 'sale', label: 'Sale' },
  { value: 'tum', label: 'TUM Fave' },
];

const ICONS = [
  'Cpu','Wifi','Camera','Monitor','Thermometer','Ruler','Eye','Flame','Wind','Sun',
  'Droplets','Mic','Heart','Cloud','AlertTriangle','Waves','CloudRain','Scale',
  'Palette','Hand','Zap','Battery','Sliders','Timer','ToggleLeft','Power','Volume2',
  'BatteryCharging','Triangle','Clock','Cog','Plug','Gauge','PenTool','Cable',
  'Scissors','Wrench','Square','Activity','Bluetooth','Radio','Smartphone','Globe',
  'MapPin','Car','Shield','Calculator','Lightbulb','Box','ArrowUp','CircleDot',
];

const TAB = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${active ? 'bg-[var(--teal)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--charcoal)] hover:bg-[var(--light-gray)]'}`}
  >
    {children}
  </button>
);

export default function ProductEditModal({ product, onClose }: Props) {
  const { updateProduct } = useStaff();
  const [tab, setTab] = useState<'info' | 'pricing' | 'image' | 'icon'>('info');
  const [form, setForm] = useState({
    name: product.name,
    desc: product.desc,
    category: product.category,
    subcategory: product.subcategory || '',
    price: product.price,
    oldPrice: product.oldPrice || '',
    badge: product.badge || '',
    stock: product.stock,
    icon: product.icon,
    image: product.image || '',
  });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set('image', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProduct(product.id, {
      name: form.name.trim(),
      desc: form.desc.trim(),
      category: form.category,
      subcategory: form.subcategory.trim() || undefined,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      badge: (form.badge || null) as 'sale' | 'tum' | null,
      stock: Number(form.stock),
      icon: form.icon,
      image: form.image || undefined,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-semibold text-[var(--charcoal)] mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );

  const Input = ({ value, onChange, type = 'text', placeholder = '' }: { value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 border border-[var(--medium-gray)] rounded-xl text-sm outline-none focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 transition-all bg-white"
    />
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--medium-gray)] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-[var(--charcoal)]">Edit Product</h2>
            <p className="text-xs text-[var(--text-muted)] truncate max-w-xs">{product.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--light-gray)] rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-[var(--medium-gray)] flex gap-2 shrink-0 bg-[var(--light-gray)]">
          <TAB active={tab === 'info'} onClick={() => setTab('info')}><Info size={13} className="inline mr-1.5" />Info</TAB>
          <TAB active={tab === 'pricing'} onClick={() => setTab('pricing')}><DollarSign size={13} className="inline mr-1.5" />Pricing</TAB>
          <TAB active={tab === 'image'} onClick={() => setTab('image')}><Image size={13} className="inline mr-1.5" />Photo</TAB>
          <TAB active={tab === 'icon'} onClick={() => setTab('icon')}><Tag size={13} className="inline mr-1.5" />Icon</TAB>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* ── INFO TAB ── */}
          {tab === 'info' && <>
            <Field label="Product Name">
              <Input value={form.name} onChange={v => set('name', v)} placeholder="e.g. Arduino Uno R3" />
            </Field>
            <Field label="Description">
              <textarea
                value={form.desc}
                onChange={e => set('desc', e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 border border-[var(--medium-gray)] rounded-xl text-sm outline-none focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 transition-all resize-none bg-white"
                placeholder="Brief product description..."
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[var(--medium-gray)] rounded-xl text-sm outline-none focus:border-[var(--teal)] bg-white cursor-pointer"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Subcategory">
                <Input value={form.subcategory} onChange={v => set('subcategory', v)} placeholder="e.g. AVR" />
              </Field>
            </div>
            <Field label="Stock">
              <Input type="number" value={form.stock} onChange={v => set('stock', v)} />
            </Field>
          </>}

          {/* ── PRICING TAB ── */}
          {tab === 'pricing' && <>
            <Field label="Price (KSh)">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--teal)]">KSh</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 border border-[var(--medium-gray)] rounded-xl text-sm outline-none focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white"
                />
              </div>
            </Field>
            <Field label="Original Price (KSh) — shown as strikethrough">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--text-muted)]">KSh</span>
                <input
                  type="number"
                  value={form.oldPrice}
                  onChange={e => set('oldPrice', e.target.value)}
                  placeholder="Leave blank if no discount"
                  className="w-full pl-12 pr-4 py-2.5 border border-[var(--medium-gray)] rounded-xl text-sm outline-none focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white"
                />
              </div>
            </Field>
            <Field label="Badge">
              <div className="flex gap-3 mt-1">
                {BADGES.map(b => (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => set('badge', b.value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${form.badge === b.value ? 'bg-[var(--teal)] text-white border-[var(--teal)]' : 'border-[var(--medium-gray)] text-[var(--text-muted)] hover:border-[var(--teal)]'}`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </Field>
            {/* Preview */}
            <div className="bg-[var(--light-gray)] rounded-xl p-4 mt-2">
              <p className="text-xs text-[var(--text-muted)] mb-2 font-semibold uppercase tracking-wider">Preview</p>
              <div className="flex items-center gap-3">
                <span className="text-xl font-extrabold text-[var(--teal)]">KSh {Number(form.price).toLocaleString()}</span>
                {form.oldPrice && <span className="text-sm text-[var(--text-muted)] line-through">KSh {Number(form.oldPrice).toLocaleString()}</span>}
                {form.badge === 'sale' && <span className="text-xs font-bold bg-[var(--amber)] text-white px-2 py-0.5 rounded-full">SALE</span>}
                {form.badge === 'tum' && <span className="text-xs font-bold bg-[var(--teal)] text-white px-2 py-0.5 rounded-full">TUM FAVE</span>}
              </div>
            </div>
          </>}

          {/* ── PHOTO TAB ── */}
          {tab === 'image' && <>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-[var(--medium-gray)] rounded-2xl p-8 text-center cursor-pointer hover:border-[var(--teal)] hover:bg-[var(--teal-light)]/30 transition-all group"
            >
              <Upload size={32} className="mx-auto mb-3 text-[var(--text-muted)] group-hover:text-[var(--teal)] transition-colors" />
              <p className="text-sm font-semibold text-[var(--charcoal)]">Click to upload photo</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">JPG, PNG, WebP — will be stored locally</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            {form.image ? (
              <div className="relative rounded-2xl overflow-hidden border border-[var(--medium-gray)]">
                <img src={form.image} alt="Product" className="w-full h-52 object-contain bg-[var(--light-gray)]" />
                <button
                  onClick={() => set('image', '')}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                >
                  <Trash2 size={14} />
                </button>
                <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                  Custom photo active
                </div>
              </div>
            ) : (
              <div className="bg-[var(--light-gray)] rounded-xl p-4 text-center">
                <Package size={24} className="mx-auto mb-2 text-[var(--text-muted)]" />
                <p className="text-xs text-[var(--text-muted)]">No custom photo — using icon display</p>
              </div>
            )}
          </>}

          {/* ── ICON TAB ── */}
          {tab === 'icon' && <>
            <p className="text-xs text-[var(--text-muted)]">Choose the icon shown when no photo is uploaded.</p>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {ICONS.map(iconName => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => set('icon', iconName)}
                  title={iconName}
                  className={`h-12 rounded-xl flex items-center justify-center text-xs font-medium transition-all border ${form.icon === iconName ? 'bg-[var(--teal)] text-white border-[var(--teal)] shadow-md' : 'border-[var(--medium-gray)] text-[var(--text-muted)] hover:border-[var(--teal)] hover:text-[var(--teal)] bg-white'}`}
                >
                  <span className="truncate px-1 text-[10px]">{iconName}</span>
                </button>
              ))}
            </div>
          </>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--medium-gray)] flex gap-3 shrink-0 bg-white">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--medium-gray)] text-[var(--charcoal)] font-semibold rounded-xl hover:bg-[var(--light-gray)] transition-colors text-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 py-2.5 font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-[var(--teal)] hover:bg-[var(--teal-dark)] text-white'}`}
          >
            {saved ? <><Check size={16} /> Saved!</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
