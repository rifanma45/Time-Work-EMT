
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
  const [isTesting, setIsTesting] = useState(false);
  const [showGasCode, setShowGasCode] = useState(false);

  const projects = settings.projects;
  const adminEmails = settings.adminEmails || [];
  const currentProject = selectedProjectId !== null ? projects[selectedProjectId] : null;
  const currentPanel = (currentProject && selectedPanelId !== null) ? currentProject.panels[selectedPanelId] : null;

  const isSuperAdmin = currentUserEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const gasCode = `/**
 * GOOGLE APPS SCRIPT FOR EMT TRACKER (VERSY SYNC BY ID)
 * Pastikan Spreadsheet Anda memiliki header berikut di Baris 1:
 * [ id, email, project, panelName, panelCode, jobSection, startTime, endTime, totalTime, timestamp ]
 */

function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var json = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    // Hanya masukkan data yang punya ID valid ke JSON output
    if (obj.id && obj.id.toString().trim() !== "") {
      json.push(obj);
    }
  }
  return ContentService.createTextOutput(JSON.stringify(json)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var content = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var action = content.cloudAction;
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  // Cari index kolom "id" secara dinamis di header
  var idColIndex = -1;
  for (var k = 0; k < headers.length; k++) {
    if (headers[k].toString().toLowerCase() === 'id') {
      idColIndex = k;
      break;
    }
  }

  if (action === 'delete') {
    if (idColIndex === -1) return ContentService.createTextOutput("Error: No ID column");
    // Cari dari bawah ke atas untuk menghindari geseran index saat hapus
    for (var i = data.length - 1; i >= 1; i--) {
      if (data[i][idColIndex].toString() === content.id.toString()) {
        sheet.deleteRow(i + 1);
      }
    }
  } else if (action === 'clearAll') {
    if (sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }
  } else if (action === 'update') {
    if (idColIndex === -1) return ContentService.createTextOutput("Error: No ID column");
    for (var i = 1; i < data.length; i++) {
      if (data[i][idColIndex].toString() === content.id.toString()) {
        var rowValues = headers.map(h => content[h] !== undefined ? content[h] : "");
        sheet.getRange(i + 1, 1, 1, headers.length).setValues([rowValues]);
        break; // Stop setelah ketemu dan update
      }
    }
  } else { // action: create
    var rowValues = headers.map(h => content[h] !== undefined ? content[h] : "");
    sheet.appendRow(rowValues);
  }
  
  return ContentService.createTextOutput("Success");
}`;

  const handleCopyGas = () => {
    navigator.clipboard.writeText(gasCode);
    alert("Kode Google Script Sinkron ID berhasil disalin!");
  };

  const testConnection = async () => {
    if (!settings.scriptUrl) return alert("URL Master Database belum diatur");
    setIsTesting(true);
    try {
      const res = await fetch(settings.scriptUrl);
      if (res.ok || res.type === 'opaque') {
        alert("✅ KONEKSI GLOBAL AKTIF!");
      } else {
        alert("❌ KONEKSI GAGAL");
      }
    } catch (e) {
      alert("⚠️ INFO: Pastikan Google Script disetel ke 'Anyone'.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleAddProject = () => {
    if (!newItem.trim()) return;
    onUpdateSettings({ ...settings, projects: [...projects, { name: newItem, panels: [] }] });
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
    if (!isSuperAdmin || !newAdmin.trim() || !newAdmin.includes('@')) return;
    onUpdateSettings({ ...settings, adminEmails: [...adminEmails, newAdmin] });
    setNewAdmin('');
  };

  const removeAdmin = (email: string) => {
    if (!isSuperAdmin || email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return;
    onUpdateSettings({ ...settings, adminEmails: adminEmails.filter(a => a !== email) });
  };

  return (
    <div className="space-y-10 pb-24">
      <div className="bg-white rounded-[2rem] shadow-xl border-4 border-blue-500/10 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-lg">Master Connection Settings</h3>
              </div>
            </div>
            {isSuperAdmin && (
              <button onClick={testConnection} disabled={isTesting} className="bg-white text-blue-600 px-6 py-2 rounded-xl text-sm font-black hover:bg-blue-50">
                {isTesting ? 'Mengecek...' : 'Uji Master'}
              </button>
            )}
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-6">
            <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">
              <strong>PENTING:</strong> Agar aksi Hapus dan Edit tersinkron ke Spreadsheet, Anda wajib memperbarui kode Google Apps Script ke versi ID-Sync.
            </p>
            
            <button 
              onClick={() => setShowGasCode(!showGasCode)}
              className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs border border-blue-200 mb-4"
            >
              {showGasCode ? 'Sembunyikan Instruksi' : 'Lihat Kode Script ID-Sync (Wajib Update)'}
            </button>

            {showGasCode && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <p className="text-[10px] text-amber-700 font-bold uppercase mb-2">Header Spreadsheet (Kolom A wajib 'id'):</p>
                  <div className="bg-white p-2 rounded border border-amber-200 font-mono text-[9px] text-slate-600 overflow-x-auto whitespace-nowrap">
                    id | email | project | panelName | panelCode | jobSection | startTime | endTime | totalTime | timestamp
                  </div>
                </div>
                
                <div className="relative">
                  <textarea 
                    readOnly 
                    className="w-full h-48 p-4 bg-slate-900 text-emerald-400 font-mono text-[9px] rounded-xl outline-none"
                    value={gasCode}
                  />
                  <button 
                    onClick={handleCopyGas}
                    className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-[10px] font-bold"
                  >
                    Salin Kode ID-Sync
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
            <h3 className="font-bold uppercase tracking-wider text-xs">Kelola Akses Admin Tim</h3>
          </div>
          <div className="p-6">
            <div className="flex space-x-3 mb-6">
              <input type="email" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm" placeholder="Email admin baru..." value={newAdmin} onChange={(e) => setNewAdmin(e.target.value)} />
              <button onClick={handleAddAdmin} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold text-sm">Tambah</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {adminEmails.map((email, i) => (
                <div key={i} className="flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">{email}</span>
                  {email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() && (
                    <button onClick={() => removeAdmin(email)} className="text-slate-400 hover:text-red-500 font-black">×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
              <div key={i} onClick={() => {setSelectedProjectId(i); setSelectedPanelId(null);}} className={`p-4 text-sm flex justify-between cursor-pointer ${selectedProjectId === i ? 'bg-blue-50 text-blue-700 font-black border-r-4 border-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}>
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden ${selectedProjectId === null ? 'opacity-40' : ''}`}>
          <div className="bg-slate-700 px-4 py-3 text-white font-black text-[10px] uppercase tracking-widest text-center">Step 2: Panel</div>
          <div className="p-4 border-b border-slate-100">
            <div className="flex space-x-1">
              <input type="text" className="flex-1 px-3 py-2 text-sm rounded-xl border outline-none bg-slate-50" placeholder="Nama Panel..." value={selectedProjectId !== null && selectedPanelId === null ? newItem : ''} onChange={(e) => selectedProjectId !== null && selectedPanelId === null && setNewItem(e.target.value)} onFocus={() => setSelectedPanelId(null)} />
              <button onClick={handleAddPanel} className="bg-blue-600 text-white px-4 rounded-xl font-bold">+</button>
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {currentProject?.panels.map((p, i) => (
              <div key={i} onClick={() => setSelectedPanelId(i)} className={`p-4 text-sm flex justify-between cursor-pointer ${selectedPanelId === i ? 'bg-blue-50 text-blue-700 font-black border-r-4 border-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}>
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden ${selectedPanelId === null ? 'opacity-40' : ''}`}>
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
