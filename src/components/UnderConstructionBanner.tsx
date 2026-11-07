import React from 'react';
import { Language } from '../types';
import { CONTENT } from '../data/translations';
import { Wrench, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

interface UnderConstructionBannerProps {
  language: Language;
  onOpenInquiry: () => void;
}

export const UnderConstructionBanner: React.FC<UnderConstructionBannerProps> = ({
  language,
  onOpenInquiry,
}) => {
  const t = CONTENT[language];

  return (
    <section id="status" className="py-12 bg-slate-900/60 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-amber-500/20 relative overflow-hidden shadow-xl">
          
          {/* Subtle Ambient Background Accent */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Info Column */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  System Upgrade in Progress
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Domain: https://idogtc.com/
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                {t.underConstructionTitle}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {t.underConstructionDesc}
              </p>

              {/* Status List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200">Bosaso Port Cargo: ACTIVE</span>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200">Dubai Logistics Hub: ACTIVE</span>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200">Online Ordering: Launching Q1</span>
                </div>
              </div>
            </div>

            {/* Right System Upgrade Counter & Action Column */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 text-center sm:text-left">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-400">Portal Build Progress</span>
                  <span className="text-amber-400 font-bold">85% Complete</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-1000 w-[85%]"></div>
                </div>
              </div>

              <div className="text-xs text-slate-400">
                {language === 'en'
                  ? 'Need immediate product procurement, shipping dates, or wholesale quotes during the portal build?'
                  : 'Ma u baahan tahay dalab alaabeed ama qiimaha jumlada inta horumarintu ku socoto bogga?'}
              </div>

              <button
                onClick={onOpenInquiry}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 gold-button-gradient rounded-lg shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <span>{language === 'en' ? 'Submit Direct Request' : 'Dir Dalabkaaga Hadda'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
