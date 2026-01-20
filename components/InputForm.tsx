
import React, { useState, useMemo } from 'react';
import { Settings, TimeLog, Project, Panel } from '../types';

interface InputFormProps {
  settings: Settings;
  onStart: (data: Partial<TimeLog>) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ settings, onStart }) => {
  const [formData, setFormData] = useState({
    project: '',
    panelName: '',
    panelCode: '',
    jobSection: ''
  });

  const selectedProjectObj = useMemo(() => 
    settings.projects.find(p => p.name === formData.project),
    [settings.projects, formData.project]
  );

  const selectedPanelObj = useMemo(() => 
    selectedProjectObj?.panels.find(p => p.name === formData.panelName),
    [selectedProjectObj, formData.panelName]
  );

  const isValid = formData.project && formData.panelName && formData.panelCode && formData.jobSection;

  const handleProjectChange = (val: string) => {
    setFormData({
      project: val,
      panelName: '',
      panelCode: '',
      jobSection: formData.jobSection
    });
  };

  const handlePanelChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      panelName: val,
      panelCode: ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onStart(formData);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* TANDA KONEKSI - CLOUD STATUS BADGE */}
      <div className="flex justify-center">
        <div className={`flex items-center space-x-3 px-5 py-2.5 rounded-2xl border-2 transition-all duration-500 ${
          settings.scriptUrl 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100' 
            : 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-100'
        }`}>
          <div className="relative flex h-3 w-3">
            {settings.scriptUrl && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${settings.scriptUrl ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-wider leading-none">
              {settings.scriptUrl ? 'Sistem Terkoneksi' : 'Mode Offline / Lokal'}
            </span>
            <span className="text-[9px] opacity-70 font-medium mt-0.5">
              {settings.scriptUrl ? 'Data akan otomatis terkirim ke Google Sheets' : 'URL Database belum diatur di menu Settings'}
            </span>
          </div>
          {settings.scriptUrl && (
            <div className="bg-emerald-500 text-white rounded-full p-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">Time Sheet EMT</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Input Pekerjaan Baru</p>
          </div>
          <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-7">
          <div className="grid grid-cols-1 gap-7">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Pilih Project Utama</label>
              <select 
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-blue-500 transition-all bg-slate-50 text-sm font-bold text-slate-800"
                value={formData.project}
                onChange={(e) => handleProjectChange(e.target.value)}
                required
              >
                <option value="">-- List Project --</option>
                {settings.projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Nama Panel</label>
                <select 
                  className={`w-full px-6 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-blue-500 transition-all text-sm font-bold ${!formData.project ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-slate-50 text-slate-800'}`}
                  value={formData.panelName}
                  onChange={(e) => handlePanelChange(e.target.value)}
                  disabled={!formData.project}
                  required
                >
                  <option value="">-- List Panel --</option>
                  {selectedProjectObj?.panels.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Kode Unik Panel</label>
                <select 
                  className={`w-full px-6 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-blue-500 transition-all text-sm font-mono ${!formData.panelName ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-slate-50 text-slate-800 font-bold'}`}
                  value={formData.panelCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, panelCode: e.target.value }))}
                  disabled={!formData.panelName}
                  required
                >
                  <option value="">-- List Kode --</option>
                  {selectedPanelObj?.codes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Bagian Pengerjaan</label>
              <input 
                type="text"
                placeholder="Contoh: Wiring Power, Marking Label..."
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-blue-500 transition-all bg-slate-50 text-sm font-bold text-slate-800"
                value={formData.jobSection}
                onChange={(e) => setFormData(prev => ({ ...prev, jobSection: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50">
            <button 
              type="submit"
              disabled={!isValid}
              className={`w-full py-5 rounded-[2rem] font-black text-lg transition-all shadow-2xl flex items-center justify-center space-x-3 active:scale-[0.97] ${
                isValid 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/40 translate-y-0' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none translate-y-0'
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>MULAI KERJA</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
