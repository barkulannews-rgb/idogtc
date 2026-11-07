import React, { createContext, useContext } from 'react';
import { useStoredState } from '../utils/storage';
import { Product, SlideItem, CategoryItem, CompanySettings, OrderInquiry, MediaItem, PromoBannerItem, PartnerItem } from '../types/store';

import { DEFAULT_STATE } from '../data/storeDefaults';
export { DEFAULT_STATE } from '../data/storeDefaults';
const { products: DEFAULT_PRODUCTS, slides: DEFAULT_SLIDES, categories: DEFAULT_CATEGORIES, companySettings: DEFAULT_SETTINGS, mediaItems: DEFAULT_MEDIA_ITEMS, promoBanners: DEFAULT_PROMO_BANNERS, partners: DEFAULT_PARTNERS } = DEFAULT_STATE;

export interface StoreContextType {
  products: Product[];
  slides: SlideItem[];
  categories: CategoryItem[];
  companySettings: CompanySettings;
  orders: OrderInquiry[];
  mediaItems: MediaItem[];
  promoBanners: PromoBannerItem[];
  partners: PartnerItem[];
  language: 'en' | 'so';
  setLanguage: (lang: 'en' | 'so') => void | Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => void | Promise<void>;
  updateProduct: (id: number, product: Partial<Product>) => void | Promise<void>;
  deleteProduct: (id: number) => void | Promise<void>;
  updateSlide: (index: number, slide: Partial<SlideItem>) => void | Promise<void>;
  addCategory: (category: CategoryItem) => void | Promise<void>;
  updateCategory: (index: number, category: Partial<CategoryItem>) => void | Promise<void>;
  deleteCategory: (index: number) => void | Promise<void>;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void | Promise<void>;
  recordOrder: (order: Omit<OrderInquiry, 'id' | 'date'>) => void | Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderInquiry['status']) => void | Promise<void>;
  addMediaItem: (title: string, url: string, category?: string) => MediaItem | Promise<MediaItem>;
  deleteMediaItem: (id: string) => void | Promise<void>;
  updatePromoBanner: (id: string, banner: Partial<PromoBannerItem>) => void | Promise<void>;
  updatePartner: (id: string, partner: Partial<PartnerItem>) => void | Promise<void>;
  addPartner: (partner: Omit<PartnerItem, 'id'>) => void | Promise<void>;
  deletePartner: (id: string) => void | Promise<void>;
  resetToDefaults: () => void | Promise<void>;
}


function hasStrings(value: unknown, fields: string[]): boolean {
  return value !== null && typeof value === 'object' && fields.every(key => typeof (value as Record<string, unknown>)[key] === 'string');
}
const isValidProduct = (v: any): boolean => hasStrings(v, ['name', 'category', 'price', 'oldPrice', 'image', 'origin', 'specs']) && Number.isFinite(v.id) && Number.isFinite(v.numericPrice) && v.numericPrice >= 0 && Number.isFinite(v.rating) && Number.isFinite(v.reviews);
const isValidSlideItem = (v: unknown): boolean => hasStrings(v, ['title', 'subtitle', 'badge', 'desc', 'image', 'offer']);
const isValidCategoryItem = (v: unknown): boolean => hasStrings(v, ['name', 'count', 'id', 'img']);
const isValidMediaItem = (v: unknown): boolean => hasStrings(v, ['id', 'title', 'url', 'date']);
const isValidPromoBannerItem = (v: unknown): boolean => hasStrings(v, ['id', 'title', 'badge', 'description', 'image', 'buttonText', 'buttonLink']);
const isValidPartnerItem = (v: unknown): boolean => hasStrings(v, ['id', 'name', 'tag']);
const isValidOrderInquiry = (v: any): boolean => hasStrings(v, ['id', 'date', 'status']) && ['New', 'Contacted', 'Fulfilled'].includes(v.status) && Number.isFinite(v.totalAmount) && Array.isArray(v.items) && v.items.every((item: any) => hasStrings(item, ['productName', 'price']) && Number.isInteger(item.quantity) && item.quantity > 0);


