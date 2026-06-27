import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { products as baseProducts } from '../data/products';
import type { Product } from '../data/products';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { doc, setDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';

// ── Credentials ──────────────────────────────────────────────────────────────
const STAFF_USERNAME  = 'admin';
const STAFF_PASSWORD  = 'dopha2025';

// ── localStorage keys ────────────────────────────────────────────────────────
const STORAGE_KEY     = 'dopha_products_v1';
const SESSION_KEY     = 'dopha_staff_session';
const FOOTER_KEY      = 'dopha_footer_v1';
const HIDE_PRICES_KEY = 'dopha_hide_prices';

// ── Types ────────────────────────────────────────────────────────────────────
export interface EditableProduct extends Product {
  image?: string;
}

export interface FooterData {
  description: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  copyright: string;
}

export const DEFAULT_FOOTER: FooterData = {
  description: 'Your trusted electronics components supplier in Mombasa, Kenya. Serving TUM students, engineering professionals, and makers across East Africa with quality products at student-friendly prices.',
  phone:       '+254 7XX XXX XXX',
  email:       'info@dophaelectronics.co.ke',
  address:     'Mombasa, Kenya',
  hours:       'Mon-Sat: 8AM - 6PM',
  copyright:   '2026 Dopha Electronics. All rights reserved. | Proudly supporting TUM engineering students.',
};

interface StaffContextType {
  isStaff:          boolean;
  login:            (username: string, password: string) => boolean;
  logout:           () => void;
  products:         EditableProduct[];
  updateProduct:    (id: number, updates: Partial<EditableProduct>) => void;
  addProduct:       (product: Omit<EditableProduct, 'id'>) => void;
  deleteProduct:    (id: number) => void;
  resetProducts:    () => void;
  hidePrices:       boolean;
  toggleHidePrices: () => void;
  footerData:       FooterData;
  updateFooterData: (updates: Partial<FooterData>) => void;
  resetFooterData:  () => void;
}

// ── localStorage helpers ─────────────────────────────────────────────────────
function loadProductsLocal(): EditableProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as EditableProduct[];
  } catch {}
  return baseProducts as EditableProduct[];
}

