import React, { useState } from 'react';
import { Language } from '../types';
import { CONTENT, OFFICES } from '../data/translations';
import { MapPin, Phone, Mail, MessageCircle, Copy, Check, ExternalLink, Anchor, Building } from 'lucide-react';

interface ContactLocationsProps {
  language: Language;
}

export const ContactLocations: React.FC<ContactLocationsProps> = ({ language }) => {
  const [copiedBosaso, setCopiedBosaso] = useState(false);
  const [copiedDubai, setCopiedDubai] = useState(false);
  const t = CONTENT[language];

  const handleCopy = (phone: string, target: 'bosaso' | 'dubai') => {
    navigator.clipboard.writeText(phone);
    if (target === 'bosaso') {
      setCopiedBosaso(true);
      setTimeout(() => setCopiedBosaso(false), 2000);
    } else {
      setCopiedDubai(true);
      setTimeout(() => setCopiedDubai(false), 2000);
    }
  };

  return (
    <section id="offices" className="py-16 lg:py-24 border-b border-slate-800 bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
            04. Global Footprint
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            {t.contactTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            {t.contactSubtitle}
          </p>
        </div>

        {/* Dual Location Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Bosaso HQ Card */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase">
                  <Anchor className="w-3.5 h-3.5" />
                  {OFFICES.bosaso.role}
                </span>
                <span className="text-xs font-mono text-slate-400">Puntland, Somalia</span>
              </div>

              <h3 className="text-2xl font-extrabold text-white font-display">
                {OFFICES.bosaso.city}, Puntland
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{OFFICES.bosaso.address}</span>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-white font-bold">{OFFICES.bosaso.phoneDisplay}</span>
                  <button
                    onClick={() => handleCopy(OFFICES.bosaso.phoneDisplay, 'bosaso')}
                    className="p-1 rounded text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                    title="Copy Phone Number"
                  >
                    {copiedBosaso ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href={`mailto:${OFFICES.bosaso.email}`} className="text-amber-300 hover:underline">
                    {OFFICES.bosaso.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Actions & Map Link */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${OFFICES.bosaso.phoneRaw}`}
                  className="py-2.5 px-4 text-xs font-bold text-slate-950 gold-button-gradient rounded-xl shadow hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t.ctaCall}</span>
                </a>

                <a
                  href={OFFICES.bosaso.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-700/60 hover:bg-emerald-900 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.ctaWhatsApp}</span>
                </a>
              </div>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(OFFICES.bosaso.mapEmbedQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 text-xs text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Bosaso Port Map Location</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Dubai Hub Card */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase">
                  <Building className="w-3.5 h-3.5" />
                  {OFFICES.dubai.role}
                </span>
                <span className="text-xs font-mono text-slate-400">United Arab Emirates</span>
              </div>

              <h3 className="text-2xl font-extrabold text-white font-display">
                {OFFICES.dubai.city}, UAE
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{OFFICES.dubai.address}</span>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-white font-bold">{OFFICES.dubai.phoneDisplay}</span>
                  <button
                    onClick={() => handleCopy(OFFICES.dubai.phoneDisplay, 'dubai')}
                    className="p-1 rounded text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                    title="Copy Phone Number"
                  >
                    {copiedDubai ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href={`mailto:${OFFICES.dubai.email}`} className="text-amber-300 hover:underline">
                    {OFFICES.dubai.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Actions & Map Link */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${OFFICES.dubai.phoneRaw}`}
                  className="py-2.5 px-4 text-xs font-bold text-slate-950 gold-button-gradient rounded-xl shadow hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t.ctaCall}</span>
                </a>

                <a
                  href={OFFICES.dubai.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-700/60 hover:bg-emerald-900 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.ctaWhatsApp}</span>
                </a>
              </div>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(OFFICES.dubai.mapEmbedQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 text-xs text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Dubai Trade Location</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
