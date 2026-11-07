export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  oldPrice: string;
  numericPrice: number;
  rating: number;
  reviews: number;
  image: string;
  origin: string;
  specs: string;
  isFeatured?: boolean;
  sku?: string;
  unit?: string;
  catalogueGroup?: string;
  priceOnRequest?: boolean;
  imageIsIllustration?: boolean;
}

export interface SlideItem {
  title: string;
  subtitle: string;
  badge: string;
  desc: string;
  image: string;
  offer: string;
}

export interface CategoryItem {
  name: string;
  count: string;
  id: string;
  img: string;
  catalogueGroup?: string;
}

export interface CompanySettings {
  name: string;
  shortName: string;
  domain: string;
  bosasoPhone: string;
  dubaiPhone: string;
  email: string;
  bosasoAddress: string;
  dubaiAddress: string;
  aboutText: string;
  header?: HeaderSettings;
  footer?: FooterSettings;
}

export type FooterTarget = 'top' | 'categories' | 'recent' | 'about' | 'contact' | 'cart' | 'wishlist' | `category:${string}`;
export interface FooterLink { id: string; label: HeaderText; target: FooterTarget; visible: boolean }
export interface FooterSettings {
  description: HeaderText;
  copyright: HeaderText;
  labels: Record<'contact' | 'shop' | 'account' | 'newsletter' | 'newsletterDescription' | 'emailPlaceholder' | 'subscribe' | 'social' | 'domain', HeaderText>;
  shopLinks: FooterLink[];
  accountLinks: FooterLink[];
  social: Record<'facebook' | 'instagram' | 'twitter' | 'linkedin', string>;
  visibility: Record<'enabled' | 'contact' | 'shop' | 'account' | 'newsletter' | 'social' | 'copyright' | 'domain', boolean>;
}

export type HeaderTarget = 'top' | 'categories' | 'featured' | 'recent' | 'about' | 'contact';
export interface HeaderText { en: string; so: string }
export interface HeaderLink { id: string; label: HeaderText; target: HeaderTarget; visible: boolean }
export interface HeaderSettings {
  image: string;
  logoAlt: string;
  brandPrimary: string;
  brandSecondary: string;
  tagline: HeaderText;
  whatsappPhone: string;
  whatsappMessage: HeaderText;
  customerServicePhone: string;
  labels: Record<'bosaso' | 'dubai' | 'customerService' | 'search' | 'categories' | 'allCategories' | 'whatsapp' | 'wishlist' | 'cart', HeaderText>;
  topLinks: HeaderLink[];
  navigation: HeaderLink[];
  visibility: Record<'topBar' | 'logo' | 'brand' | 'tagline' | 'search' | 'customerService' | 'categories' | 'whatsapp' | 'currency' | 'language' | 'wishlist' | 'cart', boolean>;
}

export interface OrderInquiry {
  id: string;
  date: string;
  customerName?: string;
  items: { productName: string; quantity: number; price: string; productId?: number; sku?: string; priceOnRequest?: boolean }[];
  totalAmount: number;
  hasUnpricedItems?: boolean;
  status: 'New' | 'Contacted' | 'Fulfilled';
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  date: string;
  category?: string;
  isSystem?: boolean;
}

export interface PromoBannerItem {
  id: string;
  badge: string;
  badgeSo?: string;
  title: string;
  titleSo?: string;
  description: string;
  descriptionSo?: string;
  image: string;
  buttonText: string;
  buttonTextSo?: string;
  buttonLink: string;
}

export interface PartnerItem {
  id: string;
  name: string;
  tag: string;
  tagSo?: string;
  image?: string;
  iconType?: 'port' | 'globe' | 'iso' | 'solar' | 'food' | 'freight';
}

