import { useState, useEffect } from 'react';
import { ShieldCheck, LogOut, Plus, RotateCcw, Save, Check, Loader2, MessageSquare } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStaff } from '../context/StaffContext';
import AddProductModal from './AddProductModal';
import StaffChat from './StaffChat';

export default function StaffBar() {
  const { logout, resetProducts, isDirty, isSaving, saveAll } = useStaff();
  const [showAdd,            setShowAdd]            = useState(false);
  const [showConfirmReset,   setShowConfirmReset]   = useState(false);
  const [justSaved,          setJustSaved]          = useState(false);
  const [showChat,           setShowChat]           = useState(false);
  const [chatUnread,         setChatUnread]         = useState(0);

  // Real-time unread count from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'chats'), (snap) => {
      const unread = snap.docs.filter(d => (d.data() as { unreadByStaff?: boolean }).unreadByStaff).length;
      setChatUnread(unread);
    });
    return () => unsub();
  }, []);

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
            {/* Live Chats */}
            <button
              onClick={() => setShowChat(true)}
              className="relative flex items-center gap-1.5 px-3 py-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-colors"
              title="Live customer chats"
            >
              <MessageSquare size={12} />
              <span className="hidden sm:inline">Chats</span>
              {chatUnread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                  {chatUnread}
                </span>
              )}
            </button>

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

      {showChat && (
        <StaffChat
          onClose={() => setShowChat(false)}
          initialUnread={chatUnread}
          onUnreadChange={setChatUnread}
        />
      )}
    </>
  );
}
