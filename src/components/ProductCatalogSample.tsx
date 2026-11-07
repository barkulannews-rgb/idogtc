import React, { useState } from 'react';
import { Language } from '../types';
import { CONTENT, PRODUCT_CATEGORIES } from '../data/translations';
import { Apple, Building2, Zap, Package, Check, ArrowRight } from 'lucide-react';

interface ProductCatalogSampleProps {
  language: Language;
  onSelectItemForInquiry: (categoryName: string, itemName: string) => void;
}

export const ProductCatalogSample: React.FC<ProductCatalogSampleProps> = ({
  language,
  onSelectItemForInquiry,
}) => {
  const [activeTab, setActiveTab] = useState<string>(PRODUCT_CATEGORIES[0].id);
  const t = CONTENT[language];

  const getCategoryIcon = (icon: string) => {
    switch (icon) {
      case 'Apple': return <Apple className="w-4 h-4 text-amber-400" />;
      case 'Building2': return <Building2 className="w-4 h-4 text-amber-400" />;
      case 'Zap': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Package': return <Package className="w-4 h-4 text-amber-400" />;
      default: return <Package className="w-4 h-4 text-amber-400" />;
    }
  };

  const currentCategory = PRODUCT_CATEGORIES.find((cat) => cat.id === activeTab) || PRODUCT_CATEGORIES[0];

  return (
    <section className="py-16 lg:py-24 border-b border-slate-800 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
            03. Import Portfolio
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            {t.categoriesTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            {t.categoriesSubtitle}
          </p>
        </div>

        {/* Category Tabs (Interactive controls, single line) */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 scrollbar-none max-w-4xl mx-auto">
          {PRODUCT_CATEGORIES.map((cat) => {
            const name = language === 'en' ? cat.nameEn : cat.nameSo;
            const isActive = cat.id === activeTab;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {getCategoryIcon(cat.icon)}
                <span>{name}</span>
              </button>
            );
          })}
        </div>

        {/* Category Items Card */}
        <div className="mt-8 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-xl font-bold text-white font-display">
                {language === 'en' ? currentCategory.nameEn : currentCategory.nameSo}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'en'
                  ? 'Sourced directly from certified factories with full customs clearance.'
                  : 'Laga soo dhoofiyay warshadaha caalamka oo leh shahaadooyinka tayada.'}
              </p>
            </div>
            <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              Sourcing Ready
            </span>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(language === 'en' ? currentCategory.itemsEn : currentCategory.itemsSo).map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectItemForInquiry(language === 'en' ? currentCategory.nameEn : currentCategory.nameSo, item)}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all cursor-pointer group flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                      {item}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 pl-5">
                    {language === 'en' ? 'Click to request quote' : 'Guji si aad u dalbato'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 mt-0.5" />
              </div>
            ))}
          </div>

          <div className="pt-4 text-center border-t border-slate-800/80">
            <span className="text-xs text-slate-400">
              {language === 'en'
                ? 'Need a custom commodity or specific machinery not listed here? Contact our Bosaso or Dubai purchasing managers.'
                : 'Ma u baahan tahay alaab ama baabuur aan halkan ku qornayn? Kala xiriir maamulayaasha shirkada.'}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
