import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Check, Link, ChevronDown, ChevronUp, Sparkles, Folder } from 'lucide-react';
import { MediaItem } from '../types/store';
import { processImageFile } from '../utils/imageUpload';
import { I18N } from '../data/i18n';
import { DATABASE_MODE } from '../utils/api';

interface ImagePickerFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  category?: string;
  mediaItems: MediaItem[];
  onUploadNew: (title: string, url: string, category?: string) => void | MediaItem | Promise<void | MediaItem>;
  language: 'en' | 'so';
  onShowToast?: (msg: string) => void;
  onProcessingChange?: (processing: boolean) => void;
}

export const ImagePickerField: React.FC<ImagePickerFieldProps> = ({
  value,
  onChange,
  label,
  category = 'General',
  mediaItems,
  onUploadNew,
  language,
  onShowToast,
  onProcessingChange
}) => {
  const t = I18N[language];
  const [showGallery, setShowGallery] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBase64 = value?.startsWith('data:image');
  const isPreset = value?.startsWith('/images/') || value?.startsWith('/src/assets');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      onProcessingChange?.(true);
      const { dataUrl, name } = await processImageFile(file);
      const saved = await onUploadNew(name, dataUrl, category);
      onChange(saved ? saved.url : dataUrl);
      if (onShowToast) {
        onShowToast(t.imageUploadedSuccess);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      alert(errorMsg);
    } finally {
      setIsProcessing(false);
      onProcessingChange?.(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-[#CBD5E1] uppercase">{label}</label>
          <span className="text-[10px] text-[#94A3B8]">
            {isBase64 ? '✓ Local Storage' : isPreset ? '✓ System Asset' : '✓ Web URL'}
          </span>
        </div>
      )}

      {/* Main Preview and Action Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-2.5 bg-[#0F172A] border border-[#334155] rounded-lg">
        {/* Thumbnail Preview */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-[#1E293B] rounded-md overflow-hidden border border-[#475569] shrink-0 self-center sm:self-auto flex items-center justify-center">
          {value ? (
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-slate-500" />
          )}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="text-[10px] text-[#FFD333] font-bold animate-pulse">Loading...</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex-1 flex flex-col justify-between space-y-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Browse from Computer Button */}
            <label className="flex items-center gap-1.5 px-3 py-2 bg-[#FFD333] hover:bg-[#E5BE2C] text-[#3D464D] rounded font-bold text-xs cursor-pointer shadow transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{t.browseImage}</span>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>

            {/* Select from Media Gallery Button */}
            <button 
              type="button" 
              onClick={() => setShowGallery(!showGallery)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded font-semibold text-xs transition-colors cursor-pointer ${showGallery ? 'bg-[#334155] border-[#FFD333] text-white' : 'border-[#475569] bg-[#1E293B] text-slate-200 hover:text-white hover:border-[#64748B]'}`}
            >
              <Folder className="w-3.5 h-3.5 text-[#FFD333]" />
              <span>{t.selectFromStorage} ({mediaItems.length})</span>
              {showGallery ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Toggle manual URL input */}
            <button 
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="px-2 py-2 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
              title="Paste image link"
            >
              <Link className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">URL</span>
            </button>
          </div>

          <p className="text-[10px] text-[#94A3B8] leading-tight">
            {DATABASE_MODE ? (language === 'en' ? 'Images are uploaded to the server. Save the form to apply your selection.' : 'Sawirka server-ka ayaa lagu kaydiyaa. Kaydi foomka si aad u isticmaasho.') : language === 'en'
              ? 'Selected images are stored in browser storage and will deploy to any hosting without broken links.' 
              : 'Sawirada waxaa lagu kaydiyaa kaydka browser-ka, waxayna si toos ah ugu shaqeynayaan hosting kasta.'}
          </p>
        </div>
      </div>

      {/* Manual URL Input (Collapsible) */}
      {showUrlInput && (
        <div className="pt-1">
          <input 
            type="text" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#0F172A] border border-[#475569] rounded text-[11px] text-white focus:outline-none focus:border-[#FFD333]"
            placeholder="https://example.com/image.jpg..."
          />
        </div>
      )}

      {/* Media Gallery Grid (Collapsible) */}
      {showGallery && (
        <div className="p-3 bg-[#1E293B] border border-[#334155] rounded-lg space-y-2 max-h-56 overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-slate-300 pb-1 border-b border-[#334155]">
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#FFD333]">
              {t.allStoredAssets}
            </span>
            <span className="text-[10px] text-slate-400">
              {language === 'en' ? 'Click image to apply' : 'Taabo sawirka si aad u doorato'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {mediaItems.map((item) => {
              const isSelected = value === item.url;
              return (
                <button 
                  type="button" 
                  key={item.id}
                  onClick={() => {
                    onChange(item.url);
                    setShowGallery(false);
                    if (onShowToast) {
                      onShowToast(language === 'en' ? `Selected "${item.title}"` : `Waxaa la doortay "${item.title}"`);
                    }
                  }}
                  className={`group relative p-1 border rounded text-left transition-all cursor-pointer bg-[#0F172A] ${isSelected ? 'border-[#FFD333] ring-2 ring-[#FFD333]' : 'border-[#334155] hover:border-[#64748B]'}`}
                >
                  <div className="relative aspect-video rounded overflow-hidden bg-slate-900">
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-[#FFD333] text-[#3D464D] p-0.5 rounded-full shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-300 block mt-1 truncate font-medium group-hover:text-[#FFD333]">
                    {item.title}
                  </span>
                  <span className="text-[8px] text-slate-500 block truncate">
                    {item.isSystem ? t.systemAsset : t.userUploaded}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
