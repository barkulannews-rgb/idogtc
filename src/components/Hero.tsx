import React from 'react';
import { Language } from '../types';
import { CONTENT, OFFICES } from '../data/translations';
import { ShieldCheck, MessageCircle, Phone, Mail, Sparkles, Building, Anchor } from 'lucide-react';

interface HeroProps {
  language: Language;
  onOpenInquiry: () => void;
}

export const Hero: React.FC<HeroProps> = ({ language, onOpenInquiry }) => {
  const t = CONTENT[language];

  return (
    <section id="overview" className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-800/80 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950">
      {/* Background Decorative Gold Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Under Construction Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>{t.statusNoticeTitle}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-display leading-[1.1]">
              <span className="block">{t.companyName}</span>
              <span className="block gold-gradient-text text-2xl sm:text-4xl lg:text-5xl mt-2">
                {language === 'en' ? 'Global Trade, Sourcing & Distribution' : 'Adeega Dhoofinta, Keenista & Qaybinta'}
              </span>
            </h1>

            {/* Company Paragraph */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl">
              {t.aboutParagraph}
            </p>

            {/* Dual Contact Cards (Bosaso & Dubai) */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bosaso HQ */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-amber-400 font-bold tracking-wider uppercase flex items-center gap-1.5">
                    <Anchor className="w-3.5 h-3.5 text-amber-400" />
                    {OFFICES.bosaso.role}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">Puntland</span>
                </div>
                <h3 className="text-sm font-bold text-white">{OFFICES.bosaso.city}, Somalia</h3>
                <p className="text-xs text-slate-300 font-mono font-medium">{OFFICES.bosaso.phoneDisplay}</p>
                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={OFFICES.bosaso.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/60 rounded-md transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${OFFICES.bosaso.phoneRaw}`}
                    className="inline-flex items-center justify-center p-1.5 text-xs font-bold text-slate-950 gold-button-gradient rounded-md hover:brightness-110"
                    title="Call Bosaso HQ"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Dubai Hub */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-amber-400 font-bold tracking-wider uppercase flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    {OFFICES.dubai.role}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">UAE</span>
                </div>
                <h3 className="text-sm font-bold text-white">{OFFICES.dubai.city}, UAE</h3>
                <p className="text-xs text-slate-300 font-mono font-medium">{OFFICES.dubai.phoneDisplay}</p>
                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={OFFICES.dubai.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/60 rounded-md transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${OFFICES.dubai.phoneRaw}`}
                    className="inline-flex items-center justify-center p-1.5 text-xs font-bold text-slate-950 gold-button-gradient rounded-md hover:brightness-110"
                    title="Call Dubai Hub"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Email Contact CTA Button */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenInquiry}
                className="px-5 py-3 text-xs font-extrabold text-slate-950 gold-button-gradient rounded-xl shadow-xl shadow-amber-500/10 hover:brightness-110 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{t.inquiryTitle}</span>
              </button>

              <a
                href={`mailto:${OFFICES.bosaso.email}`}
                className="px-4 py-3 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all flex items-center gap-2 font-mono"
              >
                <Mail className="w-4 h-4 text-amber-400" />
                <span>{t.emailLabel}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Embedded Official Logo Display */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm">
              {/* Outer Glowing Seal Container */}
              <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 p-8 text-center shadow-2xl gold-border-glow space-y-4">
                
                {/* Floating Top Badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[11px] font-extrabold uppercase px-4 py-0.5 rounded-full shadow-lg tracking-wider whitespace-nowrap">
                  Registered Trade Seal
                </div>

                {/* Logo Frame */}
                <div className="relative w-48 h-48 mx-auto my-2 rounded-full p-2 bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-700 shadow-xl">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center p-3">
                    <img
                      src="/assets/aistudio/lOGO_2_266fa5f6.png"
                      alt="IDO General Trading Company Official Logo"
                      className="w-full h-full object-contain drop-shadow-md"
                    />
                  </div>
                </div>

                {/* Title & Domain Label */}
                <div>
                  <h2 className="text-xl font-bold text-white font-display">
                    IDO GENERAL TRADING CO.
                  </h2>
                  <p className="text-xs text-amber-400 font-mono mt-1 font-medium">
                    https://idogtc.com/
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                  <p className="flex items-center justify-center gap-1.5 text-slate-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Ethical Sourcing & Regulatory Compliance
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
