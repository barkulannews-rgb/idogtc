import React, { useState } from 'react';
import { Language } from '../types';
import { CONTENT } from '../data/translations';
import { Globe, PhoneCall, Code2, Menu, X, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onOpenExportModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = CONTENT[language];

  const navItems = [
    { label: t.navOverview, href: '#overview' },
    { label: t.navStatus, href: '#status' },
    { label: t.navServices, href: '#services' },
    { label: t.navOffices, href: '#offices' },
    { label: t.navInquiry, href: '#inquiry' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Zone 1: Single Brand Element with Logo */}
        <a href="#overview" className="flex items-center gap-3 group shrink-0">
          <div className="relative">
            <img
              src="/assets/aistudio/lOGO_2_266fa5f6.png"
              alt="IDO General Trading Company Logo"
              className="w-12 h-12 rounded-full object-contain border-2 border-amber-400/50 p-0.5 bg-slate-900 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" title="Operations Active"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-white font-display group-hover:text-amber-300 transition-colors">
                IDO GENERAL TRADING CO.
              </span>
            </div>
            <span className="block text-[11px] font-mono text-amber-400/90 tracking-wide">
              idogtc.com • Bosaso & Dubai
            </span>
          </div>
        </a>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-amber-300 transition-colors py-1 whitespace-nowrap shrink-0"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Actions (Language, Export HTML, Contact) */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {/* Language Toggle */}
          <button
            onClick={() => onLanguageChange(language === 'en' ? 'so' : 'en')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap"
            title="Switch Language / Bedel Luqadda"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'en' ? 'Af-Soomaali' : 'English'}</span>
          </button>

          {/* HTML Code Export Button for Site Admin */}
          <button
            onClick={onOpenExportModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all whitespace-nowrap"
            title="Generate index.html for idogtc.com"
          >
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Export HTML</span>
          </button>

          {/* Direct WhatsApp Call CTA */}
          <a
            href="https://wa.me/252905124444"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 gold-button-gradient rounded-lg shadow-md shadow-amber-500/10 hover:brightness-110 transition-all whitespace-nowrap"
          >
            <PhoneCall className="w-3.5 h-3.5 text-slate-950" />
            <span>HQ Bosaso</span>
          </a>
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => onLanguageChange(language === 'en' ? 'so' : 'en')}
            className="px-2.5 py-1 text-xs font-bold text-amber-300 bg-slate-900 border border-slate-800 rounded-md"
          >
            {language === 'en' ? 'SO' : 'EN'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-md"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenExportModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full px-4 py-2 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg"
            >
              <span className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span>Export index.html Code</span>
              </span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/252905124444"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-slate-950 gold-button-gradient rounded-lg"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Contact Bosaso HQ (+252 90 512 4444)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
