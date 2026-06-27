import { Link } from 'react-router-dom';
import { Microchip, MapPin, Phone, Mail, Clock, GraduationCap, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[var(--light-gray)] border-t border-[var(--medium-gray)]">
      <div className="max-w-[1280px] mx-auto px-[5%] pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
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
              Your trusted electronics components supplier in Mombasa, Kenya. Serving TUM students, engineering professionals, and makers across East Africa with quality products at student-friendly prices.
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

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--charcoal)] mb-5">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]"><MapPin size={14} className="text-[var(--teal)] shrink-0" /> Mombasa, Kenya</li>
              <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]"><Phone size={14} className="text-[var(--teal)] shrink-0" /> +254 7XX XXX XXX</li>
              <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]"><Mail size={14} className="text-[var(--teal)] shrink-0" /> info@dophaelectronics.co.ke</li>
              <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]"><Clock size={14} className="text-[var(--teal)] shrink-0" /> Mon-Sat: 8AM - 6PM</li>
              <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]"><GraduationCap size={14} className="text-[var(--teal)] shrink-0" /> TUM Campus Pickup Available</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--medium-gray)] pt-6 text-center text-sm text-[var(--text-muted)]">
          <p>2026 Dopha Electronics. All rights reserved. | Proudly supporting TUM engineering students.</p>
        </div>
      </div>
    </footer>
  );
}
