import React, { useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import type { CategoryItem, Product } from '../types/store';
import { categoryImage } from '../utils/categoryImage';
import { categoryUrl } from '../utils/categoryUrl';

export function CategoryBrowser({ categories, products, language, selected }: {
  categories: CategoryItem[]; products: Product[]; language: 'en' | 'so'; selected: string;
}) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('All');
  const [expanded, setExpanded] = useState(false);
  const groups = [...new Set(categories.map(category => category.catalogueGroup).filter((value): value is string => Boolean(value)))];
  const term = query.trim().toLocaleLowerCase();
  const filtered = categories.filter(category => (group === 'All' || category.catalogueGroup === group) &&
    (!term || category.name.toLocaleLowerCase().includes(term) || products.some(product => product.category === category.name &&
      `${product.name} ${product.sku || ''}`.toLocaleLowerCase().includes(term))));
  const browsing = Boolean(term) || group !== 'All';
  const visible = expanded || browsing ? filtered : filtered.slice(0, 6);
  const clear = () => { setQuery(''); setGroup('All'); };
  const groupLabel = (value: string) => language === 'en' ? value : value === 'Building Materials' ? 'Qalabka dhismaha' : value === 'Paints & Coatings' ? 'Rinjiyada' : value;

  return <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#3D464D]">{language === 'en' ? 'Shop by category' : 'Ka dooro qaybta alaabta'}</h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">{language === 'en' ? 'Find your materials, paints and everyday essentials.' : 'Si fudud u hel qalabka, rinjiyada iyo alaabta aad u baahan tahay.'}</p>
      </div>
      <div role="search" aria-label={language === 'en' ? 'Category search' : 'Raadinta qaybaha'} className="relative w-full md:max-w-sm">
        <Search size={18} className="absolute left-3.5 top-3 text-slate-500" aria-hidden="true" />
        <input type="search" aria-label={language === 'en' ? 'Search categories' : 'Raadi qaybaha'} placeholder={language === 'en' ? 'Search categories or products...' : 'Raadi qayb ama alaab...'} value={query} onChange={event => setQuery(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-800 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100" />
        {query && <button type="button" onClick={() => setQuery('')} aria-label={language === 'en' ? 'Clear category search' : 'Nadiifi raadinta qaybaha'} className="absolute right-1 top-1 rounded-lg p-2.5 text-slate-600 hover:bg-slate-200"><X size={16} /></button>}
      </div>
    </div>
    <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label={language === 'en' ? 'Category departments' : 'Qaybaha guud'}>
      {['All', ...groups].map(value => <button type="button" key={value} aria-pressed={group === value} onClick={() => setGroup(value)} className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${group === value ? 'bg-[#3D464D] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{value === 'All' ? (language === 'en' ? 'All categories' : 'Dhammaan qaybaha') : groupLabel(value)}</button>)}
    </div>
    <div role="status" className="mt-4 mb-3 text-xs text-slate-500">{visible.length} / {filtered.length} {language === 'en' ? 'categories' : 'qaybood'}</div>
    {visible.length ? <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {visible.map(category => <a key={category.id} href={categoryUrl(category.id)} aria-current={selected === category.name ? 'page' : undefined} className={`group flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${selected === category.name ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-amber-500 hover:bg-amber-50/40'}`}>
        <img src={categoryImage(category, products)} alt={category.name} className="h-24 w-full sm:w-20 sm:h-20 shrink-0 rounded-lg bg-slate-50 object-contain" />
        <span className="min-w-0 flex-1">
          <span className="block text-xs sm:text-sm font-bold leading-snug text-[#3D464D]">{category.name}</span>
          <span className="mt-2 block text-[11px] text-slate-600">{products.filter(product => product.category === category.name).length} {language === 'en' ? 'products' : 'alaab'}</span>
        </span>
        <ArrowRight size={16} className="hidden sm:block shrink-0 text-slate-400 group-hover:text-amber-700" aria-hidden="true" />
      </a>)}
    </div> : <div className="rounded-xl bg-slate-50 py-8 px-4 text-center">
      <Search size={24} className="mx-auto text-slate-400" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold text-slate-700">{language === 'en' ? 'No matching categories' : 'Qayb ku habboon lama helin'}</p>
      <button type="button" onClick={clear} className="mt-3 text-sm font-bold text-amber-800 underline">{language === 'en' ? 'Clear filters' : 'Nadiifi raadinta'}</button>
    </div>}
    {!browsing && filtered.length > 6 && <div className="mt-5 text-center"><button type="button" onClick={() => setExpanded(value => !value)} className="rounded-lg border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">{expanded ? (language === 'en' ? 'Show fewer categories' : 'Yaree qaybaha') : (language === 'en' ? 'View all categories' : 'Eeg dhammaan qaybaha')} ({categories.length})</button></div>}
  </div>;
}
