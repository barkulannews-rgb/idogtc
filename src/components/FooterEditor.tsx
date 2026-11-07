import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { FooterLink, FooterSettings, FooterTarget, HeaderText } from '../types/store';
import { FOOTER_TARGETS, getFooterSettings, validSocialUrl } from '../data/footerSettings';

const input = 'w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 mt-1';
const tabs = [ ['content', 'Text & copyright', 'Qoraalka & xuquuqda'], ['contact', 'Contact details', 'Xogta xiriirka'], ['links', 'Footer menus', 'Menu-yada'], ['newsletter', 'Newsletter', 'Newsletter'], ['social', 'Social media', 'Baraha bulshada'], ['display', 'Show / hide', 'Muuji / qari'] ] as const;
type Tab = typeof tabs[number][0];
const labelNames: Record<keyof FooterSettings['labels'], string> = { contact: 'Contact heading', shop: 'Shop heading', account: 'Account heading', newsletter: 'Newsletter heading', newsletterDescription: 'Newsletter description', emailPlaceholder: 'Email placeholder', subscribe: 'Subscribe button', social: 'Social heading', domain: 'Domain label' };

function TextFields({ label, value, onChange }: { label: string; value: HeaderText; onChange: (value: HeaderText) => void }) {
  return <fieldset><legend className="text-sm font-semibold text-slate-700">{label}</legend><div className="grid sm:grid-cols-2 gap-3 mt-2">{(['en', 'so'] as const).map(lang => <label key={lang} className="text-xs text-slate-600">{lang === 'en' ? 'English' : 'Af Soomaali'}<textarea aria-label={`${label} ${lang}`} value={value[lang]} maxLength={2000} rows={2} onChange={event => onChange({ ...value, [lang]: event.target.value })} className={input} /></label>)}</div></fieldset>;
}

