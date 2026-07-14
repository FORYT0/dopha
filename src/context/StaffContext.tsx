import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { products as baseProducts } from '../data/products';
import type { Product } from '../data/products';

// ── Credentials ──────────────────────────────────────────────────────────────
const STAFF_USERNAME  = 'admin';
const STAFF_PASSWORD  = 'dopha2025';

// ── localStorage keys ────────────────────────────────────────────────────────
const STORAGE_KEY     = 'dopha_products_v2';
const SESSION_KEY     = 'dopha_staff_session';
const FOOTER_KEY      = 'dopha_footer_v1';
const CONTENT_KEY     = 'dopha_content_v1';
const HIDE_PRICES_KEY = 'dopha_hide_prices';

// ── Types ────────────────────────────────────────────────────────────────────
export interface EditableProduct extends Product { image?: string; }

export interface FooterData {
  description: string; phone: string; email: string;
  address: string; hours: string; copyright: string;
}

export interface SiteContent {
  heroTitle:     string;   // "Powering the Next Generation of"
  heroHighlight: string;   // "Engineers"  (rendered in teal)
  heroSubtitle:  string;
  heroCta1:      string;   // primary button label
  heroCta2:      string;   // secondary button label
  ctaTitle:      string;
  ctaSubtitle:   string;
  whatsapp:      string;   // WhatsApp number / link
}

export const DEFAULT_FOOTER: FooterData = {
  description: 'Your trusted electronics components supplier in Mombasa, Kenya. Serving students, engineering professionals, and makers across East Africa with quality products at student-friendly prices.',
  phone:       '+254 7XX XXX XXX',
  email:       'info@dophaelectronics.co.ke',
  address:     'Mombasa, Kenya',
  hours:       'Mon-Sat: 8AM - 6PM',
  copyright:   '2026 Dopha Electronics. All rights reserved. | Proudly supporting engineering students and makers.',
};

export const DEFAULT_CONTENT: SiteContent = {
  heroTitle:     'Powering the Next Generation of',
  heroHighlight: 'Engineers',
  heroSubtitle:  'Premium electronic components, Arduino kits, sensors, and tools for students and engineering enthusiasts across East Africa. Quality you can trust, prices you can afford.',
  heroCta1:      'Browse Components',
  heroCta2:      'Project Lab',
  ctaTitle:      'Ready to Build Something Amazing?',
  ctaSubtitle:   'Join thousands of students and engineering professionals who trust Dopha Electronics for their projects.',
  whatsapp:      '+254712743428',
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
  toggleHidePrices: () => Promise<void>;
  footerData:       FooterData;
  updateFooterData: (updates: Partial<FooterData>) => void;
  resetFooterData:  () => void;
  siteContent:      SiteContent;
  updateContent:    (updates: Partial<SiteContent>) => void;
  resetContent:     () => void;
  isDirty:          boolean;
  isSaving:         boolean;
  saveAll:          () => Promise<void>;
}

// ── localStorage helpers ─────────────────────────────────────────────────────
function loadProductsLocal(): EditableProduct[] {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    if (r) {
      const saved = JSON.parse(r) as EditableProduct[];
      // Merge saved products with base products so that fields added later
      // (like `image`, `specs`) are always populated from base data if absent.
      return saved.map(savedP => {
        const base = baseProducts.find(b => b.id === savedP.id) as EditableProduct | undefined;
        return base ? { ...base, ...savedP } : savedP;
      });
    }
  } catch {}
  return baseProducts as EditableProduct[];
}
function loadFooterLocal(): FooterData {
  try { const r = localStorage.getItem(FOOTER_KEY); if (r) return { ...DEFAULT_FOOTER, ...JSON.parse(r) }; } catch {}
  return DEFAULT_FOOTER;
}
function loadContentLocal(): SiteContent {
  try { const r = localStorage.getItem(CONTENT_KEY); if (r) return { ...DEFAULT_CONTENT, ...JSON.parse(r) }; } catch {}
  return DEFAULT_CONTENT;
}

