
import React, { useState } from 'react';
import { Settings, Project, Panel } from '../types';
import { ADMIN_EMAIL, INITIAL_SETTINGS } from '../constants';

interface SettingsPanelProps {
  settings: Settings;
  onUpdateSettings: (settings: Settings) => void;
  currentUserEmail: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdateSettings, currentUserEmail }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedPanelId, setSelectedPanelId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState('');
  const [newAdmin, setNewAdmin] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const projects = settings.projects;
  const adminEmails = settings.adminEmails || [];
  const currentProject = selectedProjectId !== null ? projects[selectedProjectId] : null;
  const currentPanel = (currentProject && selectedPanelId !== null) ? currentProject.panels[selectedPanelId] : null;

  const isSuperAdmin = currentUserEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const testConnection = async () => {
    if (!settings.scriptUrl) return alert("URL Master Database belum diatur di constants.ts");
    setIsTesting(true);
    try {
      const res = await fetch(settings.scriptUrl);
      if (res.ok || res.type === 'opaque') {
        alert("✅ KONEKSI GLOBAL AKTIF!\nSemua user saat ini menggunakan URL ini.");
      } else {
        alert("❌ KONEKSI GAGAL\nPastikan URL di constants.ts benar dan akses disetel ke 'Anyone'.");
      }
    } catch (e) {
      alert("⚠️ INFO KONEKSI:\nJika Anda sudah menyetel Google Script ke 'Anyone', data akan terkirim otomatis.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleAddProject = () => {
    if (!newItem.trim()) return;
    const updated = { ...settings, projects: [...projects, { name: newItem, panels: [] }] };
    onUpdateSettings(updated);
    setNewItem('');
  };

  const handleAddPanel = () => {
    if (!newItem.trim() || selectedProjectId === null) return;
    const updatedProjects = [...projects];
    updatedProjects[selectedProjectId].panels.push({ name: newItem, codes: [] });
    onUpdateSettings({ ...settings, projects: updatedProjects });
    setNewItem('');
  };

  const handleAddCode = () => {
    if (!newItem.trim() || selectedProjectId === null || selectedPanelId === null) return;
    const updatedProjects = [...projects];
    updatedProjects[selectedProjectId].panels[selectedPanelId].codes.push(newItem);
    onUpdateSettings({ ...settings, projects: updatedProjects });
    setNewItem('');
  };

  const handleAddAdmin = () => {
    if (!isSuperAdmin) return;
    if (!newAdmin.trim() || !newAdmin.includes('@')) return;
    if (adminEmails.some(a => a.toLowerCase() === newAdmin.toLowerCase())) {
      alert('Email ini sudah menjadi admin.');
      return;
    }
    const updated = { ...settings, adminEmails: [...adminEmails, newAdmin] };
    onUpdateSettings(updated);
    setNewAdmin('');
  };

  const removeAdmin = (email: string) => {
    if (!isSuperAdmin) return;
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return;
    const updated = { ...settings, adminEmails: adminEmails.filter(a => a !== email) };
    onUpdateSettings(updated);
  };

  return (
    <div className="space-y-10 pb-24">
      {/* GLOBAL DATABASE CONFIGURATION (SUPER ADMIN ONLY) */}
      <div className="bg-white rounded-[2rem] shadow-xl border-4 border-blue-500/10 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-lg">Master Connection Settings</h3>
                <p className="text-blue-100 text-xs">Pusat Data Google Sheets EMT</p>
              </div>
            </div>
            {isSuperAdmin && (
              <button 
                onClick={testConnection}
                disabled={isTesting}
                className="bg-white text-blue-600 px-6 py-2 rounded-xl text-sm font-black hover:bg-blue-50 transition-all shadow-lg active:scale-95"
              >
                {isTesting ? 'Mengecek...' : 'Uji Master'}
              </button>
            )}
          </div>
        </div>
        
        <div className="p-8">
          <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status Sinkronisasi Tim:</span>
                <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${settings.scriptUrl ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                   <span className={`w-2 h-2 rounded-full ${settings.scriptUrl ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                   <span>{settings.scriptUrl ? 'SYSTEM-WIDE CONNECTED' : 'SYSTEM-WIDE DISCONNECTED'}</span>
                </div>
              </div>
              
              {isSuperAdmin && (
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 font-bold block">Update Terakhir:</span>
                  <span className="text-[10px] font-bold text-slate-600">{settings.scriptUrl ? 'Sync Otomatis Aktif' : 'N/A'}</span>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-white rounded-xl border border-slate-200 font-mono text-[10px] text-slate-500 break-all shadow-inner mb-4">
              {settings.scriptUrl || '⚠️ Belum ada URL database di file constants.ts'}
            </div>

            {isSuperAdmin ? (
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <p className="text-[11px] text-blue-700 font-bold leading-relaxed">
                  📢 <strong>PENTING:</strong> Untuk menghubungkan semua teknisi ke satu database secara otomatis, Anda <strong>WAJIB</strong> memasukkan URL Google Apps Script ke dalam file <code>constants.ts</code> pada variabel <code>INITIAL_SETTINGS.scriptUrl</code>. <br/><br/>
                  Setelah Anda melakukan perubahan di file tersebut, aplikasi akan otomatis mendeteksi URL baru di perangkat semua teknisi yang membuka aplikasi ini.
                </p>
              </div>
            ) : (
              <div className="bg-slate-100 p-4 rounded-xl text-center">
                 <p className="text-xs text-slate-500 font-medium italic">Konfigurasi ini dikelola secara terpusat oleh Super Admin.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADMINS SECTION */}
      {isSuperAdmin && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
            <h3 className="font-bold uppercase tracking-wider text-xs">Kelola Akses Admin Tim</h3>
          </div>
          <div className="p-6">
            <div className="flex space-x-3 mb-6">
              <input 
                type="email"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Email Gmail admin baru..."
                value={newAdmin}
                onChange={(e) => setNewAdmin(e.target.value)}
              />
              <button onClick={handleAddAdmin} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors">Tambah</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {adminEmails.map((email, i) => (
                <div key={i} className="flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">{email}</span>
                  {email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() && (
                    <button onClick={() => removeAdmin(email)} className="text-slate-400 hover:text-red-500 font-black px-1 transition-colors">×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DROPDOWN CONFIG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Project */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 px-4 py-3 text-white font-black text-[10px] uppercase tracking-widest text-center">Step 1: Project</div>
          <div className="p-4 border-b border-slate-100">
            <div className="flex space-x-1">
              <input type="text" className="flex-1 px-3 py-2 text-sm rounded-xl border outline-none bg-slate-50" placeholder="Nama Project..." value={selectedProjectId === null ? newItem : ''} onChange={(e) => selectedProjectId === null && setNewItem(e.target.value)} onFocus={() => {setSelectedProjectId(null); setSelectedPanelId(null);}} />
              <button onClick={handleAddProject} className="bg-blue-600 text-white px-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">+</button>
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {projects.map((p, i) => (
              <div key={i} onClick={() => {setSelectedProjectId(i); setSelectedPanelId(null);}} className={`p-4 text-sm flex justify-between cursor-pointer transition-all ${selectedProjectId === i ? 'bg-blue-50 text-blue-700 font-black border-r-4 border-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}>
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Panel */}
        <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-opacity ${selectedProjectId === null ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="bg-slate-700 px-4 py-3 text-white font-black text-[10px] uppercase tracking-widest text-center">Step 2: Panel</div>
          <div className="p-4 border-b border-slate-100">
            <div className="flex space-x-1">
              <input type="text" className="flex-1 px-3 py-2 text-sm rounded-xl border outline-none bg-slate-50" placeholder="Nama Panel..." value={selectedProjectId !== null && selectedPanelId === null ? newItem : ''} onChange={(e) => selectedProjectId !== null && selectedPanelId === null && setNewItem(e.target.value)} onFocus={() => setSelectedPanelId(null)} />
              <button onClick={handleAddPanel} className="bg-blue-600 text-white px-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">+</button>
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {currentProject?.panels.map((p, i) => (
              <div key={i} onClick={() => setSelectedPanelId(i)} className={`p-4 text-sm flex justify-between cursor-pointer transition-all ${selectedPanelId === i ? 'bg-blue-50 text-blue-700 font-black border-r-4 border-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}>
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Kode */}
        <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-opacity ${selectedPanelId === null ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="bg-slate-600 px-4 py-3 text-white font-black text-[10px] uppercase tracking-widest text-center">Step 3: Kode</div>
          <div className="p-4 border-b border-slate-100">
            <div className="flex space-x-1">
              <input type="text" className="flex-1 px-3 py-2 text-sm rounded-xl border outline-none bg-slate-50" placeholder="Kode Unik..." value={selectedPanelId !== null ? newItem : ''} onChange={(e) => selectedPanelId !== null && setNewItem(e.target.value)} />
              <button onClick={handleAddCode} className="bg-blue-600 text-white px-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">+</button>
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {currentPanel?.codes.map((c, i) => (
              <div key={i} className="p-3 text-xs bg-slate-50 rounded-lg mb-1 text-slate-700 font-mono border border-slate-100 shadow-sm">{c}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
