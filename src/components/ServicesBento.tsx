import React from 'react';
import { Language } from '../types';
import { CONTENT, SERVICES } from '../data/translations';
import { Globe, Ship, ShieldCheck, Truck, ArrowRight } from 'lucide-react';

interface ServicesBentoProps {
  language: Language;
  onOpenInquiry: () => void;
}

export const ServicesBento: React.FC<ServicesBentoProps> = ({ language, onOpenInquiry }) => {
  const t = CONTENT[language];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe': return <Globe className="w-5 h-5 text-amber-400" />;
      case 'Ship': return <Ship className="w-5 h-5 text-amber-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-amber-400" />;
      case 'Truck': return <Truck className="w-5 h-5 text-amber-400" />;
      default: return <Globe className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <section id="services" className="py-16 lg:py-24 border-b border-slate-800 bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
            02. Core Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            {t.servicesTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            {t.servicesSubtitle}
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {SERVICES.map((service, idx) => {
            const isCol2 = idx === 0 || idx === 3;
            const title = language === 'en' ? service.titleEn : service.titleSo;
            const desc = language === 'en' ? service.descEn : service.descSo;
            const badge = language === 'en' ? service.badgeEn : service.badgeSo;

            return (
              <div
                key={service.id}
                className={`group relative rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 overflow-hidden flex flex-col justify-between p-6 sm:p-8 ${
                  isCol2 ? 'lg:col-span-7' : 'lg:col-span-5'
                }`}
              >
                {/* Background Image Scrim overlay */}
                <div className="absolute inset-0 z-0 opacity-15 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none">
                  <img
                    src={service.imagePath}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400/90">
                      0{idx + 1}. Editorial Service
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                      {badge}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-md">
                    {getIcon(service.iconName)}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display group-hover:text-amber-300 transition-colors">
                    {title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {desc}
                  </p>
                </div>

                <div className="relative z-10 pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    IDO GTC Standard
                  </span>
                  <button
                    onClick={onOpenInquiry}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 group/btn"
                  >
                    <span>{language === 'en' ? 'Inquire' : 'Warbixin'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
