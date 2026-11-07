import React from 'react';
import type { CompanySettings, Product } from '../types/store';
import { getHeaderSettings } from '../data/headerSettings';
import { productPrice } from '../utils/productPrice';

export function productQuoteUrl(product: Product, company: CompanySettings, language: 'en' | 'so', quantity = 1) {
  const phone = (getHeaderSettings(company).whatsappPhone || company.bosasoPhone).replace(/\D/g, '');
  const reference = `${product.name}${product.sku ? ` [${product.sku}]` : ''}`;
  const message = language === 'so'
    ? `Salaan ${company.name}, waxaan rabaa qiimaha: ${reference}. Tirada: ${quantity}${product.unit ? ` ${product.unit}` : ''}.`
    : `Hello ${company.name}, please send a quote for: ${reference}. Quantity: ${quantity}${product.unit ? ` ${product.unit}` : ''}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function ProductPrice({ product, company, language, format, quantity = 1 }: {
  product: Product; company: CompanySettings; language: 'en' | 'so'; format: (amount: number) => string; quantity?: number;
}) {
  const label = productPrice(product, language, format);
  return product.priceOnRequest
    ? <a href={productQuoteUrl(product, company, language, quantity)} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center rounded bg-[#DCFCE7] px-2.5 py-1.5 text-[#166534] underline decoration-dotted underline-offset-2 hover:bg-[#BBF7D0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
      aria-label={`${label}: ${product.name}${product.sku ? ` ${product.sku}` : ''}`} onClick={event => event.stopPropagation()}>{label}</a>
    : <>{label}</>;
}
