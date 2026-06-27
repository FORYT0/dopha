import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { products as baseProducts } from '../data/products';
import type { Product } from '../data/products';

// ── Credentials (change as needed) ─────────────────────────────────────────
const STAFF_USERNAME = 'admin';
const STAFF_PASSWORD = 'dopha@staff';
const STORAGE_KEY = 'dopha_products_v1';
const SESSION_KEY = 'dopha_staff_session';

// ── Extended Product type (adds optional image) ─────────────────────────────
export interface EditableProduct extends Product {
  image?: string; // base64 data URL for uploaded photos
}

// ── Context shape ───────────────────────────────────────────────────────────
interface StaffContextType {
  isStaff: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  products: EditableProduct[];
  updateProduct: (id: number, updates: Partial<EditableProduct>) => void;
  addProduct: (product: Omit<EditableProduct, 'id'>) => void;
  deleteProduct: (id: number) => void;
  resetProducts: () => void;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

// ── Load/save helpers ───────────────────────────────────────────────────────
function loadProducts(): EditableProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as EditableProduct[];
  } catch {}
  return baseProducts as EditableProduct[];
}

function saveProducts(products: EditableProduct[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('Could not save products to localStorage', e);
  }
}

// ── Provider ────────────────────────────────────────────────────────────────
export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [isStaff, setIsStaff] = useState(() => {
    return localStorage.getItem(SESSION_KEY) === 'true';
  });
  const [products, setProducts] = useState<EditableProduct[]>(loadProducts);

  // Persist products whenever they change
  useEffect(() => {
    saveProducts(products);
  }, [products]);

  const login = useCallback((username: string, password: string): boolean => {
    if (username === STAFF_USERNAME && password === STAFF_PASSWORD) {
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

  const updateProduct = useCallback((id: number, updates: Partial<EditableProduct>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const addProduct = useCallback((product: Omit<EditableProduct, 'id'>) => {
    setProducts(prev => {
      const maxId = Math.max(0, ...prev.map(p => p.id));
      return [...prev, { ...product, id: maxId + 1 }];
    });
  }, []);

  const deleteProduct = useCallback((id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const resetProducts = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProducts(baseProducts as EditableProduct[]);
  }, []);

  return (
    <StaffContext.Provider value={{
      isStaff, login, logout,
      products, updateProduct, addProduct, deleteProduct, resetProducts,
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
