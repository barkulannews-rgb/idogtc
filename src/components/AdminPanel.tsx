import React, { useState, useRef, useEffect } from 'react';
import { 
  Package, LayoutDashboard, Sliders, Layers, Settings, ShoppingBag, 
  Plus, Edit, Trash2, ArrowLeft, Search, Check, X, Shield, Lock, 
  Phone, Mail, Globe, Save, RefreshCw, Eye, User, Folder, Upload, Copy, HardDrive,
  Megaphone, Tag, Ship, Sun, Award, Truck, Anchor
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, SlideItem, CategoryItem, OrderInquiry, PromoBannerItem, PartnerItem } from '../types/store';
import { I18N } from '../data/i18n';
import { readStored, writeStored } from '../utils/storage';
import { api, DATABASE_MODE, reportApiError, session } from '../utils/api';
import { ImagePickerField } from './ImagePickerField';
import { processImageFile } from '../utils/imageUpload';
import { HeaderEditor } from './HeaderEditor';
import { getHeaderSettings } from '../data/headerSettings';

interface AdminPanelProps {
  onBackToStore: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToStore }) => {
  const { 
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
    updateOrderStatus,
    addMediaItem,
    deleteMediaItem,
    updatePromoBanner,
    updatePartner,
    addPartner,
    deletePartner,
    resetToDefaults
  } = useStore();

  const t = I18N[language];

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !DATABASE_MODE && readStored('idogtc_admin_auth', false, v => typeof v === 'boolean');
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (DATABASE_MODE) session().then(value => setIsAuthenticated(value.authenticated)).catch(error => setAuthError(error.message));
  }, []);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'slides' | 'categories' | 'media' | 'promos' | 'partners' | 'settings' | 'orders' | 'header'>('dashboard');

  // Search and filter for products
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Foodstuffs & Commodities',
    price: '$0.00',
    oldPrice: '$0.00',
    numericPrice: 0,
    rating: 5,
    reviews: 50,
    image: '/images/hero_global_shipping_1793690292263.jpg',
    origin: 'Direct Import via Dubai & Bosaso',
    specs: 'Standard Wholesale Packing',
    isFeatured: true
  });

  // Slide modal state
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [slideForm, setSlideForm] = useState<SlideItem>({
    title: '',
    subtitle: '',
    badge: '',
    desc: '',
    image: '',
    offer: ''
  });

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryItem>({
    name: '',
    count: '50 Products',
    id: '',
    img: '/images/hero_global_shipping_1793690292263.jpg'
  });

  // Promo Banner modal state
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoForm, setPromoForm] = useState<PromoBannerItem>({
    id: '',
    badge: '',
    badgeSo: '',
    title: '',
    titleSo: '',
    description: '',
    descriptionSo: '',
    image: '',
    buttonText: 'Learn More',
    buttonTextSo: 'Wax Dheeraad Ah',
    buttonLink: 'about'
  });

  const handleOpenPromoModal = (promo: PromoBannerItem) => {
    setEditingPromoId(promo.id);
    setPromoForm({ ...promo });
    setIsPromoModalOpen(true);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    try {
    e.preventDefault();
    if (editingPromoId) {
      await updatePromoBanner(editingPromoId, promoForm);
      showToast(language === 'en' ? `Updated offer banner "${promoForm.title}"!` : `Waa la cusbooneysiiyay banner-ka "${promoForm.title}"!`);
    }
    setIsPromoModalOpen(false);
    } catch (error) { reportApiError(error); }
  };

  // Partner modal state
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [partnerForm, setPartnerForm] = useState<PartnerItem>({
    id: '',
    name: '',
    tag: '',
    tagSo: '',
    image: '',
    iconType: 'port'
  });

  const handleOpenPartnerModal = (partner?: PartnerItem) => {
    if (partner) {
      setEditingPartnerId(partner.id);
      setPartnerForm({ ...partner });
    } else {
      setEditingPartnerId(null);
      setPartnerForm({
        id: '',
        name: '',
        tag: '',
        tagSo: '',
        image: '',
        iconType: 'port'
      });
    }
    setIsPartnerModalOpen(true);
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    try {
    e.preventDefault();
    if (editingPartnerId) {
      await updatePartner(editingPartnerId, partnerForm);
      showToast(language === 'en' ? `Updated partner badge "${partnerForm.name}"!` : `Waa la cusbooneysiiyay logoga "${partnerForm.name}"!`);
    } else {
      await addPartner(partnerForm);
      showToast(language === 'en' ? `Added new partner "${partnerForm.name}"!` : `Logo cusub ayaa lagu daray "${partnerForm.name}"!`);
    }
    setIsPartnerModalOpen(false);
    } catch (error) { reportApiError(error); }
  };

  const handleDeletePartner = async (id: string, name: string) => {
    try {
    if (window.confirm(language === 'en' ? `Delete partner badge "${name}"?` : `Ma hubtaa inaad tirto logoga "${name}"?`)) {
      await deletePartner(id);
      showToast(language === 'en' ? `Deleted "${name}"` : `Waa la tiray "${name}"`);
    }
    } catch (error) { reportApiError(error); }
  };

  // Company settings form
  const [settingsForm, setSettingsForm] = useState(companySettings);
  useEffect(() => { if (activeTab === 'settings') setSettingsForm(companySettings); }, [activeTab]);

  // Toast feedback
  const [adminToast, setAdminToast] = useState('');
  const showToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(''), 3000);
  };

  const directMediaInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const handleDirectMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingMedia(true);
      const { dataUrl, name } = await processImageFile(file);
      await addMediaItem(name, dataUrl, 'Custom Upload');
      showToast(t.imageUploadedSuccess);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      alert(errorMsg);
    } finally {
      setIsUploadingMedia(false);
      if (directMediaInputRef.current) {
        directMediaInputRef.current.value = '';
      }
    }
    } catch (error) { reportApiError(error); }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(language === 'en' ? `Copied ${label} to clipboard!` : `Waa la koobiyay ${label}!`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (DATABASE_MODE) {
      try {
        await api('login', 'POST', { username: usernameInput, password: passwordInput });
        setIsAuthenticated(true); setPasswordInput(''); setAuthError('');
        window.dispatchEvent(new Event('idogtc-auth-change'));
      } catch (error) { setAuthError(error instanceof Error ? error.message : 'Login failed'); }
      return;
    }
    const validUsers = ['admin', 'idogtc', 'ido', 'admin@idogtc.com'];
    const validPasswords = ['admin123', 'ido2003', 'admin'];

    const userTrim = usernameInput.trim().toLowerCase();
    const isUserValid = validUsers.includes(userTrim);
    const isPassValid = validPasswords.includes(passwordInput);

    if (isUserValid && isPassValid) {
      setIsAuthenticated(true);
      writeStored('idogtc_admin_auth', true);
      setAuthError('');
    } else {
      setAuthError(
        language === 'en' 
          ? 'Invalid credentials! Use: admin / admin123' 
          : 'Xog khaldan! Fadlan isticmaal: Username: admin | Password: admin123'
      );
    }
  };

  const handleLogout = async () => {
    if (DATABASE_MODE) {
      try { await api('logout', 'POST'); }
      catch (error) { reportApiError(error); return; }
      setIsAuthenticated(false);
      window.dispatchEvent(new Event('idogtc-auth-change'));
      return;
    }
    setIsAuthenticated(false);
    writeStored('idogtc_admin_auth', false);
  };

  // Image presets for easy selection
  const imagePresets = [
    { label: 'Ocean Freight / Rice Sourcing', url: '/images/hero_global_shipping_1793690292263.jpg' },
    { label: 'Bosaso Port / Steel Delivery', url: '/images/bosaso_port_trade_1793690293064.jpg' },
    { label: 'Solar Power / Quality Inspection', url: '/images/quality_inspection_1793690293588.jpg' },
    { label: 'Dubai Trade Hub / Heavy Cargo', url: '/images/dubai_trade_hub_1793690293266.jpg' }
  ];

  // Open product modal for new or existing product
  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        category: product.category,
        price: product.price,
        oldPrice: product.oldPrice,
        numericPrice: product.numericPrice,
        rating: product.rating,
        reviews: product.reviews,
        image: product.image,
        origin: product.origin,
        specs: product.specs,
        isFeatured: product.isFeatured ?? false
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        category: categories[0]?.name || 'Foodstuffs & Commodities',
        price: '$0.00',
        oldPrice: '$0.00',
        numericPrice: 0,
        rating: 5,
        reviews: 20,
        image: imagePresets[0].url,
        origin: 'Direct Import via Dubai & Bosaso',
        specs: 'Commercial Grade • Bulk Consignments',
        isFeatured: true
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    try {
    e.preventDefault();
    const normalizedPrice = productForm.price.trim().replace(/^\$\s*/, '').replace(/,/g, '');
    const parsedNum = Number(normalizedPrice);
    if (!/^\d+(\.\d{1,2})?$/.test(normalizedPrice) || !Number.isFinite(parsedNum) || parsedNum < 0) {
      showToast(language === 'en' ? 'Enter a valid price, e.g. $34.50' : 'Geli qiime sax ah, tusaale $34.50');
      return;
    }
    const finalData = { ...productForm, numericPrice: parsedNum };

    if (editingProduct) {
      await updateProduct(editingProduct.id, finalData);
      showToast(language === 'en' ? `Updated "${productForm.name}" successfully!` : `Waa la cusbooneysiiyay "${productForm.name}"!`);
    } else {
      await addProduct(finalData);
      showToast(language === 'en' ? `Added new product "${productForm.name}"!` : `Badeecad cusub ayaa lagu daray "${productForm.name}"!`);
    }
    setIsProductModalOpen(false);
    } catch (error) { reportApiError(error); }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    try {
    const confirmMsg = language === 'en' ? `${t.deleteConfirm}: "${name}"?` : `Ma hubtaa inaad tirto alaabtan: "${name}"?`;
    if (window.confirm(confirmMsg)) {
      await deleteProduct(id);
      showToast(language === 'en' ? `Deleted "${name}"` : `Waa la tiray "${name}"`);
    }
    } catch (error) { reportApiError(error); }
  };

  // Open slide modal
  const handleOpenSlideModal = (index: number) => {
    setEditingSlideIndex(index);
    setSlideForm({ ...slides[index] });
    setIsSlideModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    try {
    e.preventDefault();
    if (editingSlideIndex !== null) {
      await updateSlide(editingSlideIndex, slideForm);
      showToast(language === 'en' ? `Updated slide ${editingSlideIndex + 1} successfully!` : `Slide ${editingSlideIndex + 1} waa la cusbooneysiiyay!`);
      setIsSlideModalOpen(false);
    }
    } catch (error) { reportApiError(error); }
  };

  // Open category modal
  const handleOpenCategoryModal = (cat?: CategoryItem, index?: number) => {
    if (cat && typeof index === 'number') {
      setEditingCategoryIndex(index);
      setCategoryForm({ ...cat });
    } else {
      setEditingCategoryIndex(null);
      setCategoryForm({
        name: '',
        count: '10 Products',
        id: `cat_${Date.now()}`,
        img: imagePresets[0].url
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    try {
    e.preventDefault();
    const name = categoryForm.name.trim();
    if (!name || categories.some((category, index) => index !== editingCategoryIndex && category.name.toLowerCase() === name.toLowerCase())) {
      showToast(language === 'en' ? 'Enter a unique category name.' : 'Geli magac qayb oo aan hore u jirin.');
      return;
    }
    if (editingCategoryIndex !== null) {
      await updateCategory(editingCategoryIndex, { ...categoryForm, name });
      showToast(language === 'en' ? `Updated category "${categoryForm.name}"!` : `Qeybta "${categoryForm.name}" waa la cusbooneysiiyay!`);
    } else {
      await addCategory({ ...categoryForm, name });
      showToast(language === 'en' ? `Added new category "${categoryForm.name}"!` : `Qeyb cusub ayaa lagu daray "${categoryForm.name}"!`);
    }
    setIsCategoryModalOpen(false);
    } catch (error) { reportApiError(error); }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    try {
    e.preventDefault();
    await updateCompanySettings(settingsForm);
    showToast(language === 'en' ? 'Company settings & contact numbers updated!' : 'Xogta shirkadda & taleefannada waa la cusbooneysiiyay!');
    } catch (error) { reportApiError(error); }
  };

  // If not authenticated, show secure login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] flex flex-col justify-center items-center p-4">
        
        {/* Language selector on Login page */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#1E293B] border border-[#334155] px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm">
          <Globe className="w-3.5 h-3.5 text-[#FFD333]" />
          <button 
            onClick={() => setLanguage('en')}
            className={`px-1.5 py-0.5 rounded cursor-pointer ${language === 'en' ? 'bg-[#FFD333] text-[#3D464D]' : 'text-slate-400 hover:text-white'}`}
          >
            English
          </button>
          <span className="text-slate-600">|</span>
          <button 
            onClick={() => setLanguage('so')}
            className={`px-1.5 py-0.5 rounded cursor-pointer ${language === 'so' ? 'bg-[#FFD333] text-[#3D464D]' : 'text-slate-400 hover:text-white'}`}
          >
            Af Soomaali
          </button>
        </div>

        <div className="max-w-md w-full bg-[#1E293B] border border-[#334155] rounded-xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full p-1 bg-[#FFD333] flex items-center justify-center shadow">
              <img src={getHeaderSettings(companySettings).image} alt="IDO GTC" className="w-full h-full object-contain rounded-full bg-white p-1" />
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Shield className="w-4 h-4 text-[#FFD333]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD333]">{t.adminControlPanel}</span>
            </div>
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white">{t.adminBackoffice}</h1>
            <p className="text-xs text-[#94A3B8]">
              {t.adminLoginDesc}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] uppercase mb-1">
                {t.adminUsername}
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="admin" 
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#475569] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FFD333]"
                  autoFocus
                  required
                />
                <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] uppercase mb-1">
                {t.adminPassword}
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder={DATABASE_MODE ? "Password" : "admin123"} 
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#475569] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FFD333]"
                  required
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
              {authError && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium">{authError}</p>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#FFD333] text-[#3D464D] py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#E5BE2C] transition-colors shadow-lg cursor-pointer"
            >
              {t.loginButton}
            </button>
          </form>

          <div className="pt-2 border-t border-[#334155] flex flex-col items-center gap-2 text-center text-xs text-[#94A3B8]">
            {!DATABASE_MODE && <>
            <p className="text-[11px] font-mono text-[#CBD5E1]">
              {t.demoPasswordHint}: <strong className="text-[#FFD333]">admin</strong> / <strong className="text-[#FFD333]">admin123</strong>
            </p>
            <button 
              type="button"
              onClick={() => { setUsernameInput('admin'); setPasswordInput('admin123'); }}
              className="text-[11px] text-[#FFD333] hover:underline cursor-pointer"
            >
              {t.useDemoPassword}
            </button>
            </>}
            <button 
              onClick={onBackToStore}
              className="flex items-center gap-1 text-[#94A3B8] hover:text-white mt-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.backToLiveStore}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter products for the products tab
  const filteredAdminProducts = products.filter(p => {
    const matchesCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    const matchesSearch = productSearch === '' || 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.price.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] flex flex-col">
      
      {/* Toast message */}
      {adminToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 border-l-4 border-[#FFD333] text-xs sm:text-sm font-semibold animate-bounce">
          <Check className="w-4 h-4 text-[#FFD333]" />
          <span>{adminToast}</span>
        </div>
      )}

      {/* Top Admin Header with Language Toggle */}
      <header className="bg-[#1E293B] border-b border-[#334155] sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full p-0.5 bg-[#FFD333] shrink-0">
              <img src={getHeaderSettings(companySettings).image} alt="IDO GTC" className="w-full h-full object-contain rounded-full bg-white p-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-white">IDO GTC</span>
                <span className="bg-[#FFD333] text-[#3D464D] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                  {t.adminControlPanel}
                </span>
              </div>
              <span className="text-[10px] text-[#94A3B8] font-mono hidden sm:inline">idogtc.com • Central Control Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher in Admin Header */}
            <div className="flex items-center gap-1 bg-[#0F172A] border border-[#334155] px-2 py-1 rounded-lg text-xs font-bold text-white">
              <Globe className="w-3.5 h-3.5 text-[#FFD333]" />
              <button 
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded text-[11px] cursor-pointer ${language === 'en' ? 'bg-[#FFD333] text-[#3D464D]' : 'text-slate-400 hover:text-white'}`}
                title="Switch to English"
              >
                EN
              </button>
              <span className="text-slate-600">|</span>
              <button 
                onClick={() => setLanguage('so')}
                className={`px-1.5 py-0.5 rounded text-[11px] cursor-pointer ${language === 'so' ? 'bg-[#FFD333] text-[#3D464D]' : 'text-slate-400 hover:text-white'}`}
                title="U beddel Af Soomaali"
              >
                SO
              </button>
            </div>

            <button 
              onClick={onBackToStore}
              className="bg-[#334155] text-white hover:bg-[#475569] px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-600 shadow-sm"
              title="View Live Storefront"
            >
              <Eye className="w-3.5 h-3.5 text-[#FFD333]" />
              <span className="hidden sm:inline">{t.backToLiveStore}</span>
            </button>

            <button 
              onClick={handleLogout}
              className="bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/50 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              {t.logout}
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Body with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Navigation Sidebar */}
        <aside className="md:col-span-3 space-y-2">
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-3 space-y-1 shadow-sm">
            
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#FFD333] text-[#3D464D] shadow' : 'text-[#CBD5E1] hover:bg-[#334155]'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t.dashboardOverview}</span>
            </button>

            <button 
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${activeTab === 'products' ? 'bg-[#FFD333] text-[#3D464D] shadow' : 'text-[#CBD5E1] hover:bg-[#334155]'}`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>{language === 'en' ? 'Products' : 'Badeecadaha'} ({products.length})</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20">{products.length}</span>
            </button>

            <button 
              onClick={() => setActiveTab('slides')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${activeTab === 'slides' ? 'bg-[#FFD333] text-[#3D464D] shadow' : 'text-[#CBD5E1] hover:bg-[#334155]'}`}
            >
              <Sliders className="w-4 h-4" />
              <span>{language === 'en' ? 'Hero Slider' : 'Boorarka Wareegaya'} ({slides.length})</span>
            </button>

            <button 
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${activeTab === 'categories' ? 'bg-[#FFD333] text-[#3D464D] shadow' : 'text-[#CBD5E1] hover:bg-[#334155]'}`}
            >
              <Layers className="w-4 h-4" />
              <span>{language === 'en' ? 'Categories' : 'Qaybaha'} ({categories.length})</span>
            </button>

            <button 
              onClick={() => setActiveTab('media')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${activeTab === 'media' ? 'bg-[#FFD333] text-[#3D464D] shadow' : 'text-[#CBD5E1] hover:bg-[#334155]'}`}
            >
              <div className="flex items-center gap-2.5">
                <Folder className="w-4 h-4" />
                <span>{t.mediaStorage}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-[#FFD333] font-mono">{mediaItems.length}</span>
            </button>

            <button 
              onClick={() => setActiveTab('promos')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${activeTab === 'promos' ? 'bg-[#FFD333] text-[#3D464D] shadow' : 'text-[#CBD5E1] hover:bg-[#334155]'}`}
            >
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-4 h-4" />
                <span>{t.promoBannersTab}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-[#FFD333] font-mono">{promoBanners.length}</span>
            </button>

            <button 
              onClick={() => setActiveTab('partners')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${activeTab === 'partners' ? 'bg-[#FFD333] text-[#3D464D] shadow' : 'text-[#CBD5E1] hover:bg-[#334155]'}`}
            >
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4" />
                <span>{t.partnersTab}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-[#FFD333] font-mono">{partners.length}</span>
            </button>

            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${activeTab === 'orders' ? 'bg-[#FFD333] text-[#3D464D] shadow' : 'text-[#CBD5E1] hover:bg-[#334155]'}`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>{t.wholesaleOrders}</span>
              </div>
              {orders.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FFD333] text-[#3D464D] font-mono">{orders.length}</span>
              )}
            </button>

            <button onClick={() => setActiveTab('header')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${activeTab === 'header' ? 'bg-[#FFD333] text-[#3D464D] shadow' : 'text-[#CBD5E1] hover:bg-[#334155]'}`}>
              <LayoutDashboard className="w-4 h-4" /><span>Header / Menu & Logo</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-[#FFD333] text-[#3D464D] shadow' : 'text-[#CBD5E1] hover:bg-[#334155]'}`}
            >
              <Settings className="w-4 h-4" />
              <span>{t.companySettings}</span>
            </button>

          </div>

          {/* Quick System Tools */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 space-y-3">
            <h4 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">{t.companySettings}</h4>
            <div className="text-xs space-y-1.5 text-[#CBD5E1] font-mono">
              <p className="flex items-center gap-1.5 truncate"><Phone className="w-3.5 h-3.5 text-[#FFD333]" /> {companySettings.bosasoPhone}</p>
              <p className="flex items-center gap-1.5 truncate"><Phone className="w-3.5 h-3.5 text-[#FFD333]" /> {companySettings.dubaiPhone}</p>
              <p className="flex items-center gap-1.5 truncate"><Mail className="w-3.5 h-3.5 text-[#FFD333]" /> {companySettings.email}</p>
            </div>
            <button 
              onClick={async () => { try {
                if (window.confirm(t.resetConfirm)) {
                  await resetToDefaults();
                  showToast(language === 'en' ? 'Template data restored to defaults' : 'Dib ayaa loogu celiyay xogtii asalka ahayd');
                }
              } catch (error) { reportApiError(error); } }}
              className="w-full flex items-center justify-center gap-1.5 text-[11px] text-[#94A3B8] hover:text-rose-400 py-1.5 border border-dashed border-[#475569] rounded transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{t.resetDefaults}</span>
            </button>
          </div>
        </aside>

        {/* Dynamic Content Panel */}
        <main className="md:col-span-9 space-y-6">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'header' && <HeaderEditor />}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold uppercase text-white">{t.dashboardOverview}</h2>
                  <p className="text-xs text-[#94A3B8]">{t.dashboardDesc}</p>
                </div>
                <button 
                  onClick={() => handleOpenProductModal()}
                  className="bg-[#FFD333] text-[#3D464D] px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-1.5 shadow hover:bg-[#E5BE2C] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addNewProduct}</span>
                </button>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
                  <span className="text-[10px] uppercase font-bold text-[#94A3B8]">{t.totalProducts}</span>
                  <p className="text-3xl font-extrabold text-white mt-1">{products.length}</p>
                  <span className="text-[10px] text-emerald-400 font-medium">{t.activeItems}</span>
                </div>

                <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
                  <span className="text-[10px] uppercase font-bold text-[#94A3B8]">{t.categoriesTitle}</span>
                  <p className="text-3xl font-extrabold text-white mt-1">{categories.length}</p>
                  <span className="text-[10px] text-[#FFD333] font-medium">{t.categoriesCount}</span>
                </div>

                <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
                  <span className="text-[10px] uppercase font-bold text-[#94A3B8]">{t.cartInquiries}</span>
                  <p className="text-3xl font-extrabold text-white mt-1">{orders.length}</p>
                  <span className="text-[10px] text-sky-400 font-medium">WhatsApp Orders</span>
                </div>

                <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
                  <span className="text-[10px] uppercase font-bold text-[#94A3B8]">{t.heroSlides}</span>
                  <p className="text-3xl font-extrabold text-white mt-1">{slides.length}</p>
                  <span className="text-[10px] text-amber-400 font-medium">Rotating Banners</span>
                </div>
              </div>

              {/* Quick Jump Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white uppercase flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#FFD333]" />
                      <span>{language === 'en' ? 'Manage Inventory' : 'Maamulka Alaabaha'}</span>
                    </h3>
                    <button 
                      onClick={() => setActiveTab('products')} 
                      className="text-xs text-[#FFD333] hover:underline"
                    >
                      {language === 'en' ? 'View All' : 'Eeg Dhammaan'}
                    </button>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {language === 'en' 
                      ? 'Update wholesale container prices, product specifications, or publish new commodities directly to the live storefront.'
                      : 'Wax ka beddel qiimaha jumlada, magaca badeecada, cadadka shixnadda, ama ku dar alaabo cusub oo toos ugu soo bixi doona Home Page-ka.'}
                  </p>
                  <button 
                    onClick={() => handleOpenProductModal()}
                    className="w-full bg-[#334155] hover:bg-[#475569] text-white py-2 rounded text-xs font-bold uppercase transition-colors"
                  >
                    + {t.addNewProduct}
                  </button>
                </div>

                <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white uppercase flex items-center gap-2">
                      <Settings className="w-4 h-4 text-[#FFD333]" />
                      <span>{t.companySettings}</span>
                    </h3>
                    <button 
                      onClick={() => setActiveTab('settings')} 
                      className="text-xs text-[#FFD333] hover:underline"
                    >
                      {language === 'en' ? 'Edit' : 'Wax ka beddel'}
                    </button>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {language === 'en'
                      ? 'Configure Somalia HQ phone (+252 90 512 4444), Dubai hub phone (+971 50 150 7332), or physical warehouse addresses.'
                      : 'Beddel lambarka Boosaaso (+252 90 512 4444), lambarka Dubai (+971 50 150 7332), ama cinwaanka xafiisyada.'}
                  </p>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="w-full bg-[#334155] hover:bg-[#475569] text-white py-2 rounded text-xs font-bold uppercase transition-colors"
                  >
                    {t.saveChanges}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT (CRUD) */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold uppercase text-white">{language === 'en' ? 'Product Catalog Management' : 'Maamulka Alaabta'}</h2>
                  <p className="text-xs text-[#94A3B8]">{language === 'en' ? 'Add, edit wholesale prices, or remove products appearing on the website.' : 'Ku dar, wax ka beddel qiimayaasha, ama tir alaabooyinka ka muuqda bogga.'}</p>
                </div>
                <button 
                  onClick={() => handleOpenProductModal()}
                  className="bg-[#FFD333] text-[#3D464D] px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-1.5 shadow hover:bg-[#E5BE2C] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addNewProduct}</span>
                </button>
              </div>

              {/* Filters bar */}
              <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder={language === 'en' ? 'Search by product name, category, or price...' : 'Raadi magaca alaabta, qiimaha, ama qeybta...'}
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#0F172A] border border-[#475569] rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FFD333]"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#94A3B8] whitespace-nowrap">{t.category}:</span>
                  <select 
                    value={productCategoryFilter} 
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="bg-[#0F172A] border border-[#475569] text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#FFD333]"
                  >
                    <option value="All">{t.allCategories}</option>
                    {categories.map((c, i) => (
                      <option key={i} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden shadow">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0F172A] text-[#94A3B8] uppercase text-[10px] tracking-wider border-b border-[#334155]">
                      <tr>
                        <th className="p-3.5">{t.productName}</th>
                        <th className="p-3.5">{t.category}</th>
                        <th className="p-3.5">{t.wholesalePrice}</th>
                        <th className="p-3.5">{t.oldPrice}</th>
                        <th className="p-3.5">{t.origin}</th>
                        <th className="p-3.5 text-right">{language === 'en' ? 'Actions' : 'Ficilada'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155] text-slate-200">
                      {filteredAdminProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-[#94A3B8]">
                            {t.noProductsFound}
                          </td>
                        </tr>
                      ) : (
                        filteredAdminProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-[#253248] transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded bg-[#0F172A] border border-[#334155] shrink-0" />
                                <div>
                                  <p className="font-bold text-white line-clamp-1">{p.name}</p>
                                  <p className="text-[10px] text-[#94A3B8] line-clamp-1">{p.specs}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span className="bg-[#0F172A] border border-[#334155] text-[10px] px-2 py-0.5 rounded text-amber-300">
                                {p.category}
                              </span>
                            </td>
                            <td className="p-3.5 font-mono font-bold text-emerald-400">
                              {p.price}
                            </td>
                            <td className="p-3.5 font-mono text-[#94A3B8] line-through">
                              {p.oldPrice}
                            </td>
                            <td className="p-3.5 text-[#94A3B8] text-[11px]">
                              {p.origin}
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => handleOpenProductModal(p)}
                                  className="p-1.5 text-slate-300 hover:text-[#FFD333] hover:bg-[#334155] rounded transition-colors cursor-pointer"
                                  title={t.editProduct}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-900/40 rounded transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: HERO SLIDER MANAGEMENT */}
          {activeTab === 'slides' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-extrabold uppercase text-white">{language === 'en' ? 'Hero Slider Management' : 'Boorarka Wareegaya'}</h2>
                <p className="text-xs text-[#94A3B8]">{language === 'en' ? 'Edit the 3 prominent rotating promo banners on the homepage.' : 'Wax ka beddel 3-da boor ee waaweyn ee bogga hore ka wareegaya.'}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {slides.map((s, idx) => (
                  <div key={idx} className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img src={s.image} alt={s.title} className="w-20 h-20 object-cover rounded-lg bg-[#0F172A] border border-[#334155] shrink-0" />
                      <div className="space-y-1">
                        <span className="bg-[#FFD333] text-[#3D464D] text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                          Slide #{idx + 1}: {s.badge}
                        </span>
                        <h3 className="text-base font-bold text-white">{s.title}</h3>
                        <p className="text-xs font-mono text-[#FFD333]">{s.offer}</p>
                        <p className="text-xs text-[#94A3B8] line-clamp-1">{s.desc}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleOpenSlideModal(idx)}
                      className="bg-[#334155] hover:bg-[#475569] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#FFD333]" />
                      <span>{language === 'en' ? 'Edit Slide' : 'Wax ka beddel'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold uppercase text-white">{t.categoriesTitle}</h2>
                  <p className="text-xs text-[#94A3B8]">{language === 'en' ? 'Add, edit, or configure commodity categories.' : 'Ku dar ama wax ka beddel qeybaha badeecadaha.'}</p>
                </div>
                <button 
                  onClick={() => handleOpenCategoryModal()}
                  className="bg-[#FFD333] text-[#3D464D] px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-1.5 shadow hover:bg-[#E5BE2C] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addCategory}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((c, idx) => (
                  <div key={idx} className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={c.img} alt={c.name} className="w-12 h-12 object-cover rounded bg-[#0F172A] border border-[#334155] shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-white truncate">{c.name}</h4>
                        <span className="text-[10px] text-[#94A3B8]">{c.count}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleOpenCategoryModal(c, idx)}
                        className="p-1.5 text-slate-300 hover:text-[#FFD333] hover:bg-[#334155] rounded cursor-pointer"
                        title={t.editCategory}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={async () => { try {
                          if (products.some(product => product.category === c.name)) {
                            showToast(language === 'en' ? 'Move the products to another category before deleting this category.' : 'Alaabta u wareeji qayb kale ka hor intaadan qaybtan tirtirin.');
                            return;
                          }
                          const confirmMsg = language === 'en' ? `Are you sure you want to delete "${c.name}"?` : `Ma hubtaa inaad tirto qaybta "${c.name}"?`;
                          if (window.confirm(confirmMsg)) {
                            await deleteCategory(idx);
                            showToast(language === 'en' ? `Deleted category "${c.name}"` : `Qaybta "${c.name}" waa la tiray`);
                          }
                        } catch (error) { reportApiError(error); } }}
                        className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-900/40 rounded cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS & INQUIRIES LOG */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-extrabold uppercase text-white">{t.wholesaleOrders}</h2>
                <p className="text-xs text-[#94A3B8]">{t.ordersDesc}</p>
              </div>

              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-8 text-center text-[#94A3B8] space-y-2">
                    <ShoppingBag className="w-10 h-10 mx-auto text-slate-500" />
                    <p className="text-sm">{t.noOrders}</p>
                  </div>
                ) : (
                  orders.map((o) => (
                    <div key={o.id} className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 sm:p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#334155] pb-2.5">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#FFD333] text-sm">{o.id}</span>
                          <span className="text-xs text-[#94A3B8]">{t.orderDate}: {o.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#94A3B8]">{t.orderStatus}:</span>
                          <select 
                            value={o.status}
                            onChange={(e) => { Promise.resolve(updateOrderStatus(o.id, e.target.value as OrderInquiry['status'])).catch(reportApiError); }}
                            className="bg-[#0F172A] border border-[#475569] text-xs font-bold text-white px-2.5 py-1 rounded focus:outline-none focus:border-[#FFD333]"
                          >
                            <option value="New">{t.statusNew}</option>
                            <option value="Contacted">{t.statusContacted}</option>
                            <option value="Fulfilled">{t.statusFulfilled}</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                            <span>• {it.productName} (x{it.quantity})</span>
                            <span className="font-mono text-emerald-400">{it.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-[#334155] flex items-center justify-between text-xs">
                        <span className="text-[#94A3B8]">{t.estimatedTotal}:</span>
                        <span className="font-mono font-bold text-white text-sm">${o.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: COMPANY SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-extrabold uppercase text-white">{t.companySettings}</h2>
                <p className="text-xs text-[#94A3B8]">{t.settingsDesc}</p>
              </div>

              <form onSubmit={handleSaveSettings} className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.companyName}</label>
                    <input 
                      type="text" 
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.officialDomain}</label>
                    <input 
                      type="text" 
                      value={settingsForm.domain}
                      onChange={(e) => setSettingsForm({ ...settingsForm, domain: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.somaliaPhone}</label>
                    <input 
                      type="text" 
                      value={settingsForm.bosasoPhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bosasoPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.dubaiPhone}</label>
                    <input 
                      type="text" 
                      value={settingsForm.dubaiPhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, dubaiPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.officialEmail}</label>
                    <input 
                      type="email" 
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.bosasoAddress}</label>
                    <input 
                      type="text" 
                      value={settingsForm.bosasoAddress}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bosasoAddress: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.dubaiAddress}</label>
                  <input 
                    type="text" 
                    value={settingsForm.dubaiAddress}
                    onChange={(e) => setSettingsForm({ ...settingsForm, dubaiAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.aboutStatement}</label>
                  <textarea 
                    rows={4}
                    value={settingsForm.aboutText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, aboutText: e.target.value })}
                    className="w-full p-3 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333] leading-relaxed"
                  />
                </div>

                <button 
                  type="submit" 
                  className="bg-[#FFD333] text-[#3D464D] px-6 py-2.5 rounded-lg font-bold text-xs uppercase flex items-center gap-2 shadow hover:bg-[#E5BE2C] transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{t.saveChanges}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: MEDIA & IMAGE STORAGE */}
          {activeTab === 'media' && (
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 sm:p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#334155]">
                <div>
                  <h2 className="text-lg font-extrabold uppercase text-white flex items-center gap-2">
                    <Folder className="w-5 h-5 text-[#FFD333]" />
                    <span>{t.mediaStorage}</span>
                  </h2>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{t.mediaLibraryDesc}</p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="bg-[#FFD333] hover:bg-[#E5BE2C] text-[#3D464D] px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2 cursor-pointer shadow transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingMedia ? 'Uploading...' : t.uploadNewImage}</span>
                    <input 
                      ref={directMediaInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={handleDirectMediaUpload}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Hosting Compatibility Notice Banner */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3.5 flex items-start gap-3 text-xs text-amber-200">
                <HardDrive className="w-5 h-5 text-[#FFD333] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-amber-100 uppercase text-[11px] tracking-wide">
                    {DATABASE_MODE ? (language === 'en' ? 'Server Media Storage' : 'Kaydka Sawirrada Server-ka') : (language === 'en' ? 'Full Static Hosting Compatibility' : 'Waafaqsanaanta Buuxda ee Hosting-ka')}
                  </p>
                  <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
                    {DATABASE_MODE ? (language === 'en' ? 'Images are saved on the server and shared across devices.' : 'Sawirrada server-ka ayaa lagu kaydiyaa, qalabka oo dhanna waa laga arki karaa.') : t.hostingReadyNotice}
                  </p>
                </div>
              </div>

              {/* Media Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaItems.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-[#0F172A] border border-[#334155] rounded-lg overflow-hidden flex flex-col justify-between group hover:border-[#64748B] transition-all"
                  >
                    <div className="relative aspect-video bg-slate-900 overflow-hidden">
                      <img 
                        src={item.url} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <span className={`absolute top-2 left-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow ${item.isSystem ? 'bg-[#334155] text-white' : 'bg-[#FFD333] text-[#3D464D]'}`}>
                        {item.isSystem ? t.systemAsset : t.userUploaded}
                      </span>
                    </div>

                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-[#94A3B8] block truncate uppercase">{item.category || 'General'}</span>
                        <h4 className="text-xs font-bold text-white line-clamp-1 mt-0.5" title={item.title}>{item.title}</h4>
                        <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">{item.date}</span>
                      </div>

                      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between gap-2">
                        <button 
                          onClick={() => copyToClipboard(item.url, item.title)}
                          className="px-2.5 py-1 bg-[#1E293B] hover:bg-[#334155] text-slate-300 hover:text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copy image URL or Data URI"
                        >
                          <Copy className="w-3 h-3 text-[#FFD333]" />
                          <span>Copy</span>
                        </button>

                        {!item.isSystem && (
                          <button 
                            onClick={async () => {
                              try {
                              if (window.confirm(language === 'en' ? `Delete image "${item.title}"?` : `Ma hubtaa inaad tirto sawirkan?`)) {
                                await deleteMediaItem(item.id);
                                showToast(language === 'en' ? 'Image removed from Media Storage' : 'Sawirka waa laga saaray kaydka');
                              }
                              } catch (error) { reportApiError(error); }
                            }}
                            className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                            title="Delete custom image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 6: PROMO OFFER BANNERS */}
          {activeTab === 'promos' && (
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 sm:p-6 space-y-6">
              <div className="pb-4 border-b border-[#334155]">
                <h2 className="text-lg font-extrabold uppercase text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-[#FFD333]" />
                  <span>{t.promoBannersTab}</span>
                </h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">{t.promoBannersDesc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {promoBanners.map((banner, idx) => (
                  <div key={banner.id} className="bg-[#0F172A] border border-[#334155] rounded-xl overflow-hidden flex flex-col justify-between p-4 space-y-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-[#334155] bg-slate-900">
                      <img src={banner.image} alt={banner.title} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end">
                        <span className="text-[10px] font-bold uppercase text-[#FFD333] bg-black/60 px-2 py-0.5 rounded border border-[#FFD333]/30 inline-block w-fit">
                          {banner.badge}
                        </span>
                        <h4 className="text-base font-extrabold text-white uppercase mt-1">{banner.title}</h4>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300 font-normal">
                      <p className="text-slate-400 line-clamp-2 leading-relaxed">{banner.description}</p>
                      <div className="pt-2 flex items-center justify-between text-[11px] text-[#FFD333] font-mono">
                        <span>Link: #{banner.buttonLink}</span>
                        <span>Button: "{banner.buttonText}"</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleOpenPromoModal(banner)}
                      className="w-full bg-[#FFD333] hover:bg-[#E5BE2C] text-[#3D464D] py-2 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2 shadow transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>{t.editBanner} #{idx + 1}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: PARTNERS & BRAND BADGES */}
          {activeTab === 'partners' && (
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#334155]">
                <div>
                  <h2 className="text-lg font-extrabold uppercase text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#FFD333]" />
                    <span>{t.partnersTab}</span>
                  </h2>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{t.partnersDesc}</p>
                </div>

                <button 
                  onClick={() => handleOpenPartnerModal()}
                  className="bg-[#FFD333] hover:bg-[#E5BE2C] text-[#3D464D] px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2 shadow transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addPartner}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {partners.map((partner) => (
                  <div key={partner.id} className="bg-[#0F172A] border border-[#334155] rounded-xl p-4 text-center flex flex-col justify-between space-y-3 hover:border-[#64748B] transition-colors">
                    {partner.image ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden mx-auto bg-slate-800 border border-slate-700 p-1 flex items-center justify-center">
                        <img src={partner.image} alt={partner.name} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#1E293B] text-[#FFD333] border border-[#334155] flex items-center justify-center mx-auto shadow">
                        {partner.iconType === 'port' && <Ship className="w-6 h-6" />}
                        {partner.iconType === 'globe' && <Globe className="w-6 h-6" />}
                        {partner.iconType === 'iso' && <Award className="w-6 h-6" />}
                        {partner.iconType === 'solar' && <Sun className="w-6 h-6" />}
                        {partner.iconType === 'food' && <Package className="w-6 h-6" />}
                        {partner.iconType === 'freight' && <Truck className="w-6 h-6" />}
                        {!partner.iconType && <Anchor className="w-6 h-6" />}
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">{partner.name}</h4>
                      <p className="text-[10px] text-slate-400 block mt-0.5 truncate">{partner.tag}</p>
                    </div>

                    <div className="pt-2 border-t border-[#1E293B] flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => handleOpenPartnerModal(partner)}
                        className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 rounded transition-colors cursor-pointer"
                        title="Edit Badge"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeletePartner(partner.id, partner.name)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                        title="Delete Badge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setIsProductModalOpen(false)}
        >
          <div 
            className="bg-[#1E293B] border border-[#334155] rounded-xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#334155] pb-3">
              <h3 className="font-extrabold text-base uppercase text-white">
                {editingProduct ? t.editProduct : t.addNewProduct}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.productName}</label>
                <input 
                  type="text" 
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Premium Basmati Rice (50kg Bag)"
                  className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.category}</label>
                  <select 
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                  >
                    {categories.map((c, i) => (
                      <option key={i} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.wholesalePrice}</label>
                  <input 
                    type="text" 
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="$34.50"
                    className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.oldPrice}</label>
                  <input 
                    type="text" 
                    value={productForm.oldPrice}
                    onChange={(e) => setProductForm({ ...productForm, oldPrice: e.target.value })}
                    placeholder="$39.00"
                    className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.origin}</label>
                  <input 
                    type="text" 
                    value={productForm.origin}
                    onChange={(e) => setProductForm({ ...productForm, origin: e.target.value })}
                    placeholder="Dubai / Turkey / India"
                    className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.specsPackaging}</label>
                <input 
                  type="text" 
                  value={productForm.specs}
                  onChange={(e) => setProductForm({ ...productForm, specs: e.target.value })}
                  placeholder="Double Polished • Container Lots"
                  className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                />
              </div>

              {/* Image Selection with Browse and Media Storage */}
              <ImagePickerField 
                label={t.productImage}
                value={productForm.image}
                onChange={(url) => setProductForm({ ...productForm, image: url })}
                category={productForm.category}
                mediaItems={mediaItems}
                onUploadNew={addMediaItem}
                language={language}
                onShowToast={showToast}
              />

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox"
                  id="featCheck"
                  checked={productForm.isFeatured}
                  onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-[#FFD333] cursor-pointer"
                />
                <label htmlFor="featCheck" className="text-xs text-[#CBD5E1] cursor-pointer">
                  {t.featureOnHome}
                </label>
              </div>

              <div className="pt-3 border-t border-[#334155] flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-[#475569] text-xs font-bold uppercase rounded text-slate-300 hover:bg-[#334155]"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#FFD333] text-[#3D464D] text-xs font-bold uppercase rounded hover:bg-[#E5BE2C] shadow"
                >
                  {t.saveProduct}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT HERO SLIDE */}
      {isSlideModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setIsSlideModalOpen(false)}
        >
          <div 
            className="bg-[#1E293B] border border-[#334155] rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#334155] pb-3">
              <h3 className="font-extrabold text-base uppercase text-white">
                {t.editSlide} #{editingSlideIndex !== null ? editingSlideIndex + 1 : ''}
              </h3>
              <button onClick={() => setIsSlideModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.mainTitle}</label>
                <input 
                  type="text" 
                  required
                  value={slideForm.title}
                  onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.smallBadge}</label>
                <input 
                  type="text" 
                  value={slideForm.badge}
                  onChange={(e) => setSlideForm({ ...slideForm, badge: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.promotionalOffer}</label>
                <input 
                  type="text" 
                  value={slideForm.offer}
                  onChange={(e) => setSlideForm({ ...slideForm, offer: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.slideDesc}</label>
                <textarea 
                  rows={3}
                  value={slideForm.desc}
                  onChange={(e) => setSlideForm({ ...slideForm, desc: e.target.value })}
                  className="w-full p-2.5 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                />
              </div>

              <ImagePickerField 
                label={language === 'en' ? 'Slide Image' : 'Sawirka Slide-ka'}
                value={slideForm.image}
                onChange={(url) => setSlideForm({ ...slideForm, image: url })}
                category="Hero Slides"
                mediaItems={mediaItems}
                onUploadNew={addMediaItem}
                language={language}
                onShowToast={showToast}
              />

              <div className="pt-3 border-t border-[#334155] flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsSlideModalOpen(false)}
                  className="px-4 py-2 border border-[#475569] text-xs font-bold uppercase rounded text-slate-300"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#FFD333] text-[#3D464D] text-xs font-bold uppercase rounded hover:bg-[#E5BE2C]"
                >
                  {t.saveSlide}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT CATEGORY */}
      {isCategoryModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setIsCategoryModalOpen(false)}
        >
          <div 
            className="bg-[#1E293B] border border-[#334155] rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#334155] pb-3">
              <h3 className="font-extrabold text-base uppercase text-white">
                {editingCategoryIndex !== null ? t.editCategory : t.addCategory}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.categoryName}</label>
                <input 
                  type="text" 
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Ceramics & Sanitary"
                  className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.countBadge}</label>
                <input 
                  type="text" 
                  value={categoryForm.count}
                  onChange={(e) => setCategoryForm({ ...categoryForm, count: e.target.value })}
                  placeholder="e.g. 45 Products"
                  className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                />
              </div>

              <ImagePickerField 
                label={language === 'en' ? 'Category Image' : 'Sawirka Qaybta'}
                value={categoryForm.img}
                onChange={(url) => setCategoryForm({ ...categoryForm, img: url })}
                category="Categories"
                mediaItems={mediaItems}
                onUploadNew={addMediaItem}
                language={language}
                onShowToast={showToast}
              />

              <div className="pt-3 border-t border-[#334155] flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-[#475569] text-xs font-bold uppercase rounded text-slate-300"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#FFD333] text-[#3D464D] text-xs font-bold uppercase rounded hover:bg-[#E5BE2C]"
                >
                  {t.saveCategory}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT PROMO OFFER BANNER */}
      {isPromoModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setIsPromoModalOpen(false)}
        >
          <div 
            className="bg-[#1E293B] border border-[#334155] rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#334155] pb-3">
              <h3 className="font-extrabold text-base uppercase text-white">
                {t.editBanner}
              </h3>
              <button onClick={() => setIsPromoModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">Title (English)</label>
                  <input 
                    type="text" 
                    required
                    value={promoForm.title}
                    onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">Title (Af Soomaali)</label>
                  <input 
                    type="text" 
                    value={promoForm.titleSo || ''}
                    onChange={(e) => setPromoForm({ ...promoForm, titleSo: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">Badge Tag (English)</label>
                  <input 
                    type="text" 
                    value={promoForm.badge}
                    onChange={(e) => setPromoForm({ ...promoForm, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">Badge Tag (Af Soomaali)</label>
                  <input 
                    type="text" 
                    value={promoForm.badgeSo || ''}
                    onChange={(e) => setPromoForm({ ...promoForm, badgeSo: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">Description (English)</label>
                <textarea 
                  rows={2}
                  value={promoForm.description}
                  onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                  className="w-full p-2.5 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">Description (Af Soomaali)</label>
                <textarea 
                  rows={2}
                  value={promoForm.descriptionSo || ''}
                  onChange={(e) => setPromoForm({ ...promoForm, descriptionSo: e.target.value })}
                  className="w-full p-2.5 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.bannerButtonText} (EN)</label>
                  <input 
                    type="text" 
                    value={promoForm.buttonText}
                    onChange={(e) => setPromoForm({ ...promoForm, buttonText: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.bannerButtonText} (SO)</label>
                  <input 
                    type="text" 
                    value={promoForm.buttonTextSo || ''}
                    onChange={(e) => setPromoForm({ ...promoForm, buttonTextSo: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.bannerButtonLink}</label>
                <select 
                  value={promoForm.buttonLink}
                  onChange={(e) => setPromoForm({ ...promoForm, buttonLink: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                >
                  <option value="about">About Us Section (#about)</option>
                  <option value="contact">Contact Section (#contact)</option>
                  <option value="recent">Recent Products (#recent)</option>
                  <option value="featured">Featured Goods (#featured)</option>
                  <option value="categories">Categories (#categories)</option>
                </select>
              </div>

              <ImagePickerField 
                label={language === 'en' ? 'Banner Background Image' : 'Sawirka Banner-ka'}
                value={promoForm.image}
                onChange={(url) => setPromoForm({ ...promoForm, image: url })}
                category="Offer Banners"
                mediaItems={mediaItems}
                onUploadNew={addMediaItem}
                language={language}
                onShowToast={showToast}
              />

              <div className="pt-3 border-t border-[#334155] flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-4 py-2 border border-[#475569] text-xs font-bold uppercase rounded text-slate-300"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#FFD333] text-[#3D464D] text-xs font-bold uppercase rounded hover:bg-[#E5BE2C]"
                >
                  {t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD / EDIT PARTNER BADGE */}
      {isPartnerModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setIsPartnerModalOpen(false)}
        >
          <div 
            className="bg-[#1E293B] border border-[#334155] rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#334155] pb-3">
              <h3 className="font-extrabold text-base uppercase text-white">
                {editingPartnerId ? t.editPartner : t.addPartner}
              </h3>
              <button onClick={() => setIsPartnerModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.partnerName}</label>
                <input 
                  type="text" 
                  required
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                  placeholder="e.g. BOSASO PORT"
                  className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.partnerTag} (EN)</label>
                <input 
                  type="text" 
                  required
                  value={partnerForm.tag}
                  onChange={(e) => setPartnerForm({ ...partnerForm, tag: e.target.value })}
                  placeholder="e.g. Puntland Corridor"
                  className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.partnerTag} (SO)</label>
                <input 
                  type="text" 
                  value={partnerForm.tagSo || ''}
                  onChange={(e) => setPartnerForm({ ...partnerForm, tagSo: e.target.value })}
                  placeholder="e.g. Marfada Boosaaso"
                  className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase mb-1">{t.iconTypeLabel}</label>
                <select 
                  value={partnerForm.iconType || 'port'}
                  onChange={(e) => setPartnerForm({ ...partnerForm, iconType: e.target.value as PartnerItem['iconType'] })}
                  className="w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]"
                >
                  <option value="port">Port & Cargo Vessel (Ship Icon)</option>
                  <option value="globe">Global & Trade Hub (Globe Icon)</option>
                  <option value="iso">Quality Standard (Award / ISO Shield)</option>
                  <option value="solar">Solar Energy (Sun Icon)</option>
                  <option value="food">Commodities (Package / Bulk Food)</option>
                  <option value="freight">Ocean Freight & Truck (Container Logistics)</option>
                </select>
              </div>

              <ImagePickerField 
                label={language === 'en' ? 'Custom Logo Image (Optional)' : 'Sawirka Logoga (Aad rabto)'}
                value={partnerForm.image || ''}
                onChange={(url) => setPartnerForm({ ...partnerForm, image: url })}
                category="Partner Logos"
                mediaItems={mediaItems}
                onUploadNew={addMediaItem}
                language={language}
                onShowToast={showToast}
              />

              <div className="pt-3 border-t border-[#334155] flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="px-4 py-2 border border-[#475569] text-xs font-bold uppercase rounded text-slate-300"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#FFD333] text-[#3D464D] text-xs font-bold uppercase rounded hover:bg-[#E5BE2C]"
                >
                  {t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
