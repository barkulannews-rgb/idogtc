import type { Product } from '../types/store';

export const quoteLabel = (language: 'en' | 'so') => language === 'so' ? 'Qiime weydii' : 'Request quote';
export function productPrice(product: Product, language: 'en' | 'so', format: (amount: number) => string): string {
  return product.priceOnRequest ? quoteLabel(language) : format(product.numericPrice);
}
