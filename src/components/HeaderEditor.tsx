import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { HeaderLink, HeaderSettings, HeaderText } from '../types/store';
import { getHeaderSettings, HEADER_TARGETS } from '../data/headerSettings';
import { ImagePickerField } from './ImagePickerField';

const inputStyle = 'w-full px-3 py-2 bg-[#0F172A] border border-[#475569] rounded text-xs text-white focus:outline-none focus:border-[#FFD333]';
const destinationLabels = { top: 'Home / Bogga hore', categories: 'Categories / Qaybaha', featured: 'Featured goods / Alaabta gaarka ah', recent: 'Recent arrivals / Alaabta cusub', about: 'About / Shirkadda', contact: 'Contact / Xiriirka' };
const visibilityLabels: Record<keyof HeaderSettings['visibility'], string> = { topBar: 'Barta sare / Top bar', logo: 'Logo', brand: 'Magaca / Brand', tagline: 'Hal-ku-dhegga / Tagline', search: 'Raadinta / Search', customerService: 'Adeegga macaamiisha', categories: 'Qaybaha / Categories', whatsapp: 'WhatsApp', currency: 'Lacagta / Currency', language: 'Luqadda / Language', wishlist: 'Wishlist', cart: 'Seleda / Cart' };

function TextPair({ label, value, onChange }: { label: string; value: HeaderText; onChange: (value: HeaderText) => void }) {
  return <fieldset className="space-y-2"><legend className="text-xs text-slate-300 font-bold">{label}</legend>
    <div className="grid sm:grid-cols-2 gap-2">
      {(['en', 'so'] as const).map(lang => <label key={lang} className="text-xs text-slate-400">{lang === 'en' ? 'English' : 'Af Soomaali'}
        <input aria-label={`${label} ${lang}`} className={inputStyle} value={value[lang]} maxLength={500} onChange={event => onChange({ ...value, [lang]: event.target.value })} />
      </label>)}
    </div>
  </fieldset>;
}

function MenuEditor({ label, links, onChange }: { label: string; links: HeaderLink[]; onChange: (links: HeaderLink[]) => void }) {
  const change = (index: number, fields: Partial<HeaderLink>) => onChange(links.map((item, i) => i === index ? { ...item, ...fields } : item));
  const move = (index: number, offset: number) => {
    const next = [...links]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; onChange(next);
  };
  return <section className="space-y-3"><h3 className="font-bold text-white">{label}</h3>
    {links.map((link, index) => <div key={link.id} className="p-3 border border-slate-600 rounded space-y-3" data-testid="header-menu-row">
      <TextPair label={`${label} ${index + 1}`} value={link.label} onChange={value => change(index, { label: value })} />
      <div className="flex flex-wrap items-end gap-3 text-xs">
        <label className="text-slate-300">Meesha uu aadayo / Destination
          <select aria-label={`${label} destination ${index + 1}`} className={inputStyle} value={link.target} onChange={event => change(index, { target: event.target.value as HeaderLink['target'] })}>
            {HEADER_TARGETS.map(target => <option key={target} value={target}>{destinationLabels[target]}</option>)}
          </select>
        </label>
        <label><input type="checkbox" checked={link.visible} onChange={event => change(index, { visible: event.target.checked })} /> Muuji / Show</label>
        <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="px-2 py-1 border rounded disabled:opacity-30" aria-label={`Move ${label} ${index + 1} up`}>↑</button>
        <button type="button" disabled={index === links.length - 1} onClick={() => move(index, 1)} className="px-2 py-1 border rounded disabled:opacity-30" aria-label={`Move ${label} ${index + 1} down`}>↓</button>
        <button type="button" onClick={() => onChange(links.filter((_, i) => i !== index))} className="text-rose-300">Tirtir / Remove</button>
      </div>
    </div>)}
    <button type="button" disabled={links.length >= 12} className="text-sm text-[#FFD333] disabled:opacity-30" onClick={() => onChange([...links, { id: crypto.randomUUID(), label: { en: 'New Link', so: 'Menu Cusub' }, target: 'contact', visible: true }])}>+ Ku dar / Add {label}</button>
  </section>;
}

