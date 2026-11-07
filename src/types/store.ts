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
}

export interface OrderInquiry {
  id: string;
  date: string;
  customerName?: string;
  items: { productName: string; quantity: number; price: string }[];
  totalAmount: number;
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

