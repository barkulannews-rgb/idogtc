import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Heart, ShoppingCart, ChevronDown, Check, Phone, Mail,
  MapPin, Star, ArrowRight, Truck, RotateCcw,
  Headphones, X, Eye,
  MessageCircle, Menu, Trash2, Plus, Minus, ArrowUp, Globe, Shield,
  Ship, Sun, Award, Anchor, Package, ArrowLeft
} from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AdminPanel } from './components/AdminPanel';
import { Product } from './types/store';
import { I18N } from './data/i18n';
import { productPrice, quoteLabel } from './utils/productPrice';
import { ProductPrice } from './components/ProductPrice';
import { CategoryBrowser } from './components/CategoryBrowser';
import { SiteFooter } from './components/SiteFooter';
import { categoryUrl } from './utils/categoryUrl';
import { getHeaderSettings, headerText, headerWhatsApp } from './data/headerSettings';
import { DATABASE_MODE, reportApiError } from './utils/api';
import { DatabaseStoreProvider } from './context/DatabaseStoreProvider';
import { useStoredState } from './utils/storage';

interface CartItem {
  product: Product;
  quantity: number;
}

// Inner Main Storefront Component
function Storefront() {
  const {
    products: storeProducts,
    slides,
    categories: storeCategories,
    companySettings,
    promoBanners,
    partners,
    language,
    setLanguage,
    recordOrder
  } = useStore();

  // Prioritize the company's imported catalogue; retain older demo items at the end.
  const products = React.useMemo(() => [...storeProducts].sort((a, b) => Number(Boolean(b.catalogueGroup)) - Number(Boolean(a.catalogueGroup))), [storeProducts]);
  const categories = React.useMemo(() => [...storeCategories].sort((a, b) => Number(Boolean(b.catalogueGroup)) - Number(Boolean(a.catalogueGroup))), [storeCategories]);
  const [categoryShuffle] = useState(() => new Map(storeCategories.map(category => [category.id, Math.random()])));
  const categoryCards = React.useMemo(() => [...categories].sort((a, b) =>
    (categoryShuffle.get(a.id) ?? 1) - (categoryShuffle.get(b.id) ?? 1)), [categories, categoryShuffle]);
  const categoryId = new URLSearchParams(window.location.search).get('category');
  const categoryPage = categoryId !== null;
  const currentCategory = categories.find(category => category.id === categoryId);

  const t = I18N[language];
  const header = getHeaderSettings(companySettings);
  const ht = (value: import('./types/store').HeaderText) => headerText(value, language);
  const headerWhatsAppUrl = headerWhatsApp(companySettings, language);

  // E-Commerce Functional State
  const [cartItems, setCartItems] = useStoredState<CartItem[]>('idogtc_cart', [], v => Array.isArray(v) && v.every(item => item && Number.isInteger(item.quantity) && item.quantity > 0 && item.product && Number.isFinite(item.product.id) && Number.isFinite(item.product.numericPrice)));
  const [wishlistItems, setWishlistItems] = useStoredState<Product[]>('idogtc_wishlist', [], v => Array.isArray(v) && v.every(p => p && Number.isFinite(p.id)));
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(() => categoryPage ? currentCategory?.name ?? '' : 'All');
  const [cataloguePage, setCataloguePage] = useState(1);
  const [catalogueGroup, setCatalogueGroup] = useState('All');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // AED is pegged to USD; stored product and order amounts remain in USD.
  const formatPrice = (amount: number) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: selectedCurrency
  }).format(amount * (selectedCurrency === 'AED' ? 3.6725 : 1));
  const formatOldPrice = (price: string) => {
    const amount = Number(price.replace(/[^0-9.]/g, ''));
    return amount > 0 ? formatPrice(amount) : '';
  };

  useEffect(() => {
    setCartItems(previous => previous.flatMap(item => {
      const product = products.find(p => p.id === item.product.id);
      return product && product.available !== false ? [{ ...item, product }] : [];
    }));
    setWishlistItems(previous => previous.flatMap(item => {
      const product = products.find(p => p.id === item.id);
      return product ? [product] : [];
    }));
    if (selectedProduct) setSelectedProduct(products.find(p => p.id === selectedProduct.id) || null);
  }, [products]);

  useEffect(() => {
    if (!categoryPage && selectedCategory !== 'All' && !categories.some(c => c.name === selectedCategory)) setSelectedCategory('All');
  }, [categories, selectedCategory]);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close categories dropdown when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard escape listener to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProduct(null);
        setShowCartDrawer(false);
        setShowWishlistModal(false);
        setCategoryDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll navigation handler
  const scrollToSection = (id: string) => {
    if (id === 'featured') id = 'recent';
    setMobileMenuOpen(false);
    if (categoryPage && id !== 'recent') {
      window.location.assign(`/#${encodeURIComponent(id)}`);
      return;
    }
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -70;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const originalTitle = document.title;
    if (categoryPage) document.title = `${currentCategory?.name || 'Category not found'} | ${companySettings.name}`;
    else if (window.location.hash && window.location.hash !== '#admin') {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    }
    return () => { document.title = originalTitle; };
  }, [categoryId, currentCategory?.name, companySettings.name]);

  useEffect(() => {
    if (slides.length > 0) {
      const slideTimer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, 6000);
      return () => clearInterval(slideTimer);
    }
  }, [slides.length]);

  const displayPrice = (product: Product) => productPrice(product, language, formatPrice);
  useEffect(() => { setCataloguePage(1); }, [searchQuery, selectedCategory, catalogueGroup]);

  // Filtering products according to category or search query
  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryPage ? Boolean(currentCategory && p.category === currentCategory.name) : selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specs.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && (catalogueGroup === 'All' || p.catalogueGroup === catalogueGroup);
  });

  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(cataloguePage, pageCount);
  const showCatalogue = categoryPage || products.some(product => product.catalogueGroup) || products.length > 20;
  const displayRecent = showCatalogue ? filteredProducts.slice((safePage - 1) * pageSize, safePage * pageSize) : filteredProducts.slice(0, 10);

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    if (product.available === false) { showToast(language === 'en' ? 'This product is out of stock.' : 'Alaabtan way dhammaatay.'); return; }
    if (!Number.isInteger(quantity) || quantity < 1) return;
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`${language === 'en' ? 'Added to Cart' : 'Waxaa lagu daray seleda'}: "${product.name}"`);
  };

  const updateCartQuantity = (productId: number, delta: number) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    showToast(language === 'en' ? 'Removed item from cart' : 'Alaabta waa laga saaray seleda');
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.numericPrice * item.quantity), 0);
  const hasQuoteItems = cartItems.some(item => item.product.priceOnRequest);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Wishlist operations
  const toggleWishlist = (product: Product) => {
    setWishlistItems(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        showToast(language === 'en' ? `Removed "${product.name}" from wishlist` : `Waa laga saaray qalbiga: "${product.name}"`);
        return prev.filter(p => p.id !== product.id);
      } else {
        showToast(language === 'en' ? `Saved "${product.name}" to wishlist` : `Waxaa lagu keydiyay qalbiga: "${product.name}"`);
        return [...prev, product];
      }
    });
  };

  const isProductInWishlist = (productId: number) => {
    return wishlistItems.some(p => p.id === productId);
  };

  // Direct WhatsApp order link from Cart and record to admin order store
  const sendWhatsAppOrder = async () => {
    if (cartItems.length === 0) return;
    if (cartItems.some(item => products.find(product => product.id === item.product.id)?.available === false)) { showToast(language === 'en' ? 'Remove out-of-stock products before ordering.' : 'Ka saar alaabta dhammaatay.'); return; }

    const draft = window.open('', '_blank');
    try {
    await recordOrder({
      items: cartItems.map(item => ({
        productName: item.product.name,
        productId: item.product.id, sku: item.product.sku, priceOnRequest: item.product.priceOnRequest,
        quantity: item.quantity,
        price: item.product.price
      })),
      totalAmount: cartTotal,
      hasUnpricedItems: hasQuoteItems,
      status: 'New'
    });

    let message = `Hello ${companySettings.name},\nI would like to place a wholesale order for the following items:\n\n`;
    cartItems.forEach((item, idx) => {
      message += `${idx + 1}. ${item.product.name}${item.product.sku ? ` [${item.product.sku}]` : ''}\n   Quantity: ${item.quantity} | Unit Price: ${displayPrice(item.product)}\n`;
    });
    message += `\nEstimated Total: ${hasQuoteItems ? 'Quotation required for unpriced items' : formatPrice(cartTotal)}\nDelivery Destination: Bosaso / Dubai\nPlease confirm consignment availability.`;

    const phoneClean = (header.whatsappPhone || companySettings.bosasoPhone).replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phoneClean || '252905124444'}?text=${encodeURIComponent(message)}`;
    if (draft) { draft.opener = null; draft.location.href = url; }
    else window.location.href = url;
    } catch (error) { if (draft) draft.close(); reportApiError(error); }
  };

  const activeSlide = slides[currentSlide] || slides[0];

  return (
    <div id="top" className="min-h-screen bg-[#F5F5F5] text-[#6C757D] font-sans antialiased flex flex-col justify-between">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 max-w-[calc(100vw-3rem)] break-words z-50 bg-[#3D464D] text-white px-4 py-2.5 rounded shadow-2xl flex items-center gap-2.5 border-l-4 border-[#FFD333] animate-bounce text-xs sm:text-sm font-medium">
          <Check className="w-4 h-4 text-[#FFD333]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => scrollToSection('top')}
          className="fixed bottom-5 left-5 z-40 bg-[#FFD333] text-[#3D464D] p-2.5 sm:p-3 rounded shadow-2xl hover:bg-[#E5BE2C] transition-all transform hover:scale-110 border border-[#3D464D]"
          title="Back to Top"
        >
          <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      <div>
        {/* ========================================================
            1. TOP BAR (MultiShop Exact Topbar + Language Switcher)
        ======================================================== */}
        <header id="site-header">
        {header.visibility.topBar && <>
          <div className="bg-[#F5F5F5] border-b border-[#E5E5E5] text-xs py-1.5 px-3 sm:px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">

            <div className="flex items-center gap-2 sm:gap-4 text-[#6C757D] text-[11px] truncate">
              {header.topLinks.filter(link => link.visible).map((link, index) => <React.Fragment key={link.id}>
                {index > 0 && <span>|</span>}
                <button onClick={() => scrollToSection(link.target)} className="hover:text-[#FFD333] transition-colors cursor-pointer">{ht(link.label)}</button>
              </React.Fragment>)}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-[11px] text-[#3D464D] min-w-0">
              <a href={`tel:${companySettings.bosasoPhone.replace(/\s+/g, '')}`} className="hidden sm:flex items-center gap-1 font-semibold hover:text-[#D97706]">
                <Phone className="w-3 h-3 text-[#FFD333]" /> {ht(header.labels.bosaso)}: {companySettings.bosasoPhone}
              </a>
              <span className="hidden sm:inline">|</span>
              <a href={`tel:${companySettings.dubaiPhone.replace(/\s+/g, '')}`} className="flex items-center gap-1 font-semibold hover:text-[#D97706]">
                <Phone className="w-3 h-3 text-[#FFD333]" /> {ht(header.labels.dubai)}: {companySettings.dubaiPhone}
              </a>
              <span className="hidden md:inline">|</span>

              {/* Currency Selector */}
              {header.visibility.currency && (<select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="bg-transparent text-[11px] font-semibold text-[#3D464D] border-none focus:outline-none cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="AED">AED (د.إ)</option>
              </select>)}

              <span className="text-slate-400">|</span>

              {/* Language Switcher Toggle (English Default) */}
              {header.visibility.language && (<div className="flex items-center gap-1 bg-white border border-[#CED4DA] px-2 py-0.5 rounded shadow-2xs">
                <Globe className="w-3 h-3 text-[#FFD333]" />
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${language === 'en' ? 'bg-[#FFD333] text-[#3D464D]' : 'text-[#6C757D] hover:text-[#3D464D]'}`}
                  title="English (Default)"
                >
                  EN
                </button>
                <span className="text-slate-300">/</span>
                <button
                  onClick={() => setLanguage('so')}
                  className={`px-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${language === 'so' ? 'bg-[#FFD333] text-[#3D464D]' : 'text-[#6C757D] hover:text-[#3D464D]'}`}
                  title="Af Soomaali"
                >
                  SO
                </button>
              </div>)}

            </div>

          </div>
        </div>

            </>}
                    {/* ========================================================
            2. MIDDLE LOGO & SEARCH BAR (Compact & Clean on Mobile)
        ======================================================== */}
        <div className="bg-white py-2.5 sm:py-4 px-3 sm:px-4 border-b border-[#E5E5E5]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">

            {/* Top row in mobile: Logo + Wishlist/Cart + Hamburger */}
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => scrollToSection('top')}>
                {header.visibility.logo && (<div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full p-0.5 sm:p-1 bg-[#FFD333] shadow-sm shrink-0">
                  <img
                    src={header.image}
                    alt={header.logoAlt}
                    className="w-full h-full object-contain rounded-full bg-white p-0.5"
                  />
                </div>)}
                <div>
                  {header.visibility.brand && (<div className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-[#3D464D] flex items-center leading-none">
                    <span className="bg-[#3D464D] text-[#FFD333] px-1.5 py-0.5 mr-1 font-extrabold rounded-sm">{header.brandPrimary}</span>
                    <span>{header.brandSecondary}</span>
                  </div>)}
                  <span className="block text-[9px] sm:text-[10px] md:text-[11px] font-medium tracking-wider text-[#6C757D] uppercase mt-0.5">
                    General Trading Co. • Bosaso & Dubai
                  </span>
                </div>
              </div>

              {/* Mobile Right Action Buttons (Wishlist + Cart Drawers) */}
              <div className="flex items-center gap-1.5 md:hidden">
                {header.visibility.wishlist && (<button
                  onClick={() => setShowWishlistModal(true)}
                  className="p-1.5 border border-[#ced4da] text-[#3D464D] rounded relative bg-white hover:border-[#FFD333] transition-colors"
                  title={ht(header.labels.wishlist)}
                  aria-label={ht(header.labels.wishlist)}
                >
                  <Heart className={`w-4 h-4 ${wishlistItems.length > 0 ? 'text-[#D97706] fill-[#FFD333]' : ''}`} />
                  <span className="absolute -top-1.5 -right-1.5 bg-[#FFD333] text-[#3D464D] rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold">
                    {wishlistItems.length}
                  </span>
                </button>)}

                {header.visibility.cart && (<button
                  onClick={() => setShowCartDrawer(true)}
                  className="p-1.5 border border-[#ced4da] text-[#3D464D] rounded relative bg-white hover:border-[#FFD333] transition-colors"
                  title={ht(header.labels.cart)}
                  aria-label={ht(header.labels.cart)}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="absolute -top-1.5 -right-1.5 bg-[#FFD333] text-[#3D464D] rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold">
                    {totalCartCount}
                  </span>
                </button>)}

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1.5 text-[#3D464D] border border-[#ced4da] rounded hover:bg-[#F5F5F5]"
                  aria-label="Toggle Navigation"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Search Box */}
            {header.visibility.search && <>
            <div className="w-full md:w-1/2 flex items-stretch">
              <input
                type="text"
                placeholder={ht(header.labels.search)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 sm:py-2.5 border border-[#ced4da] rounded-l text-xs sm:text-sm focus:outline-none focus:border-[#FFD333] font-normal"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2 border-y border-[#ced4da] text-[#6C757D] hover:text-[#3D464D] bg-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => {
                  if (searchQuery.trim()) {
                    scrollToSection('recent');
                    showToast(`${t.search}: "${searchQuery}"`);
                  }
                }}
                className="bg-[#FFD333] text-[#3D464D] px-4 sm:px-5 rounded-r font-bold hover:bg-[#E5BE2C] transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            </>}
                        {/* Desktop Customer Service & Cart Lockup */}
            <div className="hidden md:flex items-center justify-end gap-6">
              {header.visibility.customerService && (<div className="text-left hidden lg:block">
                <span className="block text-xs text-[#6C757D] font-normal">{ht(header.labels.customerService)}:</span>
                <span className="block text-sm font-bold text-[#3D464D] font-mono">{header.customerServicePhone || companySettings.bosasoPhone}</span>
              </div>)}

              <div className="flex items-center gap-3">
                {header.visibility.wishlist && (<button
                  onClick={() => setShowWishlistModal(true)}
                  className="p-2.5 border border-[#ced4da] text-[#3D464D] hover:text-[#D97706] hover:border-[#FFD333] rounded relative bg-white transition-colors cursor-pointer"
                  title={ht(header.labels.wishlist)}
                >
                  <Heart className={`w-4 h-4 ${wishlistItems.length > 0 ? 'text-[#D97706] fill-[#FFD333]' : ''}`} />
                  <span className="absolute -top-2 -right-2 bg-[#FFD333] text-[#3D464D] rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold">
                    {wishlistItems.length}
                  </span>
                </button>)}

                {header.visibility.cart && (<button
                  onClick={() => setShowCartDrawer(true)}
                  className="p-2.5 border border-[#ced4da] text-[#3D464D] hover:text-[#FFD333] hover:border-[#FFD333] rounded relative bg-white transition-colors cursor-pointer"
                  title={ht(header.labels.cart)}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="absolute -top-2 -right-2 bg-[#FFD333] text-[#3D464D] rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold">
                    {totalCartCount}
                  </span>
                </button>)}
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================
            3. MAIN NAVIGATION BAR (Responsive & Smooth Drawer)
        ======================================================== */}
        <div className="bg-[#3D464D] text-white relative z-30">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-stretch">

            {/* Categories Dropdown Toggle with Outside Click Listener */}
            {header.visibility.categories && <>
            <div ref={categoryDropdownRef} className="relative md:w-64 shrink-0">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="w-full bg-[#FFD333] text-[#3D464D] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between font-bold text-xs sm:text-sm uppercase tracking-wider shadow-sm hover:bg-[#E5BE2C] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Menu className="w-4 h-4" />
                  <span>{ht(header.labels.categories)}</span>
                </span>
                <ChevronDown className={`w-4 h-4 transform transition-transform duration-300 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Items */}
              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 w-full bg-white text-[#3D464D] shadow-2xl z-40 border border-[#E5E5E5] py-2 max-h-96 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setCategoryDropdownOpen(false);
                      scrollToSection('recent');
                    }}
                    className={`w-full text-left px-5 py-2.5 text-xs font-semibold hover:bg-[#F5F5F5] flex items-center justify-between cursor-pointer ${selectedCategory === 'All' ? 'text-[#FFD333] font-bold bg-[#F5F5F5]' : ''}`}
                  >
                    <span>{ht(header.labels.allCategories)}</span>
                    <span className="text-[10px] text-[#6C757D]">{products.length} Products</span>
                  </button>
                  {categories.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        window.location.assign(categoryUrl(c.id));
                      }}
                      className={`w-full text-left px-5 py-2.5 text-xs font-semibold hover:bg-[#F5F5F5] flex items-center justify-between border-t border-[#F0F0F0] cursor-pointer ${selectedCategory === c.name ? 'text-[#D97706] font-bold bg-[#FFFBEB]' : ''}`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] text-[#6C757D]">{products.filter(product => product.category === c.name).length} {language === 'en' ? 'Products' : 'Alaab'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            </>}
                        {/* Desktop Navigation Menu */}
            <nav className="hidden md:flex flex-1 min-w-0 flex-wrap items-center px-4 text-sm font-semibold uppercase tracking-wider gap-x-6 gap-y-0 text-[#E5E5E5]">
              {header.navigation.filter(link => link.visible && link.target !== 'featured').map(link => <button key={link.id} onClick={() => scrollToSection(link.target)} className={link.target === 'top' ? 'text-[#FFD333] py-4 border-b-2 border-[#FFD333] cursor-pointer' : 'py-4 hover:text-[#FFD333] transition-colors cursor-pointer'}>{ht(link.label)}</button>)}
            </nav>

            {/* Direct WhatsApp Quote Button */}
            {header.visibility.whatsapp && <>
            <div className="hidden lg:flex items-center gap-3 py-2">
              <a
                href={headerWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#1EBE5D] transition-colors flex items-center gap-1.5 shadow"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{ht(header.labels.whatsapp)}</span>
              </a>
            </div></>}

          </div>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-[#2D343A] border-t border-[#4A5568] px-4 py-3 space-y-2.5 text-xs font-semibold uppercase animate-fadeIn">
              <div className="grid grid-cols-2 gap-2 text-[#E5E5E5]">
                {header.navigation.filter(link => link.visible && link.target !== 'featured').map(link => <button key={link.id} onClick={() => scrollToSection(link.target)} className={link.target === 'top' ? 'text-[#FFD333] p-2 bg-[#3D464D] rounded text-center' : 'hover:text-[#FFD333] p-2 bg-[#3D464D] rounded text-center'}>{ht(link.label)}</button>)}
              </div>

              {header.visibility.language && <>
              {/* Language Switcher in Mobile Drawer */}
              <div className="flex items-center justify-between bg-[#1E293B] p-2 rounded text-xs">
                <span className="text-[#94A3B8] font-bold">Language / Luuqadda:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-0.5 rounded text-xs font-bold ${language === 'en' ? 'bg-[#FFD333] text-[#3D464D]' : 'text-[#E5E5E5]'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('so')}
                    className={`px-2 py-0.5 rounded text-xs font-bold ${language === 'so' ? 'bg-[#FFD333] text-[#3D464D]' : 'text-[#E5E5E5]'}`}
                  >
                    Af Soomaali
                  </button>
                </div>
              </div>

              </>}
              {header.visibility.whatsapp && (<div className="pt-2 border-t border-[#4A5568] flex flex-col gap-2">
                <a
                  href={headerWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] text-white py-2 px-3 rounded text-[11px] font-bold uppercase text-center flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{ht(header.labels.whatsapp)}</span>
                </a>
              </div>)}
            </div>
          )}
        </div>

        </header>

        {!categoryPage && <>
        {/* ========================================================
            4. HERO CAROUSEL & 2 PROMO BANNERS
        ======================================================== */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

            {/* Main Interactive Carousel */}
            {activeSlide && (
              <div className="lg:col-span-8 relative bg-[#3D464D] rounded overflow-hidden min-h-[300px] sm:min-h-[380px] md:min-h-[420px] flex items-center p-5 sm:p-10 md:p-14 text-white shadow-md">
                <img
                  src={activeSlide.image}
                  alt="Slider Cargo"
                  className="absolute inset-0 w-full h-full object-cover opacity-35 transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30"></div>

                <div className="relative z-10 max-w-xl space-y-2 sm:space-y-4">
                  <span className="inline-block bg-[#FFD333] text-[#3D464D] text-[10px] sm:text-xs font-extrabold uppercase px-2.5 py-0.5 sm:px-3 sm:py-1 rounded tracking-wider shadow">
                    {activeSlide.badge}
                  </span>

                  <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold uppercase tracking-tight leading-tight text-white drop-shadow">
                    {activeSlide.title}
                  </h1>

                  <p className="text-[11px] sm:text-sm font-semibold text-[#FFD333] uppercase tracking-wider font-mono">
                    {activeSlide.offer}
                  </p>

                  <p className="text-[11px] sm:text-sm text-[#E5E5E5] leading-relaxed font-normal line-clamp-3 sm:line-clamp-none">
                    {activeSlide.desc}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <button
                      onClick={() => scrollToSection('recent')}
                      className="bg-[#FFD333] text-[#3D464D] font-extrabold text-[11px] sm:text-xs uppercase px-4 py-2 sm:px-6 sm:py-3 rounded hover:bg-[#E5BE2C] transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{t.shopNow}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => scrollToSection('about')}
                      className="bg-transparent border border-white sm:border-2 text-white font-bold text-[11px] sm:text-xs uppercase px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded hover:bg-white hover:text-[#3D464D] transition-colors cursor-pointer"
                    >
                      {t.aboutUs}
                    </button>
                  </div>
                </div>

                {/* Slider Controls */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
                    className="w-7 h-7 sm:w-9 sm:h-9 bg-black/60 text-white hover:bg-[#FFD333] hover:text-[#3D464D] flex items-center justify-center rounded transition-colors cursor-pointer"
                    aria-label="Previous Slide"
                  >
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 rotate-90" />
                  </button>
                  <button
                    onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
                    className="w-7 h-7 sm:w-9 sm:h-9 bg-black/60 text-white hover:bg-[#FFD333] hover:text-[#3D464D] flex items-center justify-center rounded transition-colors cursor-pointer"
                    aria-label="Next Slide"
                  >
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 -rotate-90" />
                  </button>
                </div>

                {/* Indicators */}
                <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-8 z-20 flex gap-1">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${currentSlide === i ? 'w-5 sm:w-6 bg-[#FFD333]' : 'w-1.5 sm:w-2 bg-white/50'}`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2 Special Offer Promos on Right */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">

              <div className="relative bg-[#1E293B] rounded overflow-hidden p-5 sm:p-6 text-white flex flex-col justify-end min-h-[160px] sm:min-h-[190px] border border-[#334155] shadow-sm group">
                <img
                  src="/images/bosaso_port_trade_1793690293064.jpg"
                  alt="Bosaso Port"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="relative z-10 space-y-1 sm:space-y-2">
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#FFD333] uppercase">{t.save15Bulk}</span>
                  <h3 className="text-lg sm:text-xl font-bold uppercase">{t.bosasoClearance}</h3>
                  <p className="text-[11px] sm:text-xs text-[#CBD5E1] font-normal">{t.bosasoHq}: {companySettings.bosasoPhone}</p>
                  <button onClick={() => scrollToSection('recent')} className="inline-block bg-[#FFD333] text-[#3D464D] text-[10px] sm:text-xs font-bold px-3 py-1 sm:px-4 sm:py-1.5 rounded uppercase hover:bg-[#E5BE2C] transition-colors shadow cursor-pointer">
                    {t.shopNow}
                  </button>
                </div>
              </div>

              <div className="relative bg-[#1E293B] rounded overflow-hidden p-5 sm:p-6 text-white flex flex-col justify-end min-h-[160px] sm:min-h-[190px] border border-[#334155] shadow-sm group">
                <img
                  src="/images/dubai_trade_hub_1793690293266.jpg"
                  alt="Dubai Logistics"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="relative z-10 space-y-1 sm:space-y-2">
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#FFD333] uppercase">{t.factoryDirect}</span>
                  <h3 className="text-lg sm:text-xl font-bold uppercase">{t.dubaiTradingOffice}</h3>
                  <p className="text-[11px] sm:text-xs text-[#CBD5E1] font-normal">{t.dubaiHub}: {companySettings.dubaiPhone}</p>
                  <button onClick={() => scrollToSection('recent')} className="inline-block bg-[#FFD333] text-[#3D464D] text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded uppercase hover:bg-[#E5BE2C] transition-colors shadow cursor-pointer">
                    {t.shopNow}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ========================================================
            5. FOUR VALUE PROPOSITION TILES
        ======================================================== */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">

            <div className="bg-white p-3.5 sm:p-6 shadow-sm flex items-center gap-2.5 sm:gap-4 border border-[#E5E5E5] hover:border-[#FFD333] transition-colors">
              <Check className="w-7 h-7 sm:w-10 sm:h-10 text-[#FFD333] shrink-0" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#3D464D] uppercase">{t.qualityProduct}</h4>
                <p className="text-[10px] sm:text-xs text-[#6C757D] font-normal truncate">{t.guaranteed100}</p>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-6 shadow-sm flex items-center gap-2.5 sm:gap-4 border border-[#E5E5E5] hover:border-[#FFD333] transition-colors">
              <Truck className="w-7 h-7 sm:w-10 sm:h-10 text-[#FFD333] shrink-0" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#3D464D] uppercase">{t.freeShipping}</h4>
                <p className="text-[10px] sm:text-xs text-[#6C757D] font-normal truncate">{t.portOffload}</p>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-6 shadow-sm flex items-center gap-2.5 sm:gap-4 border border-[#E5E5E5] hover:border-[#FFD333] transition-colors">
              <RotateCcw className="w-7 h-7 sm:w-10 sm:h-10 text-[#FFD333] shrink-0" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#3D464D] uppercase">{t.return14Day}</h4>
                <p className="text-[10px] sm:text-xs text-[#6C757D] font-normal truncate">{t.complianceChecked}</p>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-6 shadow-sm flex items-center gap-2.5 sm:gap-4 border border-[#E5E5E5] hover:border-[#FFD333] transition-colors">
              <Headphones className="w-7 h-7 sm:w-10 sm:h-10 text-[#FFD333] shrink-0" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#3D464D] uppercase">{t.support247}</h4>
                <p className="text-[10px] sm:text-xs text-[#6C757D] font-normal truncate">{t.directPhoneLine}</p>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================
            6. CATEGORIES SECTION (Live Data from StoreContext)
        ======================================================== */}
        <section id="categories" className="max-w-7xl mx-auto px-3 sm:px-4 pt-8 sm:pt-12 pb-4 sm:pb-6 scroll-mt-20">
          <CategoryBrowser categories={categoryCards} products={products} language={language} selected={selectedCategory} />
        </section>

        {/* ========================================================
            8. 2 MID-PAGE PROMOTIONAL OFFER BANNERS (DYNAMIC)
        ======================================================== */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {promoBanners.map((b) => {
              const badgeText = language === 'so' && b.badgeSo ? b.badgeSo : b.badge;
              const titleText = language === 'so' && b.titleSo ? b.titleSo : b.title;
              const descText = language === 'so' && b.descriptionSo ? b.descriptionSo : b.description;
              const btnText = language === 'so' && b.buttonTextSo ? b.buttonTextSo : b.buttonText;
              return (
                <div
                  key={b.id}
                  className="relative bg-[#3D464D] text-white p-6 sm:p-10 rounded overflow-hidden flex flex-col justify-center min-h-[220px] sm:min-h-[250px] shadow border border-[#4A5568] group hover:border-[#FFD333] transition-all"
                >
                  <img
                    src={b.image}
                    alt={titleText}
                    className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30"></div>

                  <div className="relative z-10 space-y-2 max-w-sm">
                    <span className="text-[10px] sm:text-xs font-bold font-mono text-[#FFD333] uppercase bg-black/50 px-2.5 py-0.5 rounded border border-[#FFD333]/30 inline-block shadow-xs">
                      {badgeText}
                    </span>
                    <h3 className="text-lg sm:text-2xl font-extrabold uppercase tracking-tight text-white drop-shadow">
                      {titleText}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#E5E5E5] leading-relaxed font-normal">
                      {descText}
                    </p>
                    <button
                      onClick={() => scrollToSection(b.buttonLink || 'about')}
                      className="inline-block bg-[#FFD333] text-[#3D464D] font-bold text-xs uppercase px-4 py-1.5 sm:px-5 sm:py-2 rounded hover:bg-[#E5BE2C] transition-colors shadow cursor-pointer mt-1"
                    >
                      {btnText}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        </>}

        {/* ========================================================
            9. RECENT PRODUCTS GRID
        ======================================================== */}
        <section id="recent" className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-4 sm:pb-6 scroll-mt-20">
          {categoryPage ? <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 my-4 sm:my-6">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-4">
              <a href="/" className="hover:underline">{language === 'en' ? 'Home' : 'Bogga hore'}</a><span aria-hidden="true">/</span>
              <a href="/#categories" className="hover:underline">{t.categoriesTitle}</a><span aria-hidden="true">/</span>
              <span aria-current="page">{currentCategory?.name || (language === 'en' ? 'Category not found' : 'Qaybta lama helin')}</span>
            </nav>
            <h1 className="text-xl sm:text-3xl font-extrabold text-[#3D464D]">{currentCategory?.name || (language === 'en' ? 'Category not found' : 'Qaybta lama helin')}</h1>
            <p className="mt-2 text-sm text-slate-600">{language === 'en' ? 'Browse products in this category and request a quote.' : 'Eeg alaabta qaybtan oo codso qiimaheeda.'}</p>
            <a href="/#categories" className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-slate-700 hover:underline"><ArrowLeft size={16} />{language === 'en' ? 'Browse categories' : 'Eeg qaybaha kale'}</a>
          </div> : <h2 className="section-title text-lg sm:text-2xl text-[#3D464D]">
            <span>{showCatalogue ? (language === 'en' ? 'Product Catalogue' : 'Kaatalogga Alaabta') : t.recentTitle}</span>
          </h2>}

          {showCatalogue && <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
            <span role="status">{filteredProducts.length} {language === 'en' ? 'products' : 'alaab'}</span>
            {categoryPage ? <label className="relative flex-1 min-w-0 max-w-md ml-auto"><span className="sr-only">{language === 'en' ? 'Search this category' : 'Ka raadi qaybtan'}</span><input type="search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder={language === 'en' ? 'Search this category...' : 'Ka raadi qaybtan...'} className="w-full bg-white border border-slate-300 p-3 rounded-lg text-sm" /></label> : <>
            <select aria-label="Catalogue group" value={catalogueGroup} onChange={event => { setCatalogueGroup(event.target.value); setSelectedCategory('All'); }} className="bg-white border border-[#CED4DA] p-2 rounded max-w-full">
              <option value="All">{language === 'en' ? 'All departments' : 'Dhammaan waaxyaha'}</option>
              <option value="Building Materials">Building Materials</option><option value="Paints & Coatings">Paints &amp; Coatings</option>
            </select>
            <select aria-label="Catalogue category" value={selectedCategory} onChange={event => setSelectedCategory(event.target.value)} className="bg-white border border-[#CED4DA] p-2 rounded max-w-full">
              <option value="All">{t.allCategories}</option>{categories.filter(category => catalogueGroup === 'All' || category.catalogueGroup === catalogueGroup).map(category => <option key={category.id} value={category.name}>{category.name}</option>)}
            </select>
            </>}
          </div>}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-4">
            {displayRecent.map((p) => {
              const inWishlist = isProductInWishlist(p.id);
              return (
                <div
                  key={p.id}
                  className="product-item bg-white shadow-sm border border-[#E5E5E5] rounded-sm overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative overflow-hidden aspect-[4/3] bg-[#F5F5F5]">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy" className="w-full h-full object-cover transition-transform duration-500"
                    />

                    {p.imageIsIllustration && <span className="absolute bottom-1 left-1 z-10 bg-white/90 text-[#6C757D] text-[9px] px-1.5 py-0.5 rounded">{language === 'en' ? 'Illustration' : 'Sawir tusaale ah'}</span>}

                    <div className="product-action flex items-center justify-center gap-1.5 sm:gap-2">
                      <button
                        disabled={p.available === false}
                        onClick={() => addToCart(p, 1)}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-white text-[#3D464D] hover:bg-[#FFD333] hover:text-[#3D464D] flex items-center justify-center rounded shadow transition-colors cursor-pointer"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => toggleWishlist(p)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 bg-white flex items-center justify-center rounded shadow transition-colors cursor-pointer ${inWishlist ? 'text-[#D97706] bg-[#FFFBEB]' : 'text-[#3D464D] hover:bg-[#FFD333] hover:text-[#3D464D]'}`}
                        title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${inWishlist ? 'fill-[#FFD333]' : ''}`} />
                      </button>
                      <button
                        onClick={() => { setSelectedProduct(p); setModalQuantity(1); }}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-white text-[#3D464D] hover:bg-[#FFD333] hover:text-[#3D464D] flex items-center justify-center rounded shadow transition-colors cursor-pointer"
                        title={t.quickView}
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-2 sm:p-3 text-center space-y-1 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-[#6C757D] uppercase block font-normal truncate">{p.category}</span>
                      <h3
                        onClick={() => { setSelectedProduct(p); setModalQuantity(1); }}
                        className="font-bold text-xs sm:text-[13px] text-[#3D464D] hover:text-[#D97706] transition-colors cursor-pointer line-clamp-2 mt-0.5 leading-snug min-h-[2rem] sm:min-h-[2.4rem]"
                      >
                        {p.name}
                      </h3>
                      {p.sku && <p className="text-[10px] text-[#6C757D] font-mono">{p.sku}{p.unit ? ` | ${p.unit}` : ''}</p>}
                    </div>

                    <div className="pt-1.5 sm:pt-2">
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-base font-bold text-[#3D464D]"><ProductPrice product={p} company={companySettings} language={language} format={formatPrice} quantity={1} /></span>
                        <span className="text-[10px] sm:text-xs text-[#6C757D] line-through font-normal">{!p.priceOnRequest && formatOldPrice(p.oldPrice)}</span>
                      </div>

                      {p.reviews > 0 && (<div className="flex items-center justify-center gap-0.5 mt-0.5 text-[#FFD333]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < p.rating ? 'fill-current' : 'text-[#ced4da]'}`} />
                        ))}
                        <span className="text-[9px] sm:text-[10px] text-[#6C757D] ml-0.5 font-normal">({p.reviews})</span>
                      </div>)}

                      <div className="mt-1.5 sm:mt-2.5 flex items-center gap-1 sm:gap-1.5">
                        <button
                          disabled={p.available === false}
                        onClick={() => addToCart(p, 1)}
                          className="flex-1 bg-[#3D464D] text-white hover:bg-[#FFD333] hover:text-[#3D464D] py-1.5 text-[9px] sm:text-[11px] font-bold uppercase transition-colors rounded flex items-center justify-center gap-1 shadow cursor-pointer truncate"
                        >
                          <ShoppingCart className="w-3 h-3 shrink-0" />
                          <span className="truncate">{t.addCart}</span>
                        </button>
                        <button
                          onClick={() => toggleWishlist(p)}
                          className={`p-1.5 border rounded cursor-pointer transition-colors shrink-0 ${inWishlist ? 'border-[#FFD333] bg-[#FFFBEB] text-[#D97706]' : 'border-[#CED4DA] bg-white text-[#3D464D] hover:border-[#FFD333]'}`}
                          title={t.wishlist}
                        >
                          <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${inWishlist ? 'fill-[#FFD333]' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
                  {showCatalogue && filteredProducts.length === 0 && <p className="bg-white p-6 text-center text-sm">{t.noProductsFound}</p>}
          {showCatalogue && pageCount > 1 && <nav aria-label="Catalogue pagination" className="flex flex-wrap items-center justify-center gap-3 mt-5 text-xs">
            <button disabled={safePage <= 1} onClick={() => { setCataloguePage(safePage - 1); scrollToSection('recent'); }} className="bg-[#FFD333] text-[#3D464D] px-4 py-2 rounded font-bold disabled:opacity-40">{language === 'en' ? 'Previous' : 'Hore'}</button>
            <label>{language === 'en' ? 'Page' : 'Bogga'} <select aria-label="Catalogue page" value={safePage} onChange={event => { setCataloguePage(Number(event.target.value)); scrollToSection('recent'); }} className="bg-white border p-2 rounded">{Array.from({length: pageCount}, (_, index) => <option key={index} value={index + 1}>{index + 1}</option>)}</select> / {pageCount}</label>
            <button disabled={safePage >= pageCount} onClick={() => { setCataloguePage(safePage + 1); scrollToSection('recent'); }} className="bg-[#FFD333] text-[#3D464D] px-4 py-2 rounded font-bold disabled:opacity-40">{language === 'en' ? 'Next' : 'Xiga'}</button>
          </nav>}
        </section>

        {!categoryPage && <>
        {/* ========================================================
            10. VENDOR / PARTNERS BEAUTIFIED STRIP
        ======================================================== */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#3D464D] flex items-center justify-center gap-2">
              <span className="w-8 sm:w-12 h-[2px] bg-[#FFD333]"></span>
              <span>{language === 'en' ? 'Global Port & Logistics Partners' : 'Wadaagayaasha Dekadaha & Logistikada'}</span>
              <span className="w-8 sm:w-12 h-[2px] bg-[#FFD333]"></span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {partners.map((partner) => {
              const tagText = language === 'so' && partner.tagSo ? partner.tagSo : partner.tag;
              const getIcon = (type?: string) => {
                switch (type) {
                  case 'port': return <Ship className="w-5 h-5 sm:w-6 sm:h-6" />;
                  case 'globe': return <Globe className="w-5 h-5 sm:w-6 sm:h-6" />;
                  case 'iso': return <Award className="w-5 h-5 sm:w-6 sm:h-6" />;
                  case 'solar': return <Sun className="w-5 h-5 sm:w-6 sm:h-6" />;
                  case 'food': return <Package className="w-5 h-5 sm:w-6 sm:h-6" />;
                  case 'freight': return <Truck className="w-5 h-5 sm:w-6 sm:h-6" />;
                  default: return <Anchor className="w-5 h-5 sm:w-6 sm:h-6" />;
                }
              };

              return (
                <div
                  key={partner.id}
                  className="bg-white p-3.5 sm:p-5 border border-[#E5E5E5] text-center rounded-xl flex flex-col items-center justify-between shadow-xs hover:shadow-lg hover:border-[#FFD333] transition-all duration-300 group hover:-translate-y-1"
                >
                  {partner.image ? (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden mb-2.5 bg-[#F8FAFC] border border-[#E2E8F0] p-1 flex items-center justify-center shadow-xs">
                      <img src={partner.image} alt={partner.name} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#1E293B] text-[#FFD333] flex items-center justify-center mb-2.5 shadow-md group-hover:bg-[#FFD333] group-hover:text-[#3D464D] transition-colors duration-300">
                      {getIcon(partner.iconType)}
                    </div>
                  )}

                  <div>
                    <span className="font-black text-xs sm:text-[13px] text-[#3D464D] tracking-wider uppercase block group-hover:text-[#D97706] transition-colors">
                      {partner.name}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-[#6C757D] mt-1 block font-semibold uppercase tracking-tight">
                      {tagText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            11. ABOUT US & CORPORATE PROFILE
        ======================================================== */}
        <section id="about" className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 scroll-mt-20">
          <div className="bg-white p-5 sm:p-8 md:p-12 border border-[#E5E5E5] shadow-sm rounded">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">

              <div className="lg:col-span-8 space-y-3 sm:space-y-4">
                <h2 className="section-title text-lg sm:text-2xl text-[#3D464D] mb-4">
                  <span>{t.aboutUs}</span>
                </h2>

                <h3 className="text-lg sm:text-xl font-bold text-[#3D464D] uppercase">
                  {companySettings.name}
                </h3>

                <p className="text-xs sm:text-sm text-[#6C757D] leading-relaxed font-normal">
                  {companySettings.aboutText}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 pt-1 sm:pt-2 text-[11px] sm:text-xs font-semibold text-[#3D464D]">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#FFD333] shrink-0" />
                    <span>{language === 'en' ? 'Headquarter (HQ): Bosaso, Puntland, Somalia' : 'Xarunta Guud (HQ): Boosaaso, Puntland, Soomaaliya'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#FFD333] shrink-0" />
                    <span>{language === 'en' ? 'Regional Hub: Dubai, United Arab Emirates' : 'Xarunta Gobolka: Dubai, United Arab Emirates'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#FFD333] shrink-0" />
                    <span>{t.somaliaPhone}: {companySettings.bosasoPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#FFD333] shrink-0" />
                    <span>{t.dubaiPhone}: {companySettings.dubaiPhone}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center">
                <div className="p-4 sm:p-6 bg-[#F5F5F5] rounded border border-[#E5E5E5] text-center space-y-2.5 sm:space-y-3 max-w-xs w-full shadow-inner">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full p-1 bg-[#FFD333] shadow">
                    <img
                      src={header.image}
                      alt="IDO GTC Seal"
                      className="w-full h-full object-contain rounded-full bg-white p-1.5"
                    />
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#3D464D] uppercase">{companySettings.name}</h4>
                  <p className="text-[10px] sm:text-[11px] text-[#6C757D] font-mono">idogtc.com • Registered Global Trade</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================
            12. CONTACT & DIRECTORY SECTION
        ======================================================== */}
        <section id="contact" className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 scroll-mt-20">
          <h2 className="section-title text-lg sm:text-2xl text-[#3D464D]">
            <span>{t.contactUs}</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

            {/* Bosaso HQ Card */}
            <div className="bg-white p-5 sm:p-8 border border-[#E5E5E5] shadow-sm space-y-3 sm:space-y-4 rounded-sm">
              <div className="flex items-center justify-between">
                <span className="bg-[#FFD333] text-[#3D464D] font-bold text-[10px] sm:text-xs px-2.5 py-1 uppercase rounded">
                  {language === 'en' ? 'Headquarter (HQ)' : 'Xarunta Guud (HQ)'}
                </span>
                <span className="text-[11px] sm:text-xs font-mono text-[#6C757D]">Puntland, Somalia</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-[#3D464D] uppercase">Bosaso, Puntland, Somalia</h3>
              <p className="text-xs text-[#6C757D] font-normal">
                {companySettings.bosasoAddress}
              </p>

              <div className="space-y-1.5 sm:space-y-2 text-xs font-mono text-[#3D464D] pt-1">
                <p className="flex items-center justify-between border-b border-[#F0F0F0] pb-1">
                  <span className="text-[#6C757D]">{language === 'en' ? 'Phone / WhatsApp:' : 'Taleefan / WhatsApp:'}</span>
                  <span className="font-bold text-[#1E293B]">{companySettings.bosasoPhone}</span>
                </p>
                <p className="flex items-center justify-between border-b border-[#F0F0F0] pb-1">
                  <span className="text-[#6C757D]">Email:</span>
                  <span className="font-bold text-[#D97706] truncate ml-2">{companySettings.email}</span>
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <a
                  href={`https://wa.me/${companySettings.bosasoPhone.replace(/[^0-9]/g, '') || '252905124444'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#25D366] text-white py-2 sm:py-2.5 px-3 rounded text-xs font-bold uppercase text-center hover:bg-[#1EBE5D] transition-colors flex items-center justify-center gap-1.5 shadow"
                >
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>WhatsApp Bosaso</span>
                </a>
                <a
                  href={`tel:${companySettings.bosasoPhone.replace(/\s+/g, '')}`}
                  className="bg-[#3D464D] text-white py-2 sm:py-2.5 px-3 rounded text-xs font-bold uppercase text-center hover:bg-[#FFD333] hover:text-[#3D464D] transition-colors flex items-center justify-center gap-1.5 font-mono shadow"
                >
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Call HQ</span>
                </a>
              </div>
            </div>

            {/* Dubai Hub Card */}
            <div className="bg-white p-5 sm:p-8 border border-[#E5E5E5] shadow-sm space-y-3 sm:space-y-4 rounded-sm">
              <div className="flex items-center justify-between">
                <span className="bg-[#FFD333] text-[#3D464D] font-bold text-[10px] sm:text-xs px-2.5 py-1 uppercase rounded">
                  {language === 'en' ? 'Regional Trading Hub' : 'Xarunta Gobolka'}
                </span>
                <span className="text-[11px] sm:text-xs font-mono text-[#6C757D]">United Arab Emirates</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-[#3D464D] uppercase">Dubai, United Arab Emirates</h3>
              <p className="text-xs text-[#6C757D] font-normal">
                {companySettings.dubaiAddress}
              </p>

              <div className="space-y-1.5 sm:space-y-2 text-xs font-mono text-[#3D464D] pt-1">
                <p className="flex items-center justify-between border-b border-[#F0F0F0] pb-1">
                  <span className="text-[#6C757D]">{language === 'en' ? 'Phone / WhatsApp:' : 'Taleefan / WhatsApp:'}</span>
                  <span className="font-bold text-[#1E293B]">{companySettings.dubaiPhone}</span>
                </p>
                <p className="flex items-center justify-between border-b border-[#F0F0F0] pb-1">
                  <span className="text-[#6C757D]">Email:</span>
                  <span className="font-bold text-[#D97706] truncate ml-2">{companySettings.email}</span>
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <a
                  href={`https://wa.me/${companySettings.dubaiPhone.replace(/[^0-9]/g, '') || '971501507332'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#25D366] text-white py-2 sm:py-2.5 px-3 rounded text-xs font-bold uppercase text-center hover:bg-[#1EBE5D] transition-colors flex items-center justify-center gap-1.5 shadow"
                >
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>WhatsApp Dubai</span>
                </a>
                <a
                  href={`tel:${companySettings.dubaiPhone.replace(/\s+/g, '')}`}
                  className="bg-[#3D464D] text-white py-2 sm:py-2.5 px-3 rounded text-xs font-bold uppercase text-center hover:bg-[#FFD333] hover:text-[#3D464D] transition-colors flex items-center justify-center gap-1.5 font-mono shadow"
                >
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Call Dubai</span>
                </a>
              </div>
            </div>

          </div>
        </section>

        </>}
      </div>

      {/* ========================================================
          13. FOOTER
      ======================================================== */}
      <SiteFooter cartCount={totalCartCount} wishlistCount={wishlistItems.length} onCart={() => setShowCartDrawer(true)} onWishlist={() => setShowWishlistModal(true)} onToast={showToast} />

      {/* ========================================================
          14. SHOPPING CART DRAWER
      ======================================================== */}
      {showCartDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn"
          onClick={() => setShowCartDrawer(false)}
        >
          <div
            className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-4 sm:p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#FFD333]" />
                  <h3 className="font-extrabold text-base uppercase text-[#3D464D]">{t.shoppingCart} ({totalCartCount})</h3>
                </div>
                <button
                  onClick={() => setShowCartDrawer(false)}
                  className="p-1 text-[#6C757D] hover:text-[#3D464D] cursor-pointer"
                  title="Close Cart"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <ShoppingCart className="w-12 h-12 text-[#CED4DA] mx-auto" />
                  <p className="text-sm text-[#6C757D]">{t.cartEmpty}</p>
                  <button
                    onClick={() => { setShowCartDrawer(false); scrollToSection('recent'); }}
                    className="bg-[#FFD333] text-[#3D464D] font-bold text-xs uppercase px-4 py-2 rounded shadow hover:bg-[#E5BE2C]"
                  >
                    {t.browseGoods}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#F0F0F0] mt-3 space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="pt-2 flex items-center justify-between gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded bg-[#F5F5F5] shrink-0 border border-[#E5E5E5]"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-[#3D464D] line-clamp-1">{item.product.name}</h4>
                        <span className="text-xs font-mono font-bold text-[#D97706]"><ProductPrice product={item.product} company={companySettings} language={language} format={formatPrice} quantity={item.quantity} /></span>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, -1)}
                            className="w-5 h-5 bg-[#F5F5F5] border border-[#CED4DA] flex items-center justify-center rounded text-xs hover:bg-[#E5E5E5] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold font-mono px-1">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, 1)}
                            className="w-5 h-5 bg-[#F5F5F5] border border-[#CED4DA] flex items-center justify-center rounded text-xs hover:bg-[#E5E5E5] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-[#DC2626] hover:text-[#991B1B] p-1.5 cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-[#E5E5E5] pt-4 space-y-3 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6C757D]">{t.estimatedTotal}:</span>
                  <span className="text-lg font-bold font-mono text-[#3D464D]">{hasQuoteItems ? <button type="button" onClick={sendWhatsAppOrder} className="text-[#166534] underline underline-offset-2 hover:text-green-800">{quoteLabel(language)}</button> : formatPrice(cartTotal)}</span>
                </div>
                <button
                  onClick={sendWhatsAppOrder}
                  className="w-full bg-[#25D366] text-white py-2.5 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#1EBE5D] transition-colors shadow cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.orderViaWhatsApp} ({totalCartCount} Items)</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCartItems([]);
                      showToast(language === 'en' ? 'Cart cleared' : 'Seleda waa la tirtiray');
                    }}
                    className="flex-1 border border-[#CED4DA] text-[#6C757D] py-1.5 rounded text-xs font-semibold hover:bg-[#F5F5F5] cursor-pointer"
                  >
                    {t.clearCart}
                  </button>
                  <button
                    onClick={() => {
                      setShowCartDrawer(false);
                      scrollToSection('contact');
                    }}
                    className="flex-1 bg-[#3D464D] text-white py-1.5 rounded text-xs font-semibold hover:bg-[#FFD333] hover:text-[#3D464D] transition-colors cursor-pointer"
                  >
                    {t.getQuotation}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          15. WISHLIST MODAL
      ======================================================== */}
      {showWishlistModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          onClick={() => setShowWishlistModal(false)}
        >
          <div
            className="bg-white rounded max-w-lg w-full p-4 sm:p-6 shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#D97706] fill-[#FFD333]" />
                <h3 className="font-extrabold text-base uppercase text-[#3D464D]">{t.myWishlist} ({wishlistItems.length})</h3>
              </div>
              <button
                onClick={() => setShowWishlistModal(false)}
                className="p-1 text-[#6C757D] hover:text-[#3D464D] cursor-pointer"
                title="Close Wishlist"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {wishlistItems.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Heart className="w-12 h-12 text-[#CED4DA] mx-auto" />
                <p className="text-sm text-[#6C757D]">{t.wishlistEmpty}</p>
                <button
                  onClick={() => { setShowWishlistModal(false); scrollToSection('recent'); }}
                  className="bg-[#FFD333] text-[#3D464D] font-bold text-xs uppercase px-4 py-2 rounded shadow hover:bg-[#E5BE2C]"
                >
                  {t.exploreProducts}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#F0F0F0] space-y-2">
                {wishlistItems.map((p) => (
                  <div key={p.id} className="pt-2 flex items-center justify-between gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-14 h-14 object-cover rounded bg-[#F5F5F5] shrink-0 border border-[#E5E5E5]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-[#3D464D] line-clamp-1">{p.name}</h4>
                      <span className="text-xs font-mono font-bold text-[#D97706]"><ProductPrice product={p} company={companySettings} language={language} format={formatPrice} quantity={1} /></span>
                      <p className="text-[10px] text-[#6C757D] truncate">{p.category}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        disabled={p.available === false}
                        onClick={() => {
                          addToCart(p, 1);
                          toggleWishlist(p);
                        }}
                        className="bg-[#FFD333] text-[#3D464D] px-2.5 py-1 rounded text-xs font-bold hover:bg-[#E5BE2C] shadow-xs cursor-pointer"
                        title={t.moveToCart}
                      >
                        {t.addCart}
                      </button>
                      <button
                        onClick={() => toggleWishlist(p)}
                        className="text-[#DC2626] hover:text-[#991B1B] p-1 cursor-pointer"
                        title={t.remove}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          16. SINGLE PRODUCT QUICK VIEW MODAL
      ======================================================== */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded max-w-2xl w-full p-4 sm:p-8 shadow-2xl relative space-y-3 sm:space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 text-[#6C757D] hover:text-[#3D464D] p-1 cursor-pointer"
              title={t.closeDialog}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-center">
              <div className="aspect-[4/3] bg-[#F5F5F5] rounded overflow-hidden border border-[#E5E5E5]">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <span className="text-[9px] sm:text-[10px] text-[#6C757D] uppercase block font-normal">{selectedProduct.category}</span>
                <h3 className="font-bold text-base sm:text-lg text-[#3D464D] uppercase">{selectedProduct.name}</h3>

                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-bold text-[#3D464D]"><ProductPrice product={selectedProduct} company={companySettings} language={language} format={formatPrice} quantity={modalQuantity} /></span>
                  <span className="text-xs text-[#6C757D] line-through font-normal">{!selectedProduct.priceOnRequest && formatOldPrice(selectedProduct.oldPrice)}</span>
                </div>

                {selectedProduct.reviews > 0 && (<div className="flex items-center gap-0.5 text-[#FFD333]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < selectedProduct.rating ? 'fill-current' : 'text-[#CED4DA]'}`} />
                  ))}
                  <span className="text-xs text-[#6C757D] ml-1">({selectedProduct.reviews} {t.reviewsCount})</span>
                </div>)}

                <p className="text-xs text-[#6C757D] leading-relaxed font-normal">{selectedProduct.specs}</p>
                {selectedProduct.origin && <p className="text-xs text-[#3D464D] font-medium">{t.origin}: {selectedProduct.origin}</p>}
                {selectedProduct.sku && <p className="text-xs font-mono">Code: {selectedProduct.sku}{selectedProduct.unit ? ` | Unit: ${selectedProduct.unit}` : ''}</p>}
                {selectedProduct.imageIsIllustration && <p className="text-xs text-[#6C757D]">{language === 'en' ? 'Illustration - actual product may vary.' : 'Sawir tusaale ah.'}</p>}

                {/* Quantity selector */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-[#6C757D] font-semibold">{t.quantity}:</span>
                  <div className="flex items-center border border-[#CED4DA] rounded">
                    <button
                      onClick={() => setModalQuantity(q => Math.max(1, q - 1))}
                      className="px-2.5 py-1 text-xs hover:bg-[#F5F5F5] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold font-mono">{modalQuantity}</span>
                    <button
                      onClick={() => setModalQuantity(q => q + 1)}
                      className="px-2.5 py-1 text-xs hover:bg-[#F5F5F5] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    disabled={selectedProduct.available === false}
                    onClick={() => {
                      addToCart(selectedProduct, modalQuantity);
                      setSelectedProduct(null);
                    }}
                    className="w-full bg-[#FFD333] text-[#3D464D] py-2 sm:py-2.5 rounded font-bold text-xs uppercase hover:bg-[#E5BE2C] shadow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{t.addToInquiryCart} ({modalQuantity} units)</span>
                  </button>

                  {selectedProduct.available !== false && <a
                    href={`https://wa.me/${(header.whatsappPhone || companySettings.bosasoPhone).replace(/[^0-9]/g, '') || '252905124444'}?text=${encodeURIComponent(`Hello ${companySettings.name}, inquiry for: ${selectedProduct.name}${selectedProduct.sku ? ` [${selectedProduct.sku}]` : ''} (${displayPrice(selectedProduct)}) - Quantity: ${modalQuantity}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] text-white py-2 text-xs font-bold uppercase rounded text-center hover:bg-[#1EBE5D] flex items-center justify-center gap-1.5 shadow"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t.whatsAppQuoteNow}</span>
                  </a>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// App Root with Routing
export default function App() {
  const [storageError, setStorageError] = useState(false);
  const [apiError, setApiError] = useState('');
  useEffect(() => {
    const report = (event: Event) => setApiError((event as CustomEvent<string>).detail);
    window.addEventListener('idogtc-api-error', report);
    return () => window.removeEventListener('idogtc-api-error', report);
  }, []);
  const Provider = DATABASE_MODE ? DatabaseStoreProvider : StoreProvider;
  useEffect(() => {
    const report = () => setStorageError(true);
    window.addEventListener('idogtc-storage-error', report);
    return () => window.removeEventListener('idogtc-storage-error', report);
  }, []);
  const [currentRoute, setCurrentRoute] = useState<'store' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      return path === '/admin' || path.startsWith('/admin/') || hash === '#admin' ? 'admin' : 'store';
    }
    return 'store';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || path.startsWith('/admin') || hash === '#admin') {
        setCurrentRoute('admin');
      } else {
        setCurrentRoute('store');
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateToStore = () => {
    window.history.pushState({}, '', '/');
    setCurrentRoute('store');
  };

  return (
    <Provider>
      {apiError && <div role="alert" className="fixed top-0 inset-x-0 z-[100] bg-red-800 text-white px-4 py-3 text-sm">
        {apiError} <button className="ml-4 underline" onClick={() => setApiError('')}>Xir / Close</button>
      </div>}
      {storageError && <div role="alert" className="fixed top-0 inset-x-0 z-[100] bg-red-800 text-white px-4 py-3 text-sm">
        Xogta lama kaydin karin. Kaydka browser-ka hubi / Unable to save changes. Check browser storage.
        <button className="ml-4 underline" onClick={() => setStorageError(false)}>Xir / Close</button>
      </div>}
      {currentRoute === 'admin' ? (
        <AdminPanel onBackToStore={navigateToStore} />
      ) : (
        <Storefront />
      )}
    </Provider>
  );
}
