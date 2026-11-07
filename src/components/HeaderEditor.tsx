import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { HeaderLink, HeaderSettings, HeaderText } from '../types/store';
import { getHeaderSettings, HEADER_TARGETS } from '../data/headerSettings';
import { ImagePickerField } from './ImagePickerField';
import { ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';

const headerTabs = [
  { id: 'brand', en: 'Logo & brand', so: 'Logo & magaca' },
  { id: 'contact', en: 'Phone & WhatsApp', so: 'Telefoon & WhatsApp' },
  { id: 'menu', en: 'Main menu', so: 'Menu-ga weyn' },
  { id: 'topLinks', en: 'Top links', so: 'Xiriirrada sare' },
  { id: 'text', en: 'Header text', so: 'Qoraallada' },
  { id: 'visibility', en: 'Visibility', so: 'Muuji / qari' },
] as const;
type HeaderTab = typeof headerTabs[number]['id'];

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
  const [expandedId, setExpandedId] = useState<string | null>(links[0]?.id ?? null);
  const change = (index: number, fields: Partial<HeaderLink>) => onChange(links.map((item, i) => i === index ? { ...item, ...fields } : item));
  const move = (index: number, offset: number) => {
    const next = [...links]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; onChange(next);
  };
  return <section className="space-y-3"><h3 className="font-bold text-white">{label}</h3>
    {links.map((link, index) => <div key={link.id} className="p-3 border border-slate-600 rounded space-y-3" data-testid="header-menu-row">
      <button type="button" className="header-menu-toggle" aria-expanded={expandedId === link.id} aria-controls={`menu-fields-${link.id}`} onClick={() => setExpandedId(expandedId === link.id ? null : link.id)}>
        <span><span className="header-menu-index">{index + 1}</span>{link.label.en || link.label.so || 'New link'}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      <div id={`menu-fields-${link.id}`} hidden={expandedId !== link.id} className="header-menu-fields space-y-3">
      <TextPair label={`${label} ${index + 1}`} value={link.label} onChange={value => change(index, { label: value })} />
      <div className="flex flex-wrap items-end gap-3 text-xs">
        <label className="text-slate-300">Meesha uu aadayo / Destination
          <select aria-label={`${label} destination ${index + 1}`} className={inputStyle} value={link.target} onChange={event => change(index, { target: event.target.value as HeaderLink['target'] })}>
            {HEADER_TARGETS.map(target => <option key={target} value={target}>{destinationLabels[target]}</option>)}
          </select>
        </label>
        <label><input type="checkbox" checked={link.visible} onChange={event => change(index, { visible: event.target.checked })} /> Muuji / Show</label>
        <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="px-2 py-1 border rounded disabled:opacity-30" aria-label={`Move ${label} ${index + 1} up`}><ArrowUp size={15} aria-hidden="true" /></button>
        <button type="button" disabled={index === links.length - 1} onClick={() => move(index, 1)} className="px-2 py-1 border rounded disabled:opacity-30" aria-label={`Move ${label} ${index + 1} down`}><ArrowDown size={15} aria-hidden="true" /></button>
        <button type="button" onClick={() => onChange(links.filter((_, i) => i !== index))} className="text-rose-300">Tirtir / Remove</button>
      </div>
      </div>
    </div>)}
    <button type="button" disabled={links.length >= 12} className="text-sm text-[#FFD333] disabled:opacity-30" onClick={() => {
      const id = crypto.randomUUID();
      onChange([...links, { id, label: { en: 'New Link', so: 'Menu Cusub' }, target: 'contact', visible: true }]);
      setExpandedId(id);
    }}>+ Ku dar / Add {label}</button>
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
  const [activeTab, setActiveTab] = useState<HeaderTab>('brand');
  const panelProps = (id: HeaderTab) => ({ id: `header-panel-${id}`, role: 'tabpanel', 'aria-labelledby': `header-tab-${id}`, hidden: activeTab !== id, tabIndex: 0 });
  const field = (key: keyof HeaderSettings, value: unknown) => setForm(previous => ({ ...previous, [key]: value }));
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy || uploading) return;
    setMessage(''); setBusy(true);
    try {
      if (form.visibility.logo && !form.image.trim()) { setActiveTab('brand'); throw new Error('Dooro logo ama qari / Choose a logo or turn off Show logo.'); }
      if (!bosasoPhone.trim() || !dubaiPhone.trim()) { setActiveTab('contact'); throw new Error('Geli lambarrada Bosaso iyo Dubai / Enter the Bosaso and Dubai phone numbers.'); }
      for (const value of [bosasoPhone, dubaiPhone, form.whatsappPhone, form.customerServicePhone]) {
        if (value && (!/^\+?[\d\s()-]{7,30}$/.test(value) || value.replace(/\D/g, '').length < 7 || value.replace(/\D/g, '').length > 15)) { setActiveTab('contact'); throw new Error('Geli lambar caalami ah oo sax ah / Enter a valid international phone number.'); }
      }
      for (const [tab, links] of [['topLinks', form.topLinks], ['menu', form.navigation]] as const) for (const link of links) if (!link.label.en.trim()) { setActiveTab(tab); throw new Error('Menu kasta magac English ah sii / Every menu link needs an English name.'); }
      await updateCompanySettings({ header: form, bosasoPhone, dubaiPhone });
      setMessage(language === 'en' ? 'Header saved successfully.' : 'Header-ka waa la kaydiyey.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save header.'); }
    finally { setBusy(false); }
  };
  const labels: Record<keyof HeaderSettings['labels'], string> = {
    bosaso: 'Bosaso label', dubai: 'Dubai label', customerService: 'Customer service label', search: 'Search placeholder',
    categories: 'Categories button', allCategories: 'All categories', whatsapp: 'WhatsApp button', wishlist: 'Wishlist label', cart: 'Cart label',
  };
  return <form onSubmit={save} noValidate className="header-editor space-y-5 text-slate-300 max-w-4xl" aria-label="Header settings">
    <div><h2 className="text-2xl font-extrabold text-white">Header / Maamulka Header-ka</h2><p className="text-xs text-slate-400 mt-1">Logo, magaca, menu-yada iyo WhatsApp-ka. Isbeddelladu waxay ka muuqanayaan desktop iyo mobile.</p></div>
    <div className="header-savebar bg-[#0F172A] border border-slate-600 rounded p-3 space-y-2">
      <button type="submit" disabled={busy || uploading} className="bg-[#FFD333] text-[#3D464D] rounded px-5 py-3 font-bold text-sm disabled:opacity-60">{busy ? 'Saving...' : uploading ? 'Uploading logo...' : 'Save Header / Kaydi Header-ka'}</button>
      {message && <p role="status" className="text-sm">{message}</p>}
    </div>
    <div role="tablist" aria-label={language === 'en' ? 'Header sections' : 'Qaybaha header-ka'} className="header-tabs">
      {headerTabs.map((tab, index) => <button key={tab.id} type="button" role="tab" id={`header-tab-${tab.id}`} aria-controls={`header-panel-${tab.id}`} aria-selected={activeTab === tab.id} tabIndex={activeTab === tab.id ? 0 : -1} disabled={busy || uploading} onClick={() => setActiveTab(tab.id)} onKeyDown={event => {
        const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (!offset && event.key !== 'Home' && event.key !== 'End') return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? headerTabs.length - 1 : (index + offset + headerTabs.length) % headerTabs.length;
        setActiveTab(headerTabs[next].id); document.getElementById(`header-tab-${headerTabs[next].id}`)?.focus();
      }}>{tab[language]}</button>)}
    </div>
    <fieldset disabled={busy} className="space-y-6 disabled:opacity-60">
      <section {...panelProps('brand')} className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 space-y-4">
        <ImagePickerField label="Logo" value={form.image} onChange={value => field('image', value)} mediaItems={mediaItems} onUploadNew={addMediaItem} language={language} onShowToast={setMessage} onProcessingChange={setUploading} />
        <div className="grid sm:grid-cols-2 gap-3">
          {(['brandPrimary', 'brandSecondary', 'logoAlt'] as const).map(key => <label key={key} className="text-xs">{{ brandPrimary: 'Magaca koowaad / Brand first', brandSecondary: 'Magaca labaad / Brand second', logoAlt: 'Logo description' }[key]}<input className={inputStyle} aria-label={key} value={form[key]} maxLength={200} onChange={event => field(key, event.target.value)} /></label>)}
        </div>
        <TextPair label="Tagline" value={form.tagline} onChange={value => field('tagline', value)} />
      </section>
      <section {...panelProps('contact')} className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 space-y-3">
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
      <section {...panelProps('text')} className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 space-y-4">
        <h3 className="font-bold text-white">Qoraallada / Header text</h3>
        {Object.entries(labels).map(([key, label]) => <TextPair key={key} label={label} value={form.labels[key as keyof typeof labels]} onChange={value => field('labels', { ...form.labels, [key]: value })} />)}
      </section>
      <section {...panelProps('topLinks')} className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 space-y-6">
        <MenuEditor label="Top links" links={form.topLinks} onChange={value => field('topLinks', value)} />
      </section>
      <section {...panelProps('menu')} className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 space-y-6">
        <MenuEditor label="Main menu" links={form.navigation} onChange={value => field('navigation', value)} />
      </section>
      <section {...panelProps('visibility')} className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 space-y-3">
        <h3 className="font-bold text-white">Muuji ama qari / Visibility</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">{Object.keys(form.visibility).map(key => <label key={key}><input type="checkbox" aria-label={`Show ${key}`} checked={form.visibility[key as keyof typeof form.visibility]} onChange={event => field('visibility', { ...form.visibility, [key]: event.target.checked })} /> {visibilityLabels[key as keyof typeof visibilityLabels]}</label>)}</div>
      </section>
    </fieldset>
  </form>;
}
