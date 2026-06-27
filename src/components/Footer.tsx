import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Microchip, MapPin, Phone, Mail, Clock, GraduationCap, Facebook, Twitter, Instagram, Youtube, Pencil, Check, X, RotateCcw } from 'lucide-react';
import { useStaff } from '../context/StaffContext';

// Inline editable text field — shown as text normally, input when editing (staff mode only)
function EditableField({
  isStaff,
  value,
  onSave,
  multiline = false,
  className = '',
}: {
  isStaff: boolean;
  value: string;
  onSave: (v: string) => void;
  multiline?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Only sync external value changes when NOT actively editing
  // (prevents cursor jumping when parent re-renders mid-type)
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      textareaRef.current?.focus();
    }
  }, [editing]);

  const commit = () => { onSave(draft.trim() || value); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (!isStaff) return <span className={className}>{value}</span>;

  if (editing) {
    const sharedClass = `bg-white border border-[var(--teal)] rounded-lg px-2 py-1 text-sm outline-none ring-2 ring-[var(--teal)]/20 w-full resize-none ${className}`;
    return (
      <span className="inline-flex items-start gap-1 w-full">
        {multiline ? (
          <textarea ref={textareaRef} value={draft} onChange={e => setDraft(e.target.value)} rows={3}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) commit(); if (e.key === 'Escape') cancel(); }}
            className={sharedClass} />
        ) : (
          <input ref={inputRef} type="text" value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
            className={sharedClass} />
        )}
        <button onClick={commit} className="mt-0.5 p-1 rounded bg-[var(--teal)] text-white hover:bg-[var(--teal-dark)] shrink-0"><Check size={12} /></button>
        <button onClick={cancel} className="mt-0.5 p-1 rounded bg-[var(--medium-gray)] text-[var(--charcoal)] hover:bg-gray-300 shrink-0"><X size={12} /></button>
      </span>
    );
  }

  return (
    <span
      className={`group/ef inline-flex items-center gap-1 cursor-pointer hover:text-[var(--charcoal)] transition-colors ${className}`}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value}
      <Pencil size={11} className="opacity-0 group-hover/ef:opacity-60 text-[var(--teal)] shrink-0 transition-opacity" />
    </span>
  );
}

export default function Footer() {
  const { isStaff, footerData, updateFooterData, resetFooterData } = useStaff();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    if (showResetConfirm) { resetFooterData(); setShowResetConfirm(false); }
    else { setShowResetConfirm(true); setTimeout(() => setShowResetConfirm(false), 3000); }
  };

  return (
    <footer className="bg-[var(--light-gray)] border-t border-[var(--medium-gray)] relative">
      {/* Staff footer edit hint */}
      {isStaff && (
        <div className="absolute top-3 right-4 flex items-center gap-2">
          <span className="text-[11px] text-[var(--teal)] font-semibold bg-[var(--teal-light)] px-2.5 py-1 rounded-full border border-[var(--teal)]/20">
            ✏️ Click any text to edit
          </span>
          <button
            onClick={handleReset}
            className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${showResetConfirm ? 'bg-red-500 text-white border-red-500' : 'border-[var(--medium-gray)] text-[var(--text-muted)] hover:border-red-400 hover:text-red-500'}`}
            title="Reset footer to defaults"
          >
            <RotateCcw size={10} />
            {showResetConfirm ? 'Confirm?' : 'Reset Footer'}
          </button>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto px-[5%] pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 no-underline mb-4">
              <div className="w-10 h-10 bg-[var(--teal)] rounded-xl flex items-center justify-center text-white">
                <Microchip size={22} />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-[var(--charcoal)]">
                Dopha <span className="text-[var(--teal)]">Electronics</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-5">
              <EditableField
                isStaff={isStaff}
                value={footerData.description}
                onSave={v => updateFooterData({ description: v })}
                multiline
              />
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, label: 'Facebook' },
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Youtube, label: 'YouTube' },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" className="w-10 h-10 rounded-lg border border-[var(--medium-gray)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--teal)] hover:text-white hover:border-[var(--teal)] transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--charcoal)] mb-5">Shop</h4>
            <ul className="space-y-3">
              {['Microcontrollers', 'Sensors & Modules', 'Passive Components', 'Tools & Equipment', 'Power Supplies', 'Cables & Connectors'].map(item => (
                <li key={item}>
                  <Link to="/products" className="text-sm text-[var(--text-muted)] hover:text-[var(--teal)] transition-colors no-underline">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--charcoal)] mb-5">Support</h4>
            <ul className="space-y-3">
              {['Student Discount', 'Delivery Information', 'Return Policy', 'Project Tutorials', 'Datasheets Library', 'FAQ'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--teal)] transition-colors no-underline">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column — fully editable */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--charcoal)] mb-5">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <MapPin size={14} className="text-[var(--teal)] shrink-0 mt-0.5" />
                <EditableField isStaff={isStaff} value={footerData.address} onSave={v => updateFooterData({ address: v })} />
              </li>
              <li className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <Phone size={14} className="text-[var(--teal)] shrink-0 mt-0.5" />
                <EditableField isStaff={isStaff} value={footerData.phone} onSave={v => updateFooterData({ phone: v })} />
              </li>
              <li className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <Mail size={14} className="text-[var(--teal)] shrink-0 mt-0.5" />
                <EditableField isStaff={isStaff} value={footerData.email} onSave={v => updateFooterData({ email: v })} />
              </li>
              <li className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <Clock size={14} className="text-[var(--teal)] shrink-0 mt-0.5" />
                <EditableField isStaff={isStaff} value={footerData.hours} onSave={v => updateFooterData({ hours: v })} />
              </li>
              <li className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <GraduationCap size={14} className="text-[var(--teal)] shrink-0 mt-0.5" />
                TUM Campus Pickup Available
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--medium-gray)] pt-6 text-center text-sm text-[var(--text-muted)]">
          <EditableField
            isStaff={isStaff}
            value={footerData.copyright}
            onSave={v => updateFooterData({ copyright: v })}
          />
        </div>
      </div>
    </footer>
  );
}