export const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useStoredState<Product[]>('idogtc_products', DEFAULT_PRODUCTS, (v) => Array.isArray(v) && v.every(isValidProduct));
  const [slides, setSlides] = useStoredState<SlideItem[]>('idogtc_slides', DEFAULT_SLIDES, (v) => Array.isArray(v) && v.every(isValidSlideItem));
  const [categories, setCategories] = useStoredState<CategoryItem[]>('idogtc_categories', DEFAULT_CATEGORIES, (v) => Array.isArray(v) && v.every(isValidCategoryItem));
  const [companySettings, setCompanySettings] = useStoredState<CompanySettings>('idogtc_settings', DEFAULT_SETTINGS, (v) => v !== null && typeof v === 'object' && Object.keys(DEFAULT_SETTINGS).every(key => typeof (v as Record<string, unknown>)[key] === 'string'));
  const [orders, setOrders] = useStoredState<OrderInquiry[]>('idogtc_orders', [], (v) => Array.isArray(v) && v.every(isValidOrderInquiry));
  const [mediaItems, setMediaItems] = useStoredState<MediaItem[]>('idogtc_media', DEFAULT_MEDIA_ITEMS, (v) => Array.isArray(v) && v.every(isValidMediaItem));

  const [language, setLanguage] = useStoredState<'en' | 'so'>('idogtc_lang', 'en', v => v === 'en' || v === 'so');

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = {
      id: nextId,
      ...productData
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: number, updatedFields: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateSlide = (index: number, slideFields: Partial<SlideItem>) => {
    setSlides(prev => prev.map((s, idx) => idx === index ? { ...s, ...slideFields } : s));
  };

  const addCategory = (cat: CategoryItem) => {
    setCategories(prev => [...prev, cat]);
  };

  const updateCategory = (index: number, catFields: Partial<CategoryItem>) => {
    const previousName = categories[index]?.name;
    if (previousName && catFields.name && catFields.name !== previousName) {
      setProducts(prev => prev.map(p => p.category === previousName ? { ...p, category: catFields.name! } : p));
    }
    setCategories(prev => prev.map((c, idx) => idx === index ? { ...c, ...catFields } : c));
  };

  const deleteCategory = (index: number) => {
    setCategories(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateCompanySettings = (settingsFields: Partial<CompanySettings>) => {
    setCompanySettings(prev => ({ ...prev, ...settingsFields }));
  };

  const recordOrder = (orderData: Omit<OrderInquiry, 'id' | 'date'>) => {
    const newOrder: OrderInquiry = {
      id: `ORD-${crypto.randomUUID()}`,
      date: new Date().toLocaleDateString(),
      ...orderData
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: OrderInquiry['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const addMediaItem = (title: string, url: string, category = 'Uploaded') => {
    const newItem: MediaItem = {
      id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      url,
      category,
      date: new Date().toISOString().split('T')[0],
      isSystem: false
    };
    setMediaItems(prev => [newItem, ...prev]);
    return newItem;
  };

  const deleteMediaItem = (id: string) => {
    setMediaItems(prev => prev.filter(m => m.id !== id));
  };

  const [promoBanners, setPromoBanners] = useStoredState<PromoBannerItem[]>('idogtc_promos', DEFAULT_PROMO_BANNERS, v => Array.isArray(v) && v.every(isValidPromoBannerItem));
  const [partners, setPartners] = useStoredState<PartnerItem[]>('idogtc_partners', DEFAULT_PARTNERS, v => Array.isArray(v) && v.every(isValidPartnerItem));

  const updatePromoBanner = (id: string, updatedFields: Partial<PromoBannerItem>) => {
    setPromoBanners(prev => prev.map(pb => pb.id === id ? { ...pb, ...updatedFields } : pb));
  };

  const updatePartner = (id: string, updatedFields: Partial<PartnerItem>) => {
    setPartners(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  const addPartner = (partnerData: Omit<PartnerItem, 'id'>) => {
    const newPartner: PartnerItem = {
      id: `part-${Date.now()}`,
      ...partnerData
    };
    setPartners(prev => [...prev, newPartner]);
  };

  const deletePartner = (id: string) => {
    setPartners(prev => prev.filter(p => p.id !== id));
  };

  const resetToDefaults = () => {
    setProducts(DEFAULT_PRODUCTS);
    setSlides(DEFAULT_SLIDES);
    setCategories(DEFAULT_CATEGORIES);
    setCompanySettings(DEFAULT_SETTINGS);
    setMediaItems(DEFAULT_MEDIA_ITEMS);
    setPromoBanners(DEFAULT_PROMO_BANNERS);
    setPartners(DEFAULT_PARTNERS);
  };

  return (
    <StoreContext.Provider value={{
      products,
      slides,
      categories,
      companySettings,
      orders,
      mediaItems,
      promoBanners,
      partners,
      language,
      setLanguage,
      addProduct,
      updateProduct,
      deleteProduct,
      updateSlide,
      addCategory,
      updateCategory,
      deleteCategory,
      updateCompanySettings,
      recordOrder,
      updateOrderStatus,
      addMediaItem,
      deleteMediaItem,
      updatePromoBanner,
      updatePartner,
      addPartner,
      deletePartner,
      resetToDefaults
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
