import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CartItem } from './CartContext';

// ── Shared message types (used by widget + staff chat) ───────────────────────
export interface OrderItem {
  id:     number;
  name:   string;
  icon:   string;
  image?: string;
  qty:    number;
  price?: number; // unit price, set by staff when quoting
}

export interface FirestoreMessage {
  id:                 string;
  text:               string;
  from:               'user' | 'staff';
  time:               string;
  type?:              'text' | 'order' | 'quote' | 'payment';
  order?:             OrderItem[];
  orderRef?:          string;
  total?:             number;   // grand total on quote messages
  // ── Payment fields (type === 'payment') ──
  paymentStatus?:     'pending' | 'success' | 'failed';
  checkoutRequestId?: string;
  mpesaRef?:          string;
  amount?:            number;   // payment amount in KSh
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0') && digits.length >= 9) return '254' + digits.slice(1);
  if (digits.length >= 9) return '254' + digits.slice(-9);
  return digits;
}

export function genSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function genMsgId(prefix = 'x'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function genOrderRef(): string {
  return 'ORD-' + Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

// ── Persistence (identity only — messages stay in FloatingWhatsApp) ───────────
const IDENTITY_KEY = 'dopha_chat_v2';

export interface StoredIdentity {
  sessionId:     string;
  customerName:  string;
  customerPhone: string;
}

export function loadIdentity(): StoredIdentity {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<StoredIdentity & { messages: unknown[] }>;
      if (p.sessionId) return {
        sessionId:     p.sessionId,
        customerName:  p.customerName  ?? '',
        customerPhone: p.customerPhone ?? '',
      };
    }
  } catch {}
  return { sessionId: genSessionId(), customerName: '', customerPhone: '' };
}

export function saveIdentity(data: StoredIdentity) {
  try {
    const raw     = localStorage.getItem(IDENTITY_KEY);
    const current = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    localStorage.setItem(IDENTITY_KEY, JSON.stringify({ ...current, ...data }));
  } catch {}
}

// ── Context ───────────────────────────────────────────────────────────────────
interface ChatContextType {
  sessionId:     string;
  customerName:  string;
  customerPhone: string;
  hasIdentity:   boolean;
  identify:      (name: string, phone: string) => void;
  isOpen:        boolean;
  setIsOpen:     React.Dispatch<React.SetStateAction<boolean>>;
  /** Write an order message to Firestore and open the chat. Returns orderRef. */
  sendOrder:     (items: CartItem[]) => Promise<string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const initial = useRef(loadIdentity());

  const [sessionId,     setSessionId]     = useState(initial.current.sessionId);
  const [customerName,  setCustomerName]  = useState(initial.current.customerName);
  const [customerPhone, setCustomerPhone] = useState(initial.current.customerPhone);
  const [isOpen,        setIsOpen]        = useState(false);

  const hasIdentity = customerName.length > 0;

  const identify = useCallback((name: string, phone: string) => {
    const norm = normalizePhone(phone);
    const sid  = norm ? `ph-${norm}` : genSessionId();
    setCustomerName(name);
    setCustomerPhone(norm);
    setSessionId(sid);
    saveIdentity({ sessionId: sid, customerName: name, customerPhone: norm });
  }, []);

  const sendOrder = useCallback(async (items: CartItem[]): Promise<string> => {
    const orderRef = genOrderRef();
    const msgId    = genMsgId('order');
    const now      = new Date().toISOString();

    const orderItems: OrderItem[] = items.map(c => ({
      id:    c.id,
      name:  c.name,
      icon:  c.icon,
      image: c.image,
      qty:   c.qty,
    }));

    const msg: FirestoreMessage = {
      id:       msgId,
      text:     `🛒 Order ${orderRef} — ${items.length} item${items.length !== 1 ? 's' : ''}`,
      from:     'user',
      time:     now,
      type:     'order',
      order:    orderItems,
      orderRef,
    };

    const docRef = doc(db, 'chats', sessionId);
    try {
      await updateDoc(docRef, {
        messages:      arrayUnion(msg),
        lastActivity:  now,
        unreadByStaff: true,
      });
    } catch {
      // First interaction — create the document
      await setDoc(docRef, {
        sessionId,
        customerName,
        customerPhone: customerPhone || null,
        messages:      [msg],
        createdAt:     now,
        lastActivity:  now,
        unreadByStaff: true,
      });
    }

    setIsOpen(true); // open the chat widget
    return orderRef;
  }, [sessionId, customerName, customerPhone]);

  return (
    <ChatContext.Provider value={{
      sessionId, customerName, customerPhone, hasIdentity,
      identify, isOpen, setIsOpen, sendOrder,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
}
