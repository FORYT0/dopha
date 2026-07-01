import { useState, useRef } from 'react';
import { X, Upload, Check, Plus } from 'lucide-react';
import { useStaff } from '../context/StaffContext';
import { categories } from '../data/products';

interface Props {
  onClose: () => void;
}

const BADGES = [
  { value: '', label: 'None' },
  { value: 'sale', label: 'Sale' },
  { value: 'tum', label: 'Top Pick' },
];

const ICONS = [
  'Cpu','Wifi','Camera','Monitor','Thermometer','Ruler','Eye','Flame','Wind','Sun',
  'Droplets','Mic','Heart','Cloud','Zap','Battery','Sliders','Timer','Power',
  'BatteryCharging','Clock','Cog','Plug','Gauge','Cable','Wrench','Square',
  'Activity','Bluetooth','Radio','Smartphone','Globe','Car','Shield','Lightbulb',
];

export default function AddProductModal({ onClose }: Props) {
  const { addProduct } = useStaff();
  const [step, setStep] = useState<1 | 2>(1);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    desc: '',
    category: categories[0]?.id || 'microcontrollers',
    subcategory: '',
    price: '',
    oldPrice: '',
    badge: '' as '' | 'sale' | 'tum',
    stock: '50',
    icon: 'Cpu',
    image: '',
  });

  const set = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set('image', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const canProceed = form.name.trim() && form.desc.trim() && form.price;

  const handleSave = () => {
    if (!canProceed) return;
    addProduct({
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

  const Field = ({ label, children, required = false }: { label: string; children: React.ReactNode; required?: boolean }) => (
    <div>
      <label className="block text-xs font-semibold text-[var(--charcoal)] mb-1.5 uppercase tracking-wider">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--medium-gray)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--teal)] flex items-center justify-center">
              <Plus size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--charcoal)]">Add New Product</h2>
              <p className="text-xs text-[var(--text-muted)]">Step {step} of 2</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--light-gray)] rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4 pb-2 shrink-0 flex gap-2">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-[var(--teal)]' : 'bg-[var(--medium-gray)]'}`} />
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">

          {/* ── STEP 1: Basic Info ── */}
          {step === 1 && <>
            <Field label="Product Name" required>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. ESP32 DevKit V1"
                autoFocus
                className="w-full px-3.5 py-2.5 border border-[var(--medium-gray)] rounded-xl text-sm outline-none focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white"
              />
            </Field>
            <Field label="Description" required>
              <textarea
                value={form.desc}
                onChange={e => set('desc', e.target.value)}
                rows={3}
                placeholder="Brief description of the product..."
                className="w-full px-3.5 py-2.5 border border-[var(--medium-gray)] rounded-xl text-sm outline-none focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 resize-none bg-white"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category" required>
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[var(--medium-gray)] rounded-xl text-sm outline-none focus:border-[var(--teal)] bg-white cursor-pointer"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Subcategory">
                <input
                  type="text"
                  value={form.subcategory}
                  onChange={e => set('subcategory', e.target.value)}
                  placeholder="e.g. WiFi SoC"
                  className="w-full px-3.5 py-2.5 border border-[var(--medium-gray)] rounded-xl text-sm outline-none focus:border-[var(--teal)] bg-white"
                />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <Field label="Price (KSh)" required>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => set('price', e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 border border-[var(--medium-gray)] rounded-xl text-sm outline-none focus:border-[var(--teal)] bg-white"
                  />
                </Field>
              </div>
              <div className="col-span-1">
                <Field label="Old Price">
                  <input
                    type="number"
                    value={form.oldPrice}
                    onChange={e => set('oldPrice', e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3.5 py-2.5 border border-[var(--medium-gray)] rounded-xl text-sm outline-none focus:border-[var(--teal)] bg-white"
                  />
                </Field>
              </div>
              <div className="col-span-1">
                <Field label="Stock">
                  <input
                    type="number"
                    value={form.stock}
                    onChange={e => set('stock', e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[var(--medium-gray)] rounded-xl text-sm outline-none focus:border-[var(--teal)] bg-white"
                  />
                </Field>
              </div>
            </div>
            <Field label="Badge">
              <div className="flex gap-3 mt-1">
                {BADGES.map(b => (
                  <button key={b.value} type="button" onClick={() => set('badge', b.value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${form.badge === b.value ? 'bg-[var(--teal)] text-white border-[var(--teal)]' : 'border-[var(--medium-gray)] text-[var(--text-muted)] hover:border-[var(--teal)]'}`}>
                    {b.label}
                  </button>
                ))}
              </div>
            </Field>
          </>}

          {/* ── STEP 2: Photo & Icon ── */}
          {step === 2 && <>
            <p className="text-sm text-[var(--text-muted)]">Upload a product photo, or pick an icon. The photo takes priority if both are set.</p>

            {/* Photo upload */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-[var(--medium-gray)] rounded-2xl p-6 text-center cursor-pointer hover:border-[var(--teal)] hover:bg-[var(--teal-light)]/30 transition-all group"
            >
              <Upload size={28} className="mx-auto mb-2 text-[var(--text-muted)] group-hover:text-[var(--teal)] transition-colors" />
              <p className="text-sm font-semibold text-[var(--charcoal)]">Upload Photo</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">JPG, PNG, WebP</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            {form.image && (
              <div className="relative rounded-xl overflow-hidden border border-[var(--medium-gray)]">
                <img src={form.image} alt="Preview" className="w-full h-40 object-contain bg-[var(--light-gray)]" />
                <button onClick={() => set('image', '')} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg">
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Icon selector */}
            <Field label="Icon (used when no photo)">
              <div className="grid grid-cols-6 gap-2 mt-2 max-h-48 overflow-y-auto pr-1">
                {ICONS.map(iconName => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => set('icon', iconName)}
                    title={iconName}
                    className={`h-11 rounded-xl flex items-center justify-center transition-all border ${form.icon === iconName ? 'bg-[var(--teal)] text-white border-[var(--teal)]' : 'border-[var(--medium-gray)] text-[var(--text-muted)] hover:border-[var(--teal)] bg-white'}`}
                  >
                    <span className="text-[9px] font-medium truncate px-0.5">{iconName}</span>
                  </button>
                ))}
              </div>
            </Field>
          </>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--medium-gray)] flex gap-3 shrink-0 bg-white">
          {step === 1 ? (
            <>
              <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--medium-gray)] text-[var(--charcoal)] font-semibold rounded-xl hover:bg-[var(--light-gray)] transition-colors text-sm">
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!canProceed}
                className="flex-1 py-2.5 bg-[var(--teal)] hover:bg-[var(--teal-dark)] text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-40"
              >
                Next: Photo & Icon →
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="flex-1 py-2.5 border border-[var(--medium-gray)] text-[var(--charcoal)] font-semibold rounded-xl hover:bg-[var(--light-gray)] transition-colors text-sm">
                ← Back
              </button>
              <button
                onClick={handleSave}
                className={`flex-1 py-2.5 font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-[var(--teal)] hover:bg-[var(--teal-dark)] text-white'}`}
              >
                {saved ? <><Check size={16} /> Added!</> : <><Plus size={16} /> Add Product</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
