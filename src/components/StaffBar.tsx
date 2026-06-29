import { useState } from 'react';
import { ShieldCheck, LogOut, Plus, RotateCcw, EyeOff, Eye, Save, Check, Loader2 } from 'lucide-react';
import { useStaff } from '../context/StaffContext';
import AddProductModal from './AddProductModal';

export default function StaffBar() {
  const { logout, resetProducts, hidePrices, toggleHidePrices, isDirty, isSaving, saveAll } = useStaff();
  const [showAdd, setShowAdd] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleReset = () => {
    if (showConfirmReset) { resetProducts(); setShowConfirmReset(false); }
    else { setShowConfirmReset(true); setTimeout(() => setShowConfirmReset(false), 3000); }
  };

  const handleSave = async () => {
    await saveAll();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[55] bg-[var(--charcoal)] text-white h-9 flex items-center px-4">
        <div className="max-w-[1280px] w-full mx-auto flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck size={13} className="text-[var(--teal)]" />
            <span className="font-semibold text-white/90">Staff Mode</span>
            {isDirty && !isSaving && (
              <span className="text-amber-400 text-[11px] font-medium hidden sm:inline">
                ● Unsaved changes
              </span>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Add Product */}
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--teal)] hover:bg-[var(--teal-dark)] text-white text-xs font-semibold transition-colors"
            >
              <Plus size={12} /> Add Product
            </button>

            {/* Save All */}
            <button
              onClick={handleSave}
              disabled={isSaving || (!isDirty && !justSaved)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                isSaving
                  ? 'bg-green-700 text-white cursor-wait'
                  : justSaved
                  ? 'bg-green-600 text-white'
                  : isDirty
                  ? 'bg-green-500 hover:bg-green-400 text-white animate-pulse'
                  : 'border border-white/20 text-white/40 cursor-not-allowed'
              }`}
              title={isDirty ? 'Publish changes to all browsers' : 'No unsaved changes'}
            >
              {isSaving ? (
                <><Loader2 size={12} className="animate-spin" /> Saving…</>
              ) : justSaved ? (
                <><Check size={12} /> Saved!</>
              ) : (
                <><Save size={12} /><span className="hidden sm:inline">Save</span></>
              )}
            </button>

            {/* Hide Prices */}
            <button
              onClick={toggleHidePrices}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors border ${
                hidePrices
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
                  : 'border-white/20 hover:bg-white/10 text-white/70 hover:text-white'
              }`}
              title={hidePrices ? 'Prices hidden — click to show' : 'Hide all prices'}
            >
              {hidePrices ? <EyeOff size={12} /> : <Eye size={12} />}
              <span className="hidden sm:inline">{hidePrices ? 'Prices Hidden' : 'Hide Prices'}</span>
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                showConfirmReset ? 'bg-red-500 hover:bg-red-600 text-white' : 'hover:bg-white/10 text-white/60 hover:text-white'
              }`}
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">{showConfirmReset ? 'Confirm Reset?' : 'Reset'}</span>
            </button>

            <div className="w-px h-4 bg-white/20 mx-1" />

            {/* Logout */}
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
