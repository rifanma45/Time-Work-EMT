
import React, { useState } from 'react';
import { Settings, Project, Panel } from '../types';
import { ADMIN_EMAIL } from '../constants';

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
  const [scriptUrl, setScriptUrl] = useState(settings.scriptUrl || '');
  const [isTesting, setIsTesting] = useState(false);

  const projects = settings.projects;
  const adminEmails = settings.adminEmails || [];
  const currentProject = selectedProjectId !== null ? projects[selectedProjectId] : null;
  const currentPanel = (currentProject && selectedPanelId !== null) ? currentProject.panels[selectedPanelId] : null;

  const isSuperAdmin = currentUserEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handleSaveCloud = () => {
    if (!scriptUrl.startsWith('https://script.google.com')) {
      alert('URL tidak valid! Pastikan diawali dengan https://script.google.com');
      return;
    }
    onUpdateSettings({ ...settings, scriptUrl });
    alert('URL Berhasil disimpan!');
  };

  const testConnection = async () => {
    if (!scriptUrl) return alert("Masukkan URL terlebih dahulu");
    setIsTesting(true);
    try {
      const res = await fetch(scriptUrl);
      if (res.ok || res.type === 'opaque') {
        alert("✅ KONEKSI BERHASIL!\nAplikasi sudah bisa mengirim data ke Google Sheets Anda.");
      } else {
        alert("❌ KONEKSI GAGAL\nPeriksa kembali URL atau pastikan akses Deployment adalah 'Anyone'.");
      }
    } catch (e) {
      alert("⚠️ PERHATIAN:\nKoneksi mungkin terhambat CORS, tapi jika Anda sudah 'Allow' akses di Google Script dan set ke 'Anyone', data akan tetap masuk saat 'Stop Kerja'.");
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
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return;
    const updated = { ...settings, adminEmails: adminEmails.filter(a => a !== email) };
    onUpdateSettings(updated);
  };

  return (
    <div className="space-y-10 pb-24">
      {/* CLOUD CONFIGURATION SECTION */}
      <div className="bg-white rounded-[2rem] shadow-xl border-4 border-blue-500/10 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-lg">Konfigurasi Database</h3>
                <p className="text-blue-100 text-xs">Hubungkan aplikasi ke Google Drive Anda</p>
              </div>
            </div>
            <button 
              onClick={testConnection}
              disabled={isTesting}
              className="bg-white text-blue-600 px-6 py-2 rounded-xl text-sm font-black hover:bg-blue-50 transition-all shadow-lg active:scale-95"
            >
              {isTesting ? 'Mengecek...' : 'Uji Koneksi'}
            </button>
          </div>
        </div>
        
        <div className="p-8">
          <div className="mb-8">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">MASUKKAN URL APPS SCRIPT DISINI:</label>
            <div className="flex flex-col gap-4">
              <input 
                type="text"
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-500 bg-slate-50 text-sm font-mono shadow-inner"
                placeholder="https://script.google.com/macros/s/AKfy.../exec"
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
              />
              <button 
                onClick={handleSaveCloud}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 active:scale-95 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                <span>SIMPAN & AKTIFKAN DATABASE</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-slate-300">
            <h4 className="text-blue-400 font-bold text-sm mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Petunjuk Mendapatkan URL
            </h4>
            <div className="space-y-3 text-xs leading-relaxed opacity-90">
              <p>1. Di Google Sheets, buka <strong>Extensions</strong> &gt; <strong>Apps Script</strong>.</p>
              <p>2. Paste kode jembatan database, lalu klik <strong>Deploy</strong> &gt; <strong>New Deployment</strong>.</p>
              <p>3. Pilih <strong>Web App</strong>. Set "Execute as" ke <strong>Me</strong> dan "Who has access" ke <strong>Anyone</strong>.</p>
              <p>4. Copy <strong>Web App URL</strong> yang dihasilkan dan tempel di kolom atas.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ADMINS SECTION */}
      {isSuperAdmin && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
            <h3 className="font-bold uppercase tracking-wider text-xs">Kelola User Admin</h3>
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
              <button onClick={handleAddAdmin} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold text-sm">Tambah</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {adminEmails.map((email, i) => (
                <div key={i} className="flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">{email}</span>
                  {email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() && (
                    <button onClick={() => removeAdmin(email)} className="text-slate-400 hover:text-red-500 font-black px-1">×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DROPDOWN CONFIG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 px-4 py-3 text-white font-black text-[10px] uppercase tracking-widest text-center">Step 1: Project</div>
          <div className="p-4 border-b border-slate-100">
            <div className="flex space-x-1">
              <input type="text" className="flex-1 px-3 py-2 text-sm rounded-xl border outline-none bg-slate-50" placeholder="Nama Project..." value={selectedProjectId === null ? newItem : ''} onChange={(e) => selectedProjectId === null && setNewItem(e.target.value)} onFocus={() => {setSelectedProjectId(null); setSelectedPanelId(null);}} />
              <button onClick={handleAddProject} className="bg-blue-600 text-white px-4 rounded-xl font-bold">+</button>
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

        <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-opacity ${selectedProjectId === null ? 'opacity-40' : ''}`}>
          <div className="bg-slate-700 px-4 py-3 text-white font-black text-[10px] uppercase tracking-widest text-center">Step 2: Panel</div>
          <div className="p-4 border-b border-slate-100">
            <div className="flex space-x-1">
              <input type="text" className="flex-1 px-3 py-2 text-sm rounded-xl border outline-none bg-slate-50" placeholder="Nama Panel..." value={selectedProjectId !== null && selectedPanelId === null ? newItem : ''} onChange={(e) => selectedProjectId !== null && selectedPanelId === null && setNewItem(e.target.value)} onFocus={() => setSelectedPanelId(null)} />
              <button onClick={handleAddPanel} className="bg-blue-600 text-white px-4 rounded-xl font-bold">+</button>
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

        <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-opacity ${selectedPanelId === null ? 'opacity-40' : ''}`}>
          <div className="bg-slate-600 px-4 py-3 text-white font-black text-[10px] uppercase tracking-widest text-center">Step 3: Kode</div>
          <div className="p-4 border-b border-slate-100">
            <div className="flex space-x-1">
              <input type="text" className="flex-1 px-3 py-2 text-sm rounded-xl border outline-none bg-slate-50" placeholder="Kode Unik..." value={selectedPanelId !== null ? newItem : ''} onChange={(e) => selectedPanelId !== null && setNewItem(e.target.value)} />
              <button onClick={handleAddCode} className="bg-blue-600 text-white px-4 rounded-xl font-bold">+</button>
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {currentPanel?.codes.map((c, i) => (
              <div key={i} className="p-3 text-xs bg-slate-50 rounded-lg mb-1 text-slate-700 font-mono border border-slate-100">{c}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