export function FooterEditor() {
  const { companySettings, categories, updateCompanySettings, language } = useStore();
  const [form, setForm] = useState(() => structuredClone(getFooterSettings(companySettings, categories)));
  const [contacts, setContacts] = useState(() => ({ bosasoAddress: companySettings.bosasoAddress, dubaiAddress: companySettings.dubaiAddress, bosasoPhone: companySettings.bosasoPhone, dubaiPhone: companySettings.dubaiPhone, email: companySettings.email, domain: companySettings.domain }));
  const [active, setActive] = useState<Tab>('content');
  const [expandedMenus, setExpandedMenus] = useState(() => ({ shopLinks: form.shopLinks[0]?.id ?? '', accountLinks: form.accountLinks[0]?.id ?? '' }));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const pair = (key: keyof FooterSettings['labels']) => <TextFields key={key} label={labelNames[key]} value={form.labels[key]} onChange={value => setForm({ ...form, labels: { ...form.labels, [key]: value } })} />;
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return; setMessage('');
    for (const url of Object.values(form.social)) if (!validSocialUrl(url)) { setActive('social'); setMessage('Use a full https:// social media link / Geli link https:// ah.'); return; }
    for (const list of [form.shopLinks, form.accountLinks]) for (const link of list) if (!link.label.en.trim()) { setActive('links'); setMessage('Every menu link needs an English name / Menu kasta magac sii.'); return; }
    if (contacts.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacts.email)) { setActive('contact'); setMessage('Enter a valid email address / Geli email sax ah.'); return; }
    if (contacts.domain && !validSocialUrl(/^https:\/\//.test(contacts.domain) ? contacts.domain : `https://${contacts.domain}`)) { setActive('contact'); setMessage('Enter a valid website domain / Geli domain sax ah.'); return; }
    for (const phone of [contacts.bosasoPhone, contacts.dubaiPhone]) if (phone && (!/^\+?[\d\s()-]{7,30}$/.test(phone) || phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15)) { setActive('contact'); setMessage('Enter valid international phone numbers / Geli lambarrada caalamiga ah.'); return; }
    setBusy(true);
    try { await updateCompanySettings({ footer: form, ...contacts }); setMessage(language === 'en' ? 'Footer saved successfully.' : 'Footer-ka waa la kaydiyey.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save footer.'); }
    finally { setBusy(false); }
  };
  const menu = (key: 'shopLinks' | 'accountLinks', title: string) => {
    const list = form[key];
    const update = (links: FooterLink[]) => setForm({ ...form, [key]: links });
    const move = (index: number, offset: number) => { const next = [...list]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; update(next); };
    return <section className="space-y-3"><h3 className="font-bold text-slate-800">{title}</h3>{list.map((link, index) => <div key={link.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <button type="button" className="header-menu-toggle" aria-expanded={expandedMenus[key] === link.id} aria-controls={`footer-fields-${link.id}`} onClick={() => setExpandedMenus({ ...expandedMenus, [key]: expandedMenus[key] === link.id ? '' : link.id })}><span><span className="header-menu-index">{index + 1}</span>{link.label.en || 'New link'}</span><span aria-hidden="true">{expandedMenus[key] === link.id ? '−' : '+'}</span></button>
      <div id={`footer-fields-${link.id}`} hidden={expandedMenus[key] !== link.id} className="header-menu-fields space-y-3">
      <TextFields label={`${title} ${index + 1}`} value={link.label} onChange={value => update(list.map(item => item.id === link.id ? { ...item, label: value } : item))} />
      <label className="block text-xs text-slate-600">{language === 'en' ? 'Destination' : 'Meesha uu aadayo'}<select aria-label={`${title} destination ${index + 1}`} value={link.target} onChange={event => update(list.map(item => item.id === link.id ? { ...item, target: event.target.value as FooterTarget } : item))} className={input}>
        {FOOTER_TARGETS.map(target => <option key={target} value={target}>{target}</option>)}
        {categories.map(category => <option key={category.id} value={`category:${category.id}`}>{category.name}</option>)}
        {link.target.startsWith('category:') && !categories.some(category => `category:${category.id}` === link.target) && <option value={link.target}>Unavailable category / Qayb la saaray</option>}
      </select></label>
      <div className="flex items-center flex-wrap gap-3 text-xs text-slate-700"><label><input type="checkbox" checked={link.visible} onChange={event => update(list.map(item => item.id === link.id ? { ...item, visible: event.target.checked } : item))} /> {language === 'en' ? 'Show link' : 'Muuji xiriirka'}</label>
        <button type="button" disabled={index === 0} aria-label={`Move ${title} ${index + 1} up`} onClick={() => move(index, -1)} className="border rounded-lg p-2 disabled:opacity-30"><ArrowUp size={16} /></button>
        <button type="button" disabled={index === list.length - 1} aria-label={`Move ${title} ${index + 1} down`} onClick={() => move(index, 1)} className="border rounded-lg p-2 disabled:opacity-30"><ArrowDown size={16} /></button>
        <button type="button" aria-label={`Remove ${title} ${index + 1}`} onClick={() => update(list.filter(item => item.id !== link.id))} className="text-rose-700 flex items-center gap-1"><Trash2 size={14} />{language === 'en' ? 'Remove' : 'Tirtir'}</button>
      </div>
      </div>
    </div>)}<button type="button" disabled={list.length >= 12} onClick={() => { const id = crypto.randomUUID(); update([...list, { id, label: { en: 'New link', so: 'Xiriir cusub' }, target: 'contact', visible: true }]); setExpandedMenus({ ...expandedMenus, [key]: id }); }} className="flex items-center gap-2 text-sm font-bold text-slate-700 disabled:opacity-30"><Plus size={16} />{language === 'en' ? 'Add link' : 'Ku dar xiriir'}</button></section>;
  };
  return <form onSubmit={save} noValidate className="header-editor max-w-4xl space-y-5" aria-label="Footer settings">
    <div><h2 className="font-extrabold">Footer</h2><p className="text-sm text-slate-600 mt-1">{language === 'en' ? 'Manage the bottom of your website. Save once to apply changes across all pages.' : 'Maamul qaybta hoose ee website-ka. Kaydi si isbeddelladu uga muuqdaan bogagga oo dhan.'}</p></div>
    <div className="header-savebar border border-slate-300 p-3"><button type="submit" disabled={busy} className="bg-[#FFD333] text-[#3D464D] rounded-lg px-5 py-3 text-sm font-bold disabled:opacity-60">{busy ? 'Saving...' : language === 'en' ? 'Save Footer' : 'Kaydi Footer-ka'}</button>{message && <p role="status" className="text-sm">{message}</p>}</div>
    <div role="tablist" aria-label="Footer sections" className="header-tabs">{tabs.map(([id, en, so], index) => <button key={id} type="button" role="tab" id={`footer-tab-${id}`} aria-controls={`footer-panel-${id}`} aria-selected={active === id} tabIndex={active === id ? 0 : -1} disabled={busy} onClick={() => setActive(id)} onKeyDown={event => {
      const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!offset && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + offset + tabs.length) % tabs.length;
      setActive(tabs[next][0]); document.getElementById(`footer-tab-${tabs[next][0]}`)?.focus();
    }}>{language === 'en' ? en : so}</button>)}</div>
    <fieldset disabled={busy} className="disabled:opacity-60">{tabs.map(([id]) => <section key={id} role="tabpanel" id={`footer-panel-${id}`} aria-labelledby={`footer-tab-${id}`} hidden={active !== id} tabIndex={0} className="bg-white border border-slate-200 rounded-xl space-y-5">
      {id === 'content' && <><TextFields label="Company description" value={form.description} onChange={value => setForm({ ...form, description: value })} />{(['contact', 'shop', 'account', 'domain'] as const).map(pair)}<TextFields label="Copyright" value={form.copyright} onChange={value => setForm({ ...form, copyright: value })} /><p className="text-xs text-slate-600">{'{year}'} = {language === 'en' ? 'current year' : 'sannadka'}, {'{company}'} = {language === 'en' ? 'company name' : 'magaca shirkadda'}.</p></>}
      {id === 'contact' && <><p className="text-sm text-slate-600">{language === 'en' ? 'These details are shared with Company & Contact and the header.' : 'Xogtani waxay la wadaagtaa qaybta Company & Contact iyo header-ka.'}</p><div className="grid sm:grid-cols-2 gap-4">{Object.entries(contacts).map(([key, value]) => <label key={key} className="text-xs text-slate-600">{{ bosasoAddress: 'Bosaso address', dubaiAddress: 'Dubai address', bosasoPhone: 'Bosaso phone', dubaiPhone: 'Dubai phone', email: 'Company email', domain: 'Website domain' }[key]}<input aria-label={`Footer ${key}`} type={key === 'email' ? 'email' : key.endsWith('Phone') ? 'tel' : 'text'} className={input} value={value} maxLength={2000} onChange={event => setContacts({ ...contacts, [key]: event.target.value })} /></label>)}</div></>}
      {id === 'links' && <>{menu('shopLinks', 'Shop link')}{menu('accountLinks', 'Account link')}</>}
      {id === 'newsletter' && <>{(['newsletter', 'newsletterDescription', 'emailPlaceholder', 'subscribe'] as const).map(pair)}</>}
      {id === 'social' && <>{pair('social')}<p className="text-xs text-slate-600">{language === 'en' ? 'Use full https:// links. Leave a field blank to hide that icon.' : 'Geli link https:// ah. Meel bannaan waxay qarinaysaa astaantaas.'}</p>{Object.entries(form.social).map(([key, value]) => <label key={key} className="block text-sm text-slate-700 capitalize">{key}<input type="url" aria-label={`Footer ${key} URL`} placeholder="https://" value={value} maxLength={2000} onChange={event => setForm({ ...form, social: { ...form.social, [key]: event.target.value.trim() } })} className={input} /></label>)}</>}
      {id === 'display' && <div className="grid sm:grid-cols-2 gap-4">{Object.entries(form.visibility).map(([key, value]) => <label key={key} className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 flex items-center gap-3"><input type="checkbox" aria-label={`Show footer ${key}`} checked={value} onChange={event => setForm({ ...form, visibility: { ...form.visibility, [key]: event.target.checked } })} /><span>{key === 'enabled' ? (language === 'en' ? 'Entire footer' : 'Footer-ka oo dhan') : key}</span></label>)}</div>}
    </section>)}</fieldset>
  </form>;
}
