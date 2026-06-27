import { useState } from 'react';
import { X, Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useStaff } from '../context/StaffContext';

interface Props {
  onClose: () => void;
}

export default function StaffLoginModal({ onClose }: Props) {
  const { login } = useStaff();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const ok = login(username.trim(), password);
      if (ok) {
        onClose();
      } else {
        setError('Invalid username or password.');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--charcoal)] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--teal)] flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Staff Login</h2>
              <p className="text-xs text-white/50">Dopha Electronics Admin</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X size={18} className="text-white/70" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--charcoal)] mb-1.5 uppercase tracking-wider">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                autoFocus
                required
                className="w-full pl-9 pr-4 py-3 border border-[var(--medium-gray)] rounded-xl text-sm outline-none focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--charcoal)] mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-9 pr-11 py-3 border border-[var(--medium-gray)] rounded-xl text-sm outline-none focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--charcoal)] transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--teal)] hover:bg-[var(--teal-dark)] text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <ShieldCheck size={16} />
            )}
            {loading ? 'Verifying…' : 'Sign In as Staff'}
          </button>

          <p className="text-center text-xs text-[var(--text-muted)] mt-2">
            Staff access only. All edits are saved locally.
          </p>
        </form>
      </div>
    </div>
  );
}
