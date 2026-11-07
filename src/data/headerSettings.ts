import type { CompanySettings, HeaderSettings, HeaderText } from '../types/store';

export const HEADER_TARGETS = ['top', 'categories', 'featured', 'recent', 'about', 'contact'] as const;
export const DEFAULT_HEADER: HeaderSettings = {
  image: '/logo.png', logoAlt: 'IDO General Trading Co. Logo', brandPrimary: 'IDO', brandSecondary: 'GTC',
  tagline: { en: 'General Trading Co. • Bosaso & Dubai', so: 'General Trading Co. • Bosaso & Dubai' },
  whatsappPhone: '', whatsappMessage: { en: '', so: '' }, customerServicePhone: '',
  labels: {
    bosaso: { en: 'Bosaso HQ', so: 'Xarunta Boosaaso' }, dubai: { en: 'Dubai Hub', so: 'Xarunta Dubai' },
    customerService: { en: 'Customer Service', so: 'Adeegga Macaamiisha' },
    search: { en: 'Search for bulk rice, sugar, steel rebar, solar...', so: 'Raadi bariis, sonkor, bir, solar...' },
    categories: { en: 'Categories', so: 'Qaybaha' }, allCategories: { en: 'All Categories', so: 'Dhammaan Qaybaha' },
    whatsapp: { en: 'WhatsApp Quote', so: 'Qiime WhatsApp' }, wishlist: { en: 'Wishlist', so: 'Liiska Rabitaanka' }, cart: { en: 'Cart', so: 'Seleda' },
  },
  topLinks: [
    { id: 'about', label: { en: 'About', so: 'Nagu Saabsan' }, target: 'about', visible: true },
    { id: 'contact', label: { en: 'Contact', so: 'Xiriirka' }, target: 'contact', visible: true },
    { id: 'help', label: { en: 'Help', so: 'Caawinaad' }, target: 'categories', visible: true },
    { id: 'faqs', label: { en: 'FAQs', so: 'Su’aalaha' }, target: 'contact', visible: true },
  ],
  navigation: [
    { id: 'home', label: { en: 'Home', so: 'Bogga Hore' }, target: 'top', visible: true },
    { id: 'categories', label: { en: 'Categories', so: 'Qaybaha' }, target: 'categories', visible: true },
    { id: 'featured', label: { en: 'Featured Goods', so: 'Alaabta Gaarka Ah' }, target: 'featured', visible: true },
    { id: 'recent', label: { en: 'Recent Arrivals', so: 'Alaabta Cusub' }, target: 'recent', visible: true },
    { id: 'about', label: { en: 'About Us', so: 'Nagu Saabsan' }, target: 'about', visible: true },
    { id: 'contact', label: { en: 'Contact Us', so: 'Nala Soo Xiriir' }, target: 'contact', visible: true },
  ],
  visibility: { topBar: true, logo: true, brand: true, tagline: true, search: true, customerService: true, categories: true, whatsapp: true, currency: true, language: true, wishlist: true, cart: true },
};

// Existing databases have no header object. Defaults are applied without writing over saved data.
export function getHeaderSettings(settings: CompanySettings): HeaderSettings {
  const saved = settings.header;
  return { ...DEFAULT_HEADER, ...saved,
    labels: { ...DEFAULT_HEADER.labels, ...saved?.labels },
    visibility: { ...DEFAULT_HEADER.visibility, ...saved?.visibility },
    topLinks: saved?.topLinks ?? DEFAULT_HEADER.topLinks,
    navigation: saved?.navigation ?? DEFAULT_HEADER.navigation,
  };
}
export function headerText(text: HeaderText, language: 'en' | 'so'): string { return text[language] || text.en; }
export function headerWhatsApp(settings: CompanySettings, language: 'en' | 'so'): string {
  const header = getHeaderSettings(settings);
  const phone = (header.whatsappPhone || settings.bosasoPhone).replace(/\D/g, '');
  const message = headerText(header.whatsappMessage, language);
  return `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}
