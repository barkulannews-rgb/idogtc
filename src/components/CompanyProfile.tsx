import React from 'react';
import { Language } from '../types';
import { CONTENT } from '../data/translations';
import { ShieldCheck, Target, Award, CheckCircle } from 'lucide-react';

interface CompanyProfileProps {
  language: Language;
}

export const CompanyProfile: React.FC<CompanyProfileProps> = ({ language }) => {
  const t = CONTENT[language];

  return (
    <section className="py-16 lg:py-24 border-b border-slate-800 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
            01. Corporate Profile
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            {t.aboutTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            {language === 'en' 
              ? 'Ethical sourcing, competitive pricing, and regulatory compliance at scale.' 
              : 'Dhowrista tayada, shuruucda caalamiga ah, iyo dhoofinta qiimaha jaban.'}
          </p>
        </div>

        {/* Grid Split: Text & Photography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Main Content Box */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-xl font-bold text-white font-display flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                <span>{language === 'en' ? 'Our Core Mission & Values' : 'Hadafka Iyo Qiimaha Shirkada'}</span>
              </h3>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {t.aboutParagraph}
              </p>

              <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Direct Factory Contracts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Competitive Wholesale Pricing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Regulatory Compliance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Reliable Port Delivery</span>
                </div>
              </div>
            </div>

            {/* Guarantees Callout */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-300">
                  {language === 'en' ? 'Ethical Sourcing Assurance' : 'Hubinta Tayada & Shuruucda'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'en'
                    ? 'Every shipment from IDO General Trading Company is inspected against international trade benchmarks prior to loading in Dubai or overseas ports.'
                    : 'Dhammaan alaabooyinka shirkada IDO GTC waxaa la maraa kormeer tayo ka hor intaan la soo saarin markabka.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Image Showcase */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="relative group overflow-hidden rounded-2xl border border-slate-800 shadow-xl">
                <img
                  src="/src/assets/images/hero_global_shipping_1793690292263.jpg"
                  alt="Global Container Cargo Ship"
                  className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[10px] font-mono text-amber-400 font-bold">Global Shipping</span>
                  <span className="text-xs font-bold text-white">Ocean Cargo Freight</span>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-2xl border border-slate-800 shadow-xl">
                <img
                  src="/src/assets/images/bosaso_port_trade_1793690293064.jpg"
                  alt="Bosaso Seaport Terminal"
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[10px] font-mono text-amber-400 font-bold">Bosaso HQ</span>
                  <span className="text-xs font-bold text-white">Bosaso Port Clearance</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-0 sm:pt-6">
              <div className="relative group overflow-hidden rounded-2xl border border-slate-800 shadow-xl">
                <img
                  src="/src/assets/images/quality_inspection_1793690293588.jpg"
                  alt="Quality Control Warehouse Inspection"
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[10px] font-mono text-amber-400 font-bold">Quality Check</span>
                  <span className="text-xs font-bold text-white">Warehouse Audit</span>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-2xl border border-slate-800 shadow-xl">
                <img
                  src="/src/assets/images/dubai_trade_hub_1793690293266.jpg"
                  alt="Dubai Regional Trade Center"
                  className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[10px] font-mono text-amber-400 font-bold">Dubai Trading Hub</span>
                  <span className="text-xs font-bold text-white">Jebel Ali & Deira Network</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
