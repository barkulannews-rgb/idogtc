import type { CategoryItem, CompanySettings, FooterSettings, FooterTarget, HeaderText } from '../types/store';
import { I18N } from './i18n';

export const FOOTER_TARGETS: FooterTarget[] = ['top', 'categories', 'recent', 'about', 'contact', 'cart', 'wishlist'];
const translated = (key: keyof typeof I18N.en): HeaderText => ({ en: I18N.en[key], so: I18N.so[key] });

export function getFooterSettings(company: CompanySettings, categories: CategoryItem[]): FooterSettings {
  const saved = company.footer;
  return {
    description: saved?.description ?? { en: company.aboutText, so: company.aboutText },
    copyright: saved?.copyright ?? { en: '© {year} {company}. All rights reserved.', so: '© {year} {company}. Xuquuqda oo dhan waa dhowran tahay.' },
    labels: { contact: translated('getInTouch'), shop: translated('quickShop'), account: translated('myAccount'), newsletter: translated('newsletter'), newsletterDescription: translated('newsletterDesc'), emailPlaceholder: translated('yourEmail'), subscribe: translated('signUp'), social: translated('followUs'), domain: translated('officialDomain'), ...saved?.labels },
    shopLinks: saved?.shopLinks ?? [
      ...[...categories].sort((a, b) => Number(Boolean(b.catalogueGroup)) - Number(Boolean(a.catalogueGroup))).slice(0, 4).map(category => ({ id: `category-${category.id}`, label: { en: category.name, so: category.name }, target: `category:${category.id}` as FooterTarget, visible: true })),
      { id: 'all-products', label: translated('showAllProducts'), target: 'recent', visible: true },
    ],
    accountLinks: saved?.accountLinks ?? [
      { id: 'cart', label: translated('cart'), target: 'cart', visible: true },
      { id: 'wishlist', label: translated('wishlist'), target: 'wishlist', visible: true },
      { id: 'about', label: translated('aboutUs'), target: 'about', visible: true },
      { id: 'contact', label: translated('contactUs'), target: 'contact', visible: true },
    ],
    social: { facebook: '', instagram: '', twitter: '', linkedin: '', ...saved?.social },
    visibility: { enabled: true, contact: true, shop: true, account: true, newsletter: true, social: true, copyright: true, domain: true, ...saved?.visibility },
  };
}

export function footerText(value: HeaderText, language: 'en' | 'so'): string { return value[language] || value.en; }
export function validSocialUrl(value: string): boolean {
  if (!value) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password; } catch { return false; }
}