// ── Blob API helpers ─────────────────────────────────────────────────────────
interface BlobData {
  products?: EditableProduct[];
  footer?:   FooterData;
  content?:  SiteContent;
}

async function blobGet(): Promise<BlobData | null> {
  try {
    const r = await fetch('/api/data');
    if (!r.ok) return null;
    const { data } = await r.json() as { data: BlobData | null };
    return data;
  } catch { return null; }
}

async function blobSave(payload: BlobData & { password: string }): Promise<boolean> {
  try {
    const r = await fetch('/api/data', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    return r.ok;
  } catch { return false; }
}

// ── Context ───────────────────────────────────────────────────────────────────
const StaffContext = createContext<StaffContextType | undefined>(undefined);

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [isStaff,     setIsStaff]     = useState(() => localStorage.getItem(SESSION_KEY) === 'true');
  const [products,    setProducts]    = useState<EditableProduct[]>(loadProductsLocal);
  const [footerData,  setFooterData]  = useState<FooterData>(loadFooterLocal);
  const [siteContent, setSiteContent] = useState<SiteContent>(loadContentLocal);
  // Seed from localStorage so the UI doesn't flash on first render;
  // the Firestore onSnapshot below overwrites it immediately.
  const [hidePrices,  setHidePrices]  = useState(() => localStorage.getItem(HIDE_PRICES_KEY) === 'true');
  const [isDirty,     setIsDirty]     = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);

  // Refs — always hold latest values, avoids stale closures in callbacks
  const productsRef = useRef<EditableProduct[]>(products);
  const footerRef   = useRef<FooterData>(footerData);
  const contentRef  = useRef<SiteContent>(siteContent);

  useEffect(() => { productsRef.current = products;    }, [products]);
  useEffect(() => { footerRef.current   = footerData;  }, [footerData]);
  useEffect(() => { contentRef.current  = siteContent; }, [siteContent]);

  // ── hidePrices — live sync via Firestore so all browsers/devices stay in sync ──
  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'store');
    // Read once first (handles cold start where doc may not exist yet)
    getDoc(settingsRef).then(snap => {
      if (snap.exists()) {
        const hp = Boolean(snap.data().hidePrices);
        setHidePrices(hp);
        try { localStorage.setItem(HIDE_PRICES_KEY, String(hp)); } catch {}
      }
    }).catch(() => {});

    // Subscribe to real-time changes so every tab/device/browser stays in sync
    const unsub = onSnapshot(settingsRef, snap => {
      if (!snap.exists()) return;
      const hp = Boolean(snap.data().hidePrices);
      setHidePrices(hp);
      try { localStorage.setItem(HIDE_PRICES_KEY, String(hp)); } catch {}
    }, () => {}); // ignore permission errors silently

    return () => unsub();
  }, []);

  // ── On mount: pull published data from Blob, merge over localStorage ──────
  useEffect(() => {
    blobGet().then(remote => {
      if (!remote) return;
      if (remote.products) {
        // Blob stores overrides — apply onto baseProducts (source of truth for catalog).
        // This removes junk/test entries and ensures all 140 products always appear.
        // image always taken from baseProducts so new deploys show updated photos.
        const overrideMap = new Map(remote.products.map(p => [p.id, p]));
        const merged: EditableProduct[] = (baseProducts as EditableProduct[]).map(base => {
          const override = overrideMap.get(base.id);
          return override ? { ...base, ...override, image: base.image } : { ...base };
        });
        const s = JSON.stringify(merged);
        productsRef.current = merged;
        setProducts(merged);
        try { localStorage.setItem(STORAGE_KEY, s); } catch {}
      }
      if (remote.footer) {
        const merged = { ...DEFAULT_FOOTER, ...remote.footer };
        footerRef.current = merged;
        setFooterData(merged);
        try { localStorage.setItem(FOOTER_KEY, JSON.stringify(merged)); } catch {}
      }
      if (remote.content) {
        const merged = { ...DEFAULT_CONTENT, ...remote.content };
        contentRef.current = merged;
        setSiteContent(merged);
        try { localStorage.setItem(CONTENT_KEY, JSON.stringify(merged)); } catch {}
      }
      setIsDirty(false);
    });
  }, []);

  // ── Local-only commit helpers (localStorage + isDirty, no Blob) ──────────
  const commitProducts = useCallback((next: EditableProduct[]) => {
    productsRef.current = next;
    setProducts(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    setIsDirty(true);
  }, []);

  const commitFooter = useCallback((next: FooterData) => {
    footerRef.current = next;
    setFooterData(next);
    try { localStorage.setItem(FOOTER_KEY, JSON.stringify(next)); } catch {}
    setIsDirty(true);
  }, []);

  const commitContent = useCallback((next: SiteContent) => {
    contentRef.current = next;
    setSiteContent(next);
    try { localStorage.setItem(CONTENT_KEY, JSON.stringify(next)); } catch {}
    setIsDirty(true);
  }, []);

  // ── Global save → Blob ────────────────────────────────────────────────────
  const saveAll = useCallback(async () => {
    setIsSaving(true);
    const ok = await blobSave({
      password: STAFF_PASSWORD,
      products: productsRef.current,
      footer:   footerRef.current,
      content:  contentRef.current,
    });
    setIsSaving(false);
    if (ok) setIsDirty(false);
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

  // ── Product CRUD ──────────────────────────────────────────────────────────
  const updateProduct = useCallback((id: number, updates: Partial<EditableProduct>) => {
    commitProducts(productsRef.current.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [commitProducts]);

  const addProduct = useCallback((product: Omit<EditableProduct, 'id'>) => {
    const cur = productsRef.current;
    const maxId = cur.length > 0 ? Math.max(...cur.map(p => p.id)) : 0;
    commitProducts([{ ...product, id: maxId + 1 }, ...cur]);
  }, [commitProducts]);

  const deleteProduct = useCallback((id: number) => {
    commitProducts(productsRef.current.filter(p => p.id !== id));
  }, [commitProducts]);

  const resetProducts = useCallback(() => {
    commitProducts(baseProducts as EditableProduct[]);
  }, [commitProducts]);

  // ── Hide Prices — write to Firestore; onSnapshot propagates everywhere ──────
  const toggleHidePrices = useCallback(async () => {
    const next = !hidePrices;
    // Optimistic local update for snappiness
    setHidePrices(next);
    try { localStorage.setItem(HIDE_PRICES_KEY, String(next)); } catch {}
    // Await Firestore so the caller can show a "Saved!" confirmation
    await setDoc(doc(db, 'settings', 'store'), { hidePrices: next }, { merge: true });
  }, [hidePrices]);

  // ── Footer ────────────────────────────────────────────────────────────────
  const updateFooterData = useCallback((updates: Partial<FooterData>) => {
    commitFooter({ ...footerRef.current, ...updates });
  }, [commitFooter]);

  const resetFooterData = useCallback(() => {
    commitFooter(DEFAULT_FOOTER);
  }, [commitFooter]);

  // ── Site content ──────────────────────────────────────────────────────────
  const updateContent = useCallback((updates: Partial<SiteContent>) => {
    commitContent({ ...contentRef.current, ...updates });
  }, [commitContent]);

  const resetContent = useCallback(() => {
    commitContent(DEFAULT_CONTENT);
  }, [commitContent]);

  return (
    <StaffContext.Provider value={{
      isStaff, login, logout,
      products, updateProduct, addProduct, deleteProduct, resetProducts,
      hidePrices, toggleHidePrices,
      footerData, updateFooterData, resetFooterData,
      siteContent, updateContent, resetContent,
      isDirty, isSaving, saveAll,
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
