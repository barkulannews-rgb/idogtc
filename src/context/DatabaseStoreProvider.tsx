import React, { useEffect, useRef, useState } from 'react';
import { DEFAULT_STATE, StoreContext, StoreContextType } from './StoreContext';
import { api, reportApiError, session } from '../utils/api';
import { useStoredState } from '../utils/storage';
import { MediaItem, OrderInquiry } from '../types/store';

type StoreState = typeof DEFAULT_STATE;
type Snapshot = { state: StoreState; revision: number };

export function DatabaseStoreProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const current = useRef<Snapshot | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const [orders, setOrders] = useState<OrderInquiry[]>([]);
  const [error, setError] = useState('');
  const [language, setLanguage] = useStoredState<'en' | 'so'>('idogtc_lang', 'en', v => v === 'en' || v === 'so');

  useEffect(() => {
    let active = true;
    api<Snapshot>('store').then(value => {
      if (active) { current.current = value; setSnapshot(value); }
    }).catch(error => { if (active) setError(error.message); });
    const loadOrders = () => {
      session(true).then(value => value.authenticated ? api<{ orders: OrderInquiry[] }>('orders') : { orders: [] })
        .then(value => { if (active) setOrders(value.orders); }).catch(reportApiError);
    };
    loadOrders();
    window.addEventListener('idogtc-auth-change', loadOrders);
    return () => { active = false; window.removeEventListener('idogtc-auth-change', loadOrders); };
  }, []);

  // Serialize writes from this tab. The server rejects stale revisions from other tabs.
  function change(edit: (state: StoreState) => void): Promise<void> {
    const operation = queue.current.then(async () => {
      if (!current.current) throw new Error('Store data is still loading.');
      const state: StoreState = structuredClone(current.current.state);
      edit(state);
      const saved = await api<Snapshot>('store', 'PUT', { state, revision: current.current.revision });
      current.current = saved;
      setSnapshot(saved);
    });
    queue.current = operation.catch(() => undefined);
    return operation;
  }

  if (!snapshot) return <div role="status" className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-6 text-center">
    {error ? <div><p>{error}</p><button onClick={() => window.location.reload()} className="mt-4 underline">Isku day mar kale / Retry</button></div> : 'Xogta waa la soo rarayaa / Loading…'}
  </div>;

  const value: StoreContextType = {
    ...snapshot.state, orders, language, setLanguage,
    addProduct: product => change(s => { s.products.unshift({ ...product, id: Math.max(0, ...s.products.map(p => p.id)) + 1 }); }),
    updateProduct: (id, fields) => change(s => { s.products = s.products.map(p => p.id === id ? { ...p, ...fields, id } : p); }),
    deleteProduct: id => change(s => { s.products = s.products.filter(p => p.id !== id); }),
    updateSlide: (index, fields) => change(s => { s.slides[index] = { ...s.slides[index], ...fields }; }),
    addCategory: category => change(s => { s.categories.push(category); }),
    updateCategory: (index, fields) => change(s => {
      const oldName = s.categories[index].name;
      s.categories[index] = { ...s.categories[index], ...fields };
      s.products = s.products.map(p => p.category === oldName ? { ...p, category: s.categories[index].name } : p);
    }),
    deleteCategory: index => change(s => {
      if (s.products.some(p => p.category === s.categories[index].name)) throw new Error('Move products before deleting their category.');
      s.categories.splice(index, 1);
    }),
    updateCompanySettings: fields => change(s => { s.companySettings = { ...s.companySettings, ...fields }; }),
    recordOrder: async order => {
      const items = order.items.map(item => {
        const product = current.current!.state.products.find(p => p.name === item.productName);
        if (!product) throw new Error('A product is no longer available. Please refresh.');
        return { productId: product.id, quantity: item.quantity };
      });
      const result = await api<{ order: OrderInquiry }>('orders', 'POST', { items, revision: current.current!.revision, requestId: crypto.randomUUID() });
      setOrders(previous => [result.order, ...previous]);
    },
    updateOrderStatus: async (id, status) => {
      const result = await api<{ orders: OrderInquiry[] }>('orders', 'PATCH', { id, status });
      setOrders(result.orders);
    },
    addMediaItem: async (title, url, category = 'Uploaded') => {
      const media: MediaItem = { id: crypto.randomUUID(), title, url, category, date: new Date().toISOString().slice(0, 10), isSystem: false };
      await change(s => { s.mediaItems.unshift(media); });
      return current.current!.state.mediaItems.find(item => item.id === media.id)!;
    },
    deleteMediaItem: id => change(s => { s.mediaItems = s.mediaItems.filter(item => item.id !== id); }),
    updatePromoBanner: (id, fields) => change(s => { s.promoBanners = s.promoBanners.map(p => p.id === id ? { ...p, ...fields, id } : p); }),
    updatePartner: (id, fields) => change(s => { s.partners = s.partners.map(p => p.id === id ? { ...p, ...fields, id } : p); }),
    addPartner: partner => change(s => { s.partners.push({ ...partner, id: crypto.randomUUID() }); }),
    deletePartner: id => change(s => { s.partners = s.partners.filter(p => p.id !== id); }),
    resetToDefaults: () => change(s => Object.assign(s, structuredClone(DEFAULT_STATE))),
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