function loadFooterLocal(): FooterData {
  try {
    const raw = localStorage.getItem(FOOTER_KEY);
    if (raw) return { ...DEFAULT_FOOTER, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_FOOTER;
}

// ── Context ───────────────────────────────────────────────────────────────────
const StaffContext = createContext<StaffContextType | undefined>(undefined);

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [isStaff,    setIsStaff]    = useState(() => localStorage.getItem(SESSION_KEY) === 'true');
  const [products,   setProducts]   = useState<EditableProduct[]>(loadProductsLocal);
  const [footerData, setFooterData] = useState<FooterData>(loadFooterLocal);
  const [hidePrices, setHidePrices] = useState(() => localStorage.getItem(HIDE_PRICES_KEY) === 'true');

  // Refs that always hold the latest values — avoids stale closures in callbacks
  const productsRef  = useRef<EditableProduct[]>(products);
  const footerRef    = useRef<FooterData>(footerData);

  // How many writes are currently in-flight to Firestore
  // onSnapshot updates are ignored while this is > 0
  const pendingWrites = useRef(0);

  const unsubCatalog = useRef<Unsubscribe | null>(null);
  const unsubFooter  = useRef<Unsubscribe | null>(null);

  // Keep refs in sync with state
  useEffect(() => { productsRef.current  = products;   }, [products]);
  useEffect(() => { footerRef.current    = footerData; }, [footerData]);

  // ── Stable write helpers ──────────────────────────────────────────────────
  // These are the ONLY place we call setProducts / setFooterData and touch Firestore.
  // Always read from refs so they're never stale.

  const commitProducts = useCallback((next: EditableProduct[]) => {
    productsRef.current = next;
    setProducts(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}

    if (isFirebaseConfigured && db) {
      pendingWrites.current += 1;
      setDoc(doc(db, 'dopha', 'catalog'), { products: next })
        .catch(err => console.error('Firestore products write failed:', err))
        .finally(() => {
          // Give the echo onSnapshot time to arrive before we start listening again
          setTimeout(() => { pendingWrites.current = Math.max(0, pendingWrites.current - 1); }, 3000);
        });
    }
  }, []);

  const commitFooter = useCallback((next: FooterData) => {
    footerRef.current = next;
    setFooterData(next);
    try { localStorage.setItem(FOOTER_KEY, JSON.stringify(next)); } catch {}

    if (isFirebaseConfigured && db) {
      pendingWrites.current += 1;
      setDoc(doc(db, 'dopha', 'footer'), next)
        .catch(err => console.error('Firestore footer write failed:', err))
        .finally(() => {
          setTimeout(() => { pendingWrites.current = Math.max(0, pendingWrites.current - 1); }, 3000);
        });
    }
  }, []);

  // ── Firebase real-time listeners (other-device updates) ──────────────────
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const catalogRef = doc(db, 'dopha', 'catalog');
    unsubCatalog.current = onSnapshot(catalogRef, async snap => {
      // Skip if we have in-flight writes (this snapshot is our own echo)
      if (pendingWrites.current > 0) return;

      if (!snap.exists()) {
        // No Firestore doc yet — seed with current state (preserves localStorage edits)
        pendingWrites.current += 1;
        await setDoc(catalogRef, { products: productsRef.current })
          .catch(console.error)
          .finally(() => setTimeout(() => { pendingWrites.current = Math.max(0, pendingWrites.current - 1); }, 3000));
        return;
      }

      // Another device wrote — accept only if newer than what we have locally.
      // We compare by stringifying; if identical, skip the re-render.
      const incoming = snap.data().products as EditableProduct[];
      const currentJSON = JSON.stringify(productsRef.current);
      const incomingJSON = JSON.stringify(incoming);
      if (incomingJSON === currentJSON) return;

      productsRef.current = incoming;
      setProducts(incoming);
      try { localStorage.setItem(STORAGE_KEY, incomingJSON); } catch {}
    });

    const footerDocRef = doc(db, 'dopha', 'footer');
    unsubFooter.current = onSnapshot(footerDocRef, snap => {
      if (pendingWrites.current > 0 || !snap.exists()) return;
      const data = { ...DEFAULT_FOOTER, ...(snap.data() as FooterData) };
      footerRef.current = data;
      setFooterData(data);
      try { localStorage.setItem(FOOTER_KEY, JSON.stringify(data)); } catch {}
    });

    return () => {
      unsubCatalog.current?.();
      unsubFooter.current?.();
    };
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = useCallback((username: string, password: string): boolean => {
    if (username.trim().toLowerCase() === STAFF_USERNAME && password.trim() === STAFF_PASSWORD) {
      setIsStaff(true);
      localStorage.setItem(SESSION_KEY, 'true');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsStaff(false);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  // ── Product CRUD — read from ref, never from stale closure ────────────────
  const updateProduct = useCallback((id: number, updates: Partial<EditableProduct>) => {
    const next = productsRef.current.map(p => p.id === id ? { ...p, ...updates } : p);
    commitProducts(next);
  }, [commitProducts]);

  const addProduct = useCallback((product: Omit<EditableProduct, 'id'>) => {
    const current = productsRef.current;
    const maxId = current.length > 0 ? Math.max(...current.map(p => p.id)) : 0;
    // Prepend so the new product appears first (home page shows slice(0,12))
    commitProducts([{ ...product, id: maxId + 1 }, ...current]);
  }, [commitProducts]);

  const deleteProduct = useCallback((id: number) => {
    commitProducts(productsRef.current.filter(p => p.id !== id));
  }, [commitProducts]);

  const resetProducts = useCallback(() => {
    commitProducts(baseProducts as EditableProduct[]);
  }, [commitProducts]);

  // ── Hide Prices ───────────────────────────────────────────────────────────
  const toggleHidePrices = useCallback(() => {
    setHidePrices(prev => {
      const next = !prev;
      localStorage.setItem(HIDE_PRICES_KEY, String(next));
      return next;
    });
  }, []);

  // ── Footer ────────────────────────────────────────────────────────────────
  const updateFooterData = useCallback((updates: Partial<FooterData>) => {
    commitFooter({ ...footerRef.current, ...updates });
  }, [commitFooter]);

  const resetFooterData = useCallback(() => {
    commitFooter(DEFAULT_FOOTER);
  }, [commitFooter]);

  return (
    <StaffContext.Provider value={{
      isStaff, login, logout,
      products, updateProduct, addProduct, deleteProduct, resetProducts,
      hidePrices, toggleHidePrices,
      footerData, updateFooterData, resetFooterData,
    }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error('useStaff must be used within StaffProvider');
  return ctx;
}
