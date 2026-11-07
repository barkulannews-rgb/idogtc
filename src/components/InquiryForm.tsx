import React, { useState, useEffect } from 'react';
import { Language, InquiryFormData } from '../types';
import { CONTENT, OFFICES, PRODUCT_CATEGORIES } from '../data/translations';
import { Send, MessageCircle, Mail, CheckCircle2, Sparkles } from 'lucide-react';

interface InquiryFormProps {
  language: Language;
  preselectedCategory?: string;
  preselectedItem?: string;
}

export const InquiryForm: React.FC<InquiryFormProps> = ({
  language,
  preselectedCategory,
  preselectedItem,
}) => {
  const t = CONTENT[language];

  const [formData, setFormData] = useState<InquiryFormData>({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    category: PRODUCT_CATEGORIES[0].nameEn,
    destination: 'Bosaso Port, Somalia',
    message: '',
    targetOffice: 'bosaso',
  });

  const [submitted, setSubmitted] = useState(false);
  const [formattedWhatsAppUrl, setFormattedWhatsAppUrl] = useState('');
  const [formattedMailtoUrl, setFormattedMailtoUrl] = useState('');

  useEffect(() => {
    if (preselectedCategory || preselectedItem) {
      setFormData((prev) => ({
        ...prev,
        category: preselectedCategory || prev.category,
        message: preselectedItem
          ? `Inquiry for item: ${preselectedItem}\nQuantity needed: `
          : prev.message,
      }));
    }
  }, [preselectedCategory, preselectedItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetPhone =
      formData.targetOffice === 'bosaso'
        ? OFFICES.bosaso.phoneRaw
        : OFFICES.dubai.phoneRaw;

    const summaryText =
      `*NEW TRADE INQUIRY - IDO GENERAL TRADING CO.*\n` +
      `----------------------------------------\n` +
      `*Name:* ${formData.fullName}\n` +
      `*Company:* ${formData.companyName || 'N/A'}\n` +
      `*Phone:* ${formData.phone}\n` +
      `*Email:* ${formData.email || 'N/A'}\n` +
      `*Category:* ${formData.category}\n` +
      `*Destination:* ${formData.destination}\n` +
      `*Office Target:* ${formData.targetOffice === 'bosaso' ? 'Bosaso HQ' : 'Dubai Hub'}\n` +
      `----------------------------------------\n` +
      `*Requirements:* ${formData.message}\n` +
      `----------------------------------------\n` +
      `Sent via Official Portal (idogtc.com)`;

    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(summaryText)}`;

    const mailSubject = `[idogtc.com] Trade Inquiry - ${formData.category} - ${formData.fullName}`;
    const mailBody = summaryText;
    const mailUrl = `mailto:${OFFICES.bosaso.email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

    setFormattedWhatsAppUrl(waUrl);
    setFormattedMailtoUrl(mailUrl);
    setSubmitted(true);
  };

  return (
    <section id="inquiry" className="py-16 lg:py-24 border-b border-slate-800 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-4xl mx-auto p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              05. Direct Sourcing Request
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {t.inquiryTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              {t.inquirySubtitle}
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Office Target Radio selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 font-mono">
                  {t.formTargetOffice} <span className="text-amber-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, targetOffice: 'bosaso' })}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                      formData.targetOffice === 'bosaso'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{t.formTargetBosaso}</span>
                    <span className="text-[10px] font-mono text-slate-400">+252 90 512 4444</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, targetOffice: 'dubai' })}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                      formData.targetOffice === 'dubai'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{t.formTargetDubai}</span>
                    <span className="text-[10px] font-mono text-slate-400">+971 50 150 7332</span>
                  </button>
                </div>
              </div>

              {/* Two Column Name & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    {t.formFullName} <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmed Ali"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    {t.formCompanyName}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Puntland Construction Co."
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Two Column Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    {t.formPhone} <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+252 90 XXX XXXX or +971 XX XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    {t.formEmail}
                  </label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Category & Destination Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    {t.formCategory}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-amber-400 focus:outline-none transition-colors"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.nameEn}>
                        {language === 'en' ? cat.nameEn : cat.nameSo}
                      </option>
                    ))}
                    <option value="Custom General Cargo">Custom General Cargo / Machinery</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    {t.formDestination}
                  </label>
                  <select
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-amber-400 focus:outline-none transition-colors"
                  >
                    <option value="Bosaso Port, Puntland">Bosaso Port, Puntland, Somalia</option>
                    <option value="Dubai Freezone, UAE">Dubai Freezone, UAE</option>
                    <option value="Mogadishu Port, Somalia">Mogadishu Port, Somalia</option>
                    <option value="Berbera Port, Somaliland">Berbera Port, Somaliland</option>
                    <option value="Other Regional Port">Other Regional Port</option>
                  </select>
                </div>
              </div>

              {/* Message Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {t.formMessage} <span className="text-amber-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Specify product types, metric tons / container count, or custom specifications..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-amber-400 focus:outline-none transition-colors"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 text-xs font-extrabold text-slate-950 gold-button-gradient rounded-xl shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{t.ctaSubmitForm}</span>
              </button>
            </form>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-950 border border-emerald-500/30 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white font-display">
                  {language === 'en' ? 'Trade Request Ready!' : 'Dalabkii Waa Diyaar!'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                  {t.formSuccessMsg}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={formattedWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-emerald-300 bg-emerald-950 border border-emerald-700 rounded-xl hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                </a>

                <a
                  href={formattedMailtoUrl}
                  className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-amber-300 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 font-mono"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send via Email</span>
                </a>
              </div>

              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-slate-400 hover:text-white underline pt-2 block mx-auto"
              >
                {language === 'en' ? 'Submit another request' : 'Dir dalab kale'}
              </button>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
