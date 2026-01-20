
import React from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const appUrl = window.location.href;

  const handleShare = async (type: 'install' | 'web') => {
    const text = type === 'install' 
      ? "Halo! Gunakan link ini untuk instal aplikasi Time Sheet EMT di handphone kamu (Klik 'Add to Home Screen'): "
      : "Link akses web Time Sheet EMT: ";
    
    const shareData = {
      title: 'Time Sheet EMT',
      text: text + appUrl,
      url: appUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share error:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text + appUrl);
        alert('Link Berhasil Disalin!');
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
          {/* Option 1: Share for Installation */}
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
              <p className="text-sm text-blue-700 opacity-80">Link untuk instalasi aplikasi di handphone.</p>
            </div>
            <svg className="w-5 h-5 ml-auto text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Option 2: Share for Web Access */}
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
              <p className="text-sm text-slate-500">Link standar untuk membuka di browser web.</p>
            </div>
            <svg className="w-5 h-5 ml-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="bg-slate-50 p-6">
          <p className="text-xs text-slate-400 leading-relaxed text-center">
            Aplikasi ini dapat diinstal di Android/iOS dengan membuka link di browser lalu pilih <strong>"Tambahkan ke Layar Utama"</strong> (Add to Home Screen).
          </p>
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};
