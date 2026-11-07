import React from 'react';
import { Language } from '../types';
import { CONTENT, OFFICES } from '../data/translations';
import { ShieldCheck, Anchor, Building, Mail, Phone, ExternalLink } from 'lucide-react';

interface FooterProps {
  language: Language;
  onOpenExportModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onOpenExportModal }) => {
  const t = CONTENT[language];

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/lOGO_2_266fa5f6.png"
                alt="IDO General Trading Company Logo"
                className="w-12 h-12 rounded-full object-contain border border-amber-400/40 p-0.5 bg-slate-900 shadow-md"
              />
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  IDO GENERAL TRADING CO.
                </h3>
                <span className="text-xs font-mono text-amber-400">
                  Target Domain: https://idogtc.com/
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {language === 'en'
                ? 'Global trading partner that sources, imports, and distributes a diverse range of goods backed by ethical sourcing and regulatory compliance.'
                : 'Shirkad caalami ah oo ka shaqaysa keenista, dhoofinta, iyo qaybinta alaabooyinka kala duwan oo leh dhawridda tayada iyo shuruucda.'}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Ethical Sourcing & Regulatory Compliance</span>
            </div>
          </div>

          {/* Quick Contact Points */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Direct Contact Lines
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <Anchor className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Bosaso HQ (Somalia): </span>
                  <a href={`tel:${OFFICES.bosaso.phoneRaw}`} className="text-slate-300 hover:text-amber-300 font-mono">
                    +252 90 512 4444
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Dubai Hub (UAE): </span>
                  <a href={`tel:${OFFICES.dubai.phoneRaw}`} className="text-slate-300 hover:text-amber-300 font-mono">
                    +971 50 150 7332
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Official Email: </span>
                  <a href={`mailto:${OFFICES.bosaso.email}`} className="text-slate-300 hover:text-amber-300 font-mono">
                    idogtc2003@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Nav & Export links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Portal Admin
            </h4>

            <ul className="space-y-2 text-xs">
              <li>
                <a href="#overview" className="hover:text-amber-300 transition-colors">
                  {t.navOverview}
                </a>
              </li>
              <li>
                <a href="#status" className="hover:text-amber-300 transition-colors">
                  {t.navStatus}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-amber-300 transition-colors">
                  {t.navServices}
                </a>
              </li>
              <li>
                <a href="#offices" className="hover:text-amber-300 transition-colors">
                  {t.navOffices}
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenExportModal}
                  className="text-amber-400 hover:underline flex items-center gap-1 font-mono font-bold"
                >
                  <span>Export index.html Code</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright & Disclaimer Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} IDO General Trading Company. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Bosaso, Puntland, Somalia</span>
            <span>•</span>
            <span>Dubai, UAE</span>
            <span>•</span>
            <a href="https://idogtc.com" className="text-amber-400 hover:underline">
              idogtc.com
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
