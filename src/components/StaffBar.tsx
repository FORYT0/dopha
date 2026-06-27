import { useState } from 'react';
import { ShieldCheck, LogOut, Plus, RotateCcw, Eye } from 'lucide-react';
import { useStaff } from '../context/StaffContext';
import AddProductModal from './AddProductModal';

export default function StaffBar() {
  const { logout, resetProducts } = useStaff();
  const [showAdd, setShowAdd] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleReset = () => {
    if (showConfirmReset) {
      resetProducts();
      setShowConfirmReset(false);
    } else {
      setShowConfirmReset(true);
      setTimeout(() => setShowConfirmReset(false), 3000);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[55] bg-[var(--charcoal)] text-white h-9 flex items-center px-4">
        <div className="max-w-[1280px] w-full mx-auto flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck size={13} className="text-[var(--teal)]" />
            <span className="font-semibold text-white/90">Staff Mode</span>
            <span className="text-white/40 hidden sm:inline">— click any card's pencil icon to edit</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--teal)] hover:bg-[var(--teal-dark)] text-white text-xs font-semibold transition-colors"
            >
              <Plus size={12} /> Add Product
            </button>
            <button
              onClick={handleReset}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${showConfirmReset ? 'bg-red-500 hover:bg-red-600 text-white' : 'hover:bg-white/10 text-white/60 hover:text-white'}`}
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">{showConfirmReset ? 'Confirm Reset?' : 'Reset'}</span>
            </button>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white text-xs font-semibold transition-colors"
            >
              <LogOut size={12} />
              <span className="hidden sm:inline">Exit Staff Mode</span>
            </button>
          </div>
        </div>
      </div>

      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} />}
    </>
  );
}
