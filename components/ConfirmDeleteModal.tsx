
import React, { useState, useEffect } from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  type: 'single' | 'all';
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, type, onConfirm, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  
  // Reset input when modal opens/closes
  useEffect(() => {
    if (isOpen) setInputValue('');
  }, [isOpen]);

  if (!isOpen) return null;

  const isAllType = type === 'all';
  const confirmationKey = "iya hapus semua";
  const canConfirm = isAllType ? inputValue === confirmationKey : true;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-black text-slate-800 mb-2">
            {isAllType ? 'Hapus Semua Data?' : 'Hapus Data Ini?'}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            {isAllType 
              ? 'Tindakan ini akan menghapus seluruh isi database di Google Sheets secara permanen dan tidak dapat dibatalkan.' 
              : 'Data pengerjaan ini akan dihapus secara permanen dari server.'}
          </p>

          {isAllType && (
            <div className="mb-8">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ketik konfirmasi di bawah ini:</label>
              <input 
                type="text" 
                autoFocus
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 transition-all text-center font-bold text-red-600 placeholder:text-slate-300"
                placeholder={`"${confirmationKey}"`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <button 
              onClick={onConfirm}
              disabled={!canConfirm}
              className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 ${
                canConfirm 
                ? 'bg-red-600 text-white shadow-red-500/20 hover:bg-red-700' 
                : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              YA, HAPUS SEKARANG
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
            >
              Batal & Kembali
            </button>
          </div>
        </div>
        
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Security System EMT Tracker</p>
        </div>
      </div>
    </div>
  );
};
