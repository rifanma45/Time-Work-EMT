
import React from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const getShareUrl = () => {
    return window.location.origin + window.location.pathname;
  };

  const handleShare = async (type: 'install' | 'web') => {
    const fullUrl = getShareUrl();
    const text = type === 'install' 
      ? "Halo! Gunakan link ini untuk instal aplikasi Time Sheet EMT di handphone kamu: "
      : "Link akses web Time Sheet EMT: ";
    
    const shareData = {
      title: 'Time Sheet EMT',
      text: text + fullUrl,
      url: fullUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share error:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text + fullUrl);
        alert('Link Berhasil Disalin ke Clipboard!');
      } catch (err) {
        alert('Gagal menyalin link.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Bagikan Aplikasi</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <button 
            onClick={() => handleShare('install')}
            className="w-full flex items-center p-4 border border-blue-100 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-all text-left group"
          >
            <div className="bg-blue-600 p-3 rounded-xl text-white mr-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-blue-900">Share & Instal Mobile</p>
              <p className="text-sm text-blue-700 opacity-80">Link bersih tanpa parameter config.</p>
            </div>
          </button>

          <button 
            onClick={() => handleShare('web')}
            className="w-full flex items-center p-4 border border-slate-200 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all text-left group"
          >
            <div className="bg-slate-700 p-3 rounded-xl text-white mr-4 shadow-lg shadow-slate-400/30 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-800">Share Akses Web</p>
              <p className="text-sm text-slate-500">Link standar untuk browser laptop.</p>
            </div>
          </button>
        </div>

        <div className="bg-slate-50 p-6 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Centralized Config</p>
          <p className="text-[9px] text-slate-400 leading-relaxed italic">
            Konfigurasi database Master sekarang tertanam di dalam aplikasi. Cukup bagikan link di atas untuk semua tim.
          </p>
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};