export function HeaderEditor() {
  const { companySettings, updateCompanySettings, mediaItems, addMediaItem, language } = useStore();
  const [form, setForm] = useState<HeaderSettings>(() => structuredClone(getHeaderSettings(companySettings)));
  const [bosasoPhone, setBosasoPhone] = useState(companySettings.bosasoPhone);
  const [dubaiPhone, setDubaiPhone] = useState(companySettings.dubaiPhone);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const field = (key: keyof HeaderSettings, value: unknown) => setForm(previous => ({ ...previous, [key]: value }));
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy || uploading) return;
    setMessage(''); setBusy(true);
    try {
      if (form.visibility.logo && !form.image.trim()) throw new Error('Dooro logo ama qari / Choose a logo or turn off Show logo.');
      for (const value of [bosasoPhone, dubaiPhone, form.whatsappPhone, form.customerServicePhone]) {
        if (value && (!/^\+?[\d\s()-]{7,30}$/.test(value) || value.replace(/\D/g, '').length < 7 || value.replace(/\D/g, '').length > 15)) throw new Error('Geli lambar caalami ah oo sax ah / Enter a valid international phone number.');
      }
      for (const link of [...form.topLinks, ...form.navigation]) if (!link.label.en.trim()) throw new Error('Menu kasta magac English ah sii / Every menu link needs an English name.');
      await updateCompanySettings({ header: form, bosasoPhone, dubaiPhone });
      setMessage(language === 'en' ? 'Header saved successfully.' : 'Header-ka waa la kaydiyey.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save header.'); }
    finally { setBusy(false); }
  };
  const labels: Record<keyof HeaderSettings['labels'], string> = {
    bosaso: 'Bosaso label', dubai: 'Dubai label', customerService: 'Customer service label', search: 'Search placeholder',
    categories: 'Categories button', allCategories: 'All categories', whatsapp: 'WhatsApp button', wishlist: 'Wishlist label', cart: 'Cart label',
  };
  return <form onSubmit={save} className="space-y-6 text-slate-300 max-w-4xl" aria-label="Header settings">
    <div><h2 className="text-2xl font-extrabold text-white">Header / Maamulka Header-ka</h2><p className="text-xs text-slate-400 mt-1">Logo, magaca, menu-yada iyo WhatsApp-ka. Isbeddelladu waxay ka muuqanayaan desktop iyo mobile.</p></div>
    <div className="sticky top-0 z-10 bg-[#0F172A] border border-slate-600 rounded p-3 space-y-2">
      <button type="submit" disabled={busy || uploading} className="bg-[#FFD333] text-[#3D464D] rounded px-5 py-3 font-bold text-sm disabled:opacity-60">{busy ? 'Saving…' : uploading ? 'Uploading logo…' : 'Save Header / Kaydi Header-ka'}</button>
      {message && <p role="status" className="text-sm">{message}</p>}
    </div>
    <fieldset disabled={busy} className="space-y-6 disabled:opacity-60">
      <section className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 space-y-4">
        <ImagePickerField label="Logo" value={form.image} onChange={value => field('image', value)} mediaItems={mediaItems} onUploadNew={addMediaItem} language={language} onShowToast={setMessage} onProcessingChange={setUploading} />
        <div className="grid sm:grid-cols-2 gap-3">
          {(['brandPrimary', 'brandSecondary', 'logoAlt'] as const).map(key => <label key={key} className="text-xs">{{ brandPrimary: 'Magaca koowaad / Brand first', brandSecondary: 'Magaca labaad / Brand second', logoAlt: 'Logo description' }[key]}<input className={inputStyle} aria-label={key} value={form[key]} maxLength={200} onChange={event => field(key, event.target.value)} /></label>)}
        </div>
        <TextPair label="Tagline" value={form.tagline} onChange={value => field('tagline', value)} />
      </section>
      <section className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 space-y-3">
        <h3 className="text-white font-bold">Telefoon iyo WhatsApp</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs">Bosaso phone<input type="tel" aria-label="Bosaso phone" className={inputStyle} value={bosasoPhone} onChange={event => setBosasoPhone(event.target.value)} required /></label>
          <label className="text-xs">Dubai phone<input type="tel" aria-label="Dubai phone" className={inputStyle} value={dubaiPhone} onChange={event => setDubaiPhone(event.target.value)} required /></label>
          <label className="text-xs">WhatsApp number<input type="tel" aria-label="WhatsApp number" className={inputStyle} placeholder={bosasoPhone} value={form.whatsappPhone} onChange={event => field('whatsappPhone', event.target.value)} /></label>
          <label className="text-xs">Customer service number<input type="tel" aria-label="Customer service number" className={inputStyle} placeholder={bosasoPhone} value={form.customerServicePhone} onChange={event => field('customerServicePhone', event.target.value)} /></label>
        </div>
        <p className="text-xs text-slate-400">WhatsApp iyo Customer service haddii bannaan laga tago, lambarka Bosaso ayay adeegsanayaan. WhatsApp-kan waxaa adeegsada header-ka iyo dalabka cart-ka.</p>
        <TextPair label="WhatsApp message" value={form.whatsappMessage} onChange={value => field('whatsappMessage', value)} />
      </section>
      <section className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 space-y-4">
        <h3 className="font-bold text-white">Qoraallada / Header text</h3>
        {Object.entries(labels).map(([key, label]) => <TextPair key={key} label={label} value={form.labels[key as keyof typeof labels]} onChange={value => field('labels', { ...form.labels, [key]: value })} />)}
      </section>
      <section className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 space-y-6">
        <MenuEditor label="Top links" links={form.topLinks} onChange={value => field('topLinks', value)} />
        <MenuEditor label="Main menu" links={form.navigation} onChange={value => field('navigation', value)} />
      </section>
      <section className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 space-y-3">
        <h3 className="font-bold text-white">Muuji ama qari / Visibility</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">{Object.keys(form.visibility).map(key => <label key={key}><input type="checkbox" aria-label={`Show ${key}`} checked={form.visibility[key as keyof typeof form.visibility]} onChange={event => field('visibility', { ...form.visibility, [key]: event.target.checked })} /> {visibilityLabels[key as keyof typeof visibilityLabels]}</label>)}</div>
      </section>
    </fieldset>
  </form>;
}
