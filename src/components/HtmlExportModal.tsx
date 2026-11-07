import React, { useState } from 'react';
import { Language } from '../types';
import { CONTENT } from '../data/translations';
import { generateStandaloneHtmlCode } from '../utils/generateStandaloneHtml';
import { Code2, Copy, Download, Check, X, Server, FileCode, ExternalLink } from 'lucide-react';

interface HtmlExportModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const HtmlExportModal: React.FC<HtmlExportModalProps> = ({
  language,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const t = CONTENT[language];
  const [copied, setCopied] = useState(false);
  const htmlCode = generateStandaloneHtmlCode();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                {t.exportHtmlTitle}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Target Domain: https://idogtc.com/
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 font-mono uppercase flex items-center gap-1.5">
              <Server className="w-4 h-4" />
              {language === 'en' ? 'cPanel / Hosting Deployment Instructions' : 'Faahfaahinta Sida Loogu Shubayo cPanel-ka'}
            </h4>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal pl-5">
              <li>
                {language === 'en'
                  ? 'Click "Download index.html File" below or copy the code.'
                  : 'Guji "Download index.html File" si aad kombuyutarka kugu shobato.'}
              </li>
              <li>
                {language === 'en'
                  ? 'Log in to your hosting account for idogtc.com (cPanel, Plesk, or Cloudflare).'
                  : 'Gal maamulka hosting-ka idogtc.com (cPanel ama File Manager).'}
              </li>
              <li>
                {language === 'en'
                  ? 'Navigate to the public_html root directory and upload or replace index.html.'
                  : 'Gal gudaha public_html, ka dibna upload-gareey faylka index.html.'}
              </li>
              <li>
                {language === 'en'
                  ? 'Visit https://idogtc.com/ to verify your new beautiful under-construction landing page live!'
                  : 'Ka dib booqo https://idogtc.com/ si aad u aragto bogaaga oo shaqaynaya!'}
              </li>
            </ol>
          </div>

          {/* Code Viewer Container */}
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span>index.html (Standalone Output)</span>
              </span>
              <span className="text-[11px] text-slate-500">HTML5 • Tailwind CDN</span>
            </div>

            <pre className="p-4 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-64 leading-relaxed scrollbar-thin">
              <code>{htmlCode}</code>
            </pre>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-400">
            {language === 'en' ? 'Zero dependencies required.' : 'U diyaar ah in toos loo isticmaalo.'}
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleCopyCode}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : t.ctaCopyHtml}</span>
            </button>

            <button
              onClick={handleDownloadFile}
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold text-slate-950 gold-button-gradient rounded-xl shadow hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{t.ctaDownloadHtml}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
