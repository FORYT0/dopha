import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Microchip, ShoppingCart, Search, Menu, X, ShieldCheck, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStaff } from '../context/StaffContext';
import StaffLoginModal from './StaffLoginModal';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const { isStaff, logout } = useStaff();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    onSearch?.(q);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/project-lab', label: 'Project Lab' },
    { to: '/about', label: 'About' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-[var(--medium-gray)] transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-[1280px] mx-auto px-[5%] h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 bg-[var(--teal)] rounded-xl flex items-center justify-center text-white">
              <Microchip size={22} />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-[var(--charcoal)]">
              Dopha <span className="text-[var(--teal)]">Electronics</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors relative pb-1 ${location.pathname === link.to ? 'text-[var(--teal)]' : 'text-[var(--text-muted)] hover:text-[var(--teal)]'}`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--teal)] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={handleSearch}
                className="bg-[var(--light-gray)] border border-[var(--medium-gray)] rounded-lg pl-9 pr-4 py-2 text-sm w-52 focus:w-72 transition-all outline-none focus:border-[var(--teal)] focus:ring-1 focus:ring-[var(--teal)]"
              />
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-[var(--charcoal)] hover:text-[var(--teal)] transition-colors"
            >
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[var(--teal)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            {/* Staff button — always visible */}
            {isStaff ? (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--charcoal)] text-white text-xs font-semibold hover:bg-black transition-colors"
                title="Exit staff mode"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Exit Staff</span>
              </button>
            ) : (
              <button
                onClick={() => setShowStaffLogin(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--medium-gray)] text-[var(--text-muted)] text-xs font-semibold hover:border-[var(--teal)] hover:text-[var(--teal)] transition-colors"
                title="Staff login"
              >
                <ShieldCheck size={13} />
                <span className="hidden sm:inline">Staff Login</span>
              </button>
            )}

            <button
              className="md:hidden p-2 text-[var(--charcoal)]"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {showStaffLogin && <StaffLoginModal onClose={() => setShowStaffLogin(false)} />}

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-16 px-6 md:hidden">
          <div className="flex flex-col gap-4 mt-4">
            <div className="relative mb-2">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-[var(--light-gray)] border border-[var(--medium-gray)] rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[var(--teal)]"
              />
            </div>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-lg font-medium py-3 border-b border-[var(--medium-gray)] ${location.pathname === link.to ? 'text-[var(--teal)]' : 'text-[var(--charcoal)]'}`}
              >
                {link.label}
              </Link>
            ))}
            {/* Staff login in mobile menu */}
            <div className="pt-2">
              {isStaff ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--charcoal)] text-white font-semibold text-sm"
                >
                  <LogOut size={16} /> Exit Staff Mode
                </button>
              ) : (
                <button
                  onClick={() => { setShowStaffLogin(true); setMobileOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[var(--medium-gray)] text-[var(--charcoal)] font-semibold text-sm hover:border-[var(--teal)] hover:text-[var(--teal)] transition-colors"
                >
                  <ShieldCheck size={16} /> Staff Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
