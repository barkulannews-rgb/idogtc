import React, { useState } from 'react';
import { Facebook, Instagram, Linkedin, Twitter, MapPin, Mail, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { FooterLink } from '../types/store';
import { footerText, getFooterSettings, validSocialUrl } from '../data/footerSettings';
import { categoryUrl } from '../utils/categoryUrl';
import { api, DATABASE_MODE, reportApiError } from '../utils/api';
import { readStored, writeStored } from '../utils/storage';

export function SiteFooter({ cartCount, wishlistCount, onCart, onWishlist, onToast }: {
  cartCount: number; wishlistCount: number; onCart: () => void; onWishlist: () => void; onToast: (message: string) => void;
}) {
  const { companySettings: company, categories, language } = useStore();
  const settings = getFooterSettings(company, categories);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const text = (key: keyof typeof settings.labels) => footerText(settings.labels[key], language);
  const socialIcons = { facebook: Facebook, instagram: Instagram, twitter: Twitter, linkedin: Linkedin };
  const socials = Object.entries(settings.social).filter(([, url]) => url && validSocialUrl(url));
  const linkStyle = 'hover:text-[#FFD333] hover:underline cursor-pointer text-left';
  const links = (items: FooterLink[]) => items.filter(link => link.visible).map(link => {
    const label = footerText(link.label, language);
    if (link.target === 'cart' || link.target === 'wishlist') return <li key={link.id}><button type="button" onClick={link.target === 'cart' ? onCart : onWishlist} className={linkStyle}>{label} ({link.target === 'cart' ? cartCount : wishlistCount})</button></li>;
    const category = link.target.startsWith('category:') ? categories.find(category => category.id === link.target.slice(9)) : undefined;
    if (link.target.startsWith('category:') && !category) return null;
    return <li key={link.id}><a href={category ? categoryUrl(category.id) : `/#${link.target}`} className={linkStyle}>{label}</a></li>;
  });
  const domain = /^https?:\/\//.test(company.domain) ? company.domain : `https://${company.domain}`;
  const headingStyle = 'text-white mb-3 font-bold text-sm';
  if (!settings.visibility.enabled) return null;
  return <footer id="site-footer" className="break-words [overflow-wrap:anywhere] bg-[#3D464D] text-[#E5E5E5] pt-8 sm:pt-12 pb-6 text-xs mt-8 sm:mt-12">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 pb-6 sm:pb-8 border-b border-[#525D66]">
      {settings.visibility.contact && <div className="min-w-0 space-y-3">
        <h2 className={headingStyle}>{text('contact')}</h2>
        <p className="text-[#CBD5E1] leading-relaxed whitespace-pre-line">{footerText(settings.description, language)}</p>
        {[company.bosasoAddress, company.dubaiAddress].filter(Boolean).map((address, index) => <p key={index} className="flex items-start gap-2"><MapPin size={14} className="text-[#FFD333] shrink-0 mt-0.5" />{address}</p>)}
        {company.email && <a href={`mailto:${company.email}`} className="flex items-center gap-2 break-all"><Mail size={14} className="text-[#FFD333] shrink-0" />{company.email}</a>}
        {[company.bosasoPhone, company.dubaiPhone].filter(Boolean).map((phone, index) => <a key={index} href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2"><Phone size={14} className="text-[#FFD333] shrink-0" />{phone}</a>)}
      </div>}
      {settings.visibility.shop && <div className="min-w-0"><h2 className={headingStyle}>{text('shop')}</h2><ul className="space-y-2 text-[#CBD5E1]">{links(settings.shopLinks)}</ul></div>}
      {settings.visibility.account && <div><h2 className={headingStyle}>{text('account')}</h2><ul className="space-y-2 text-[#CBD5E1]">{links(settings.accountLinks)}</ul></div>}
      {(settings.visibility.newsletter || settings.visibility.social && socials.length > 0) && <div className="space-y-3">
        {settings.visibility.newsletter && <>
          <h2 className={headingStyle}>{text('newsletter')}</h2><p className="text-[#CBD5E1]">{text('newsletterDescription')}</p>
          <form className="flex" onSubmit={async event => {
            event.preventDefault(); if (busy) return; setBusy(true);
            try {
              const address = email.trim().toLowerCase();
              if (DATABASE_MODE) { await api('subscribe', 'POST', { email: address }); onToast(language === 'en' ? 'Thank you for subscribing!' : 'Waad ku mahadsan tahay is-qoristaada!'); }
              else {
                const subscribers = readStored<string[]>('idogtc_subscribers', [], value => Array.isArray(value) && value.every(email => typeof email === 'string'));
                if (!writeStored('idogtc_subscribers', [...new Set([...subscribers, address])])) return;
                onToast(language === 'en' ? 'Email saved on this device.' : 'Email-ka waxaa lagu kaydiyey qalabkan.');
              }
              setEmail('');
            } catch (error) { reportApiError(error); } finally { setBusy(false); }
          }}>
            <input type="email" aria-label={text('emailPlaceholder') || 'Email'} placeholder={text('emailPlaceholder')} value={email} onChange={event => setEmail(event.target.value)} required className="min-w-0 p-2 w-full text-xs text-[#3D464D] rounded-l bg-white" />
            <button type="submit" disabled={busy} className="bg-[#FFD333] text-[#3D464D] font-bold px-3 rounded-r hover:bg-[#E5BE2C] shrink-0 disabled:opacity-60">{busy ? '...' : text('subscribe')}</button>
          </form>
        </>}
        {settings.visibility.social && socials.length > 0 && <><h2 className={`${headingStyle} pt-2`}>{text('social')}</h2><div className="flex gap-2">{socials.map(([name, url]) => {
          const Icon = socialIcons[name as keyof typeof socialIcons];
          return <a key={name} href={url} aria-label={name} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded bg-[#4F5B66] flex items-center justify-center hover:bg-[#FFD333] hover:text-[#3D464D]"><Icon size={16} /></a>;
        })}</div></>}
      </div>}
    </div>
    <div className="max-w-7xl mx-auto px-4 pt-5 flex flex-col md:flex-row items-center justify-between text-[#CBD5E1] gap-3 text-center sm:text-left">
      {settings.visibility.copyright && <p>{footerText(settings.copyright, language).replaceAll('{year}', String(new Date().getFullYear())).replaceAll('{company}', company.name)}</p>}
      {settings.visibility.domain && <p>{text('domain')}: {validSocialUrl(domain) ? <a href={domain} className="text-[#FFD333] hover:underline">{company.domain}</a> : company.domain}</p>}
    </div>
  </footer>;
}
