import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Microchip, MapPin, Phone, Mail, Clock, GraduationCap, Facebook, Twitter, Instagram, Youtube, RotateCcw } from 'lucide-react';
import { useStaff } from '../context/StaffContext';
import InlineEdit from './InlineEdit';

export default function Footer() {
  const { isStaff, footerData, updateFooterData, resetFooterData } = useStaff();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    if (showResetConfirm) { resetFooterData(); setShowResetConfirm(false); }
    else { setShowResetConfirm(true); setTimeout(() => setShowResetConfirm(false), 3000); }
  };

  return (
    <footer className="bg-[var(--light-gray)] border-t border-[var(--medium-gray)] relative">
      {isStaff && (
        <div className="absolute top-3 right-4 flex items-center gap-2">
          <span className="text-[11px] text-[var(--teal)] font-semibold bg-[var(--teal-light)] px-2.5 py-1 rounded-full border border-[var(--teal)]/20">
            ✏️ Click any text to edit
          </span>
          <button
            onClick={handleReset}
            className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${showResetConfirm ? 'bg-red-500 text-white border-red-500' : 'border-[var(--medium-gray)] text-[var(--text-muted)] hover:border-red-400 hover:text-red-500'}`}
          >
            <RotateCcw size={10} />
            {showResetConfirm ? 'Confirm?' : 'Reset Footer'}
          </button>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto px-[5%] pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
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
              <InlineEdit
                value={footerData.description}
                onSave={v => updateFooterData({ description: v })}
                multiline
                className="text-sm text-[var(--text-muted)]"
              />
            </p>
            <div className="flex gap-3">
              {[{ Icon: Facebook, label: 'Facebook' }, { Icon: Twitter, label: 'Twitter' }, { Icon: Instagram, label: 'Instagram' }, { Icon: Youtube, label: 'YouTube' }].map(({ Icon, label }) => (
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
                <li key={item}><Link to="/products" className="text-sm text-[var(--text-muted)] hover:text-[var(--teal)] transition-colors no-underline">{item}</Link></li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--charcoal)] mb-5">Support</h4>
            <ul className="space-y-3">
              {['Student Discount', 'Delivery Information', 'Return Policy', 'Project Tutorials', 'Datasheets Library', 'FAQ'].map(item => (
                <li key={item}><a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--teal)] transition-colors no-underline">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact — fully editable */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--charcoal)] mb-5">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <MapPin size={14} className="text-[var(--teal)] shrink-0 mt-0.5" />
                <InlineEdit value={footerData.address}   onSave={v => updateFooterData({ address: v })}   className="text-sm" />
              </li>
              <li className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <Phone size={14} className="text-[var(--teal)] shrink-0 mt-0.5" />
                <InlineEdit value={footerData.phone}     onSave={v => updateFooterData({ phone: v })}     className="text-sm" />
              </li>
              <li className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <Mail size={14} className="text-[var(--teal)] shrink-0 mt-0.5" />
                <InlineEdit value={footerData.email}     onSave={v => updateFooterData({ email: v })}     className="text-sm" />
              </li>
              <li className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <Clock size={14} className="text-[var(--teal)] shrink-0 mt-0.5" />
                <InlineEdit value={footerData.hours}     onSave={v => updateFooterData({ hours: v })}     className="text-sm" />
              </li>
              <li className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <GraduationCap size={14} className="text-[var(--teal)] shrink-0 mt-0.5" />
                Campus Pickup Available
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--medium-gray)] pt-6 text-center text-sm text-[var(--text-muted)]">
          <InlineEdit value={footerData.copyright} onSave={v => updateFooterData({ copyright: v })} className="text-sm text-[var(--text-muted)]" />
        </div>
      </div>
    </footer>
  );
}
