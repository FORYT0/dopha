import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { products as baseProducts } from '../data/products';
import type { Product } from '../data/products';

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

// ── KV helpers ───────────────────────────────────────────────────────────────
// On Vercel these hit /api/catalog and /api/footer (same-origin).
// During local `vite dev` the routes don't exist, so errors are silently ignored.

async function kvGetCatalog(): Promise<EditableProduct[] | null> {
  try {
    const r = await fetch('/api/catalog');
    if (!r.ok) return null;
    const { products } = await r.json() as { products: EditableProduct[] | null };
    return products;
  } catch {
    return null;
  }
}

async function kvSaveCatalog(products: EditableProduct[]): Promise<void> {
  try {
    await fetch('/api/catalog', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ password: STAFF_PASSWORD, products }),
    });
  } catch {
    // Network error — data already saved to localStorage, will sync on next load
  }
}

async function kvGetFooter(): Promise<FooterData | null> {
  try {
    const r = await fetch('/api/footer');
    if (!r.ok) return null;
    const { footer } = await r.json() as { footer: FooterData | null };
    return footer;
  } catch {
    return null;
  }
}

async function kvSaveFooter(footer: FooterData): Promise<void> {
  try {
    await fetch('/api/footer', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ password: STAFF_PASSWORD, footer }),
    });
  } catch {}
}

// ── Context ───────────────────────────────────────────────────────────────────
const StaffContext = createContext<StaffContextType | undefined>(undefined);

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [isStaff,    setIsStaff]    = useState(() => localStorage.getItem(SESSION_KEY) === 'true');
  const [products,   setProducts]   = useState<EditableProduct[]>(loadProductsLocal);
  const [footerData, setFooterData] = useState<FooterData>(loadFooterLocal);
  const [hidePrices, setHidePrices] = useState(() => localStorage.getItem(HIDE_PRICES_KEY) === 'true');

  // Refs hold the latest values — avoids stale closures in callbacks
  const productsRef = useRef<EditableProduct[]>(products);
  const footerRef   = useRef<FooterData>(footerData);

  useEffect(() => { productsRef.current = products;   }, [products]);
  useEffect(() => { footerRef.current   = footerData; }, [footerData]);

  // ── On mount: pull latest data from KV, deep-merge over localStorage ─────
  useEffect(() => {
    kvGetCatalog().then(remote => {
      if (!remote) return; // KV not set up or network error — localStorage is fine
      const same = JSON.stringify(remote) === JSON.stringify(productsRef.current);
      if (same) return;
      productsRef.current = remote;
      setProducts(remote);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(remote)); } catch {}
    });

    kvGetFooter().then(remote => {
      if (!remote) return;
      const merged = { ...DEFAULT_FOOTER, ...remote };
      const same = JSON.stringify(merged) === JSON.stringify(footerRef.current);
      if (same) return;
      footerRef.current = merged;
      setFooterData(merged);
      try { localStorage.setItem(FOOTER_KEY, JSON.stringify(merged)); } catch {}
    });
  }, []);

  // ── Stable write helpers ─────────────────────────────────────────────────
  const commitProducts = useCallback((next: EditableProduct[]) => {
    productsRef.current = next;
    setProducts(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    void kvSaveCatalog(next);
  }, []);

  const commitFooter = useCallback((next: FooterData) => {
    footerRef.current = next;
    setFooterData(next);
    try { localStorage.setItem(FOOTER_KEY, JSON.stringify(next)); } catch {}
    void kvSaveFooter(next);
  }, []);

  // ── Auth ─────────────────────────────────────────────────────────────────
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

  // ── Product CRUD ─────────────────────────────────────────────────────────
  const updateProduct = useCallback((id: number, updates: Partial<EditableProduct>) => {
    commitProducts(productsRef.current.map(p => p.id === id ? { ...p, ...updates } : p));
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
