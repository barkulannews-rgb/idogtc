export type Language = 'en' | 'so';

export interface OfficeLocation {
  city: string;
  country: string;
  role: string;
  phoneDisplay: string;
  phoneRaw: string;
  email: string;
  address: string;
  whatsappUrl: string;
  mapEmbedQuery: string;
}

export interface TradeService {
  id: string;
  titleEn: string;
  titleSo: string;
  descEn: string;
  descSo: string;
  iconName: string;
  badgeEn: string;
  badgeSo: string;
  imagePath: string;
}

export interface ProductCategory {
  id: string;
  nameEn: string;
  nameSo: string;
  itemsEn: string[];
  itemsSo: string[];
  icon: string;
}

export interface InquiryFormData {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  category: string;
  destination: string;
  message: string;
  targetOffice: 'bosaso' | 'dubai';
}
