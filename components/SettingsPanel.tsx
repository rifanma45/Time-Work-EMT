
import React, { useState } from 'react';
import { Settings, Project, Panel } from '../types';
import { ADMIN_EMAIL } from '../constants';

interface SettingsPanelProps {
  settings: Settings;
  onUpdateSettings: (settings: Settings) => void;
  currentUserEmail: string;
}

type DeleteType = 'project' | 'panel' | 'code';

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdateSettings, currentUserEmail }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedPanelId, setSelectedPanelId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState('');
  const [newAdmin, setNewAdmin] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [showGasCode, setShowGasCode] = useState(false);

  // State for Custom Delete Confirmation
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    type: DeleteType;
    index: number;
    title: string;
    warning?: string;
  }>({ show: false, type: 'project', index: -1, title: '' });

  const projects = settings.projects;
  const adminEmails = settings.adminEmails || [];
  const currentProject = selectedProjectId !== null ? projects[selectedProjectId] : null;
  const currentPanel = (currentProject && selectedPanelId !== null) ? currentProject.panels[selectedPanelId] : null;

  const isSuperAdmin = currentUserEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const gasCode = `/**
 * GOOGLE APPS SCRIPT FOR EMT TRACKER (VERSY SYNC BY ID)
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
  var idColIndex = headers.indexOf('id');

  if (action === 'delete') {
    for (var i = data.length - 1; i >= 1; i--) {
      if (data[i][idColIndex].toString() === content.id.toString()) {
        sheet.deleteRow(i + 1);
      }
    }
  } else if (action === 'clearAll') {
    if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
  } else if (action === 'update') {
    for (var i = 1; i < data.length; i++) {
      if (data[i][idColIndex].toString() === content.id.toString()) {
        var rowValues = headers.map(h => content[h] !== undefined ? content[h] : "");
        sheet.getRange(i + 1, 1, 1, headers.length).setValues([rowValues]);
        break;
      }
    }
  } else {
    var rowValues = headers.map(h => content[h] !== undefined ? content[h] : "");
    sheet.appendRow(rowValues);
  }
  return ContentService.createTextOutput("Success");
}`;

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

  // Open confirmation modal instead of immediate delete
  const triggerDelete = (type: DeleteType, index: number, title: string, warning?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmModal({ show: true, type, index, title, warning });
  };

  const executeDelete = () => {
    const { type, index } = confirmModal;
    const updatedProjects = [...projects];

    if (type === 'project') {
      const filtered = updatedProjects.filter((_, i) => i !== index);
      onUpdateSettings({ ...settings, projects: filtered });
      setSelectedProjectId(null);
      setSelectedPanelId(null);
    } else if (type === 'panel' && selectedProjectId !== null) {
      updatedProjects[selectedProjectId].panels = updatedProjects[selectedProjectId].panels.filter((_, i) => i !== index);
      onUpdateSettings({ ...settings, projects: updatedProjects });
      setSelectedPanelId(null);
    } else if (type === 'code' && selectedProjectId !== null && selectedPanelId !== null) {
      updatedProjects[selectedProjectId].panels[selectedPanelId].codes = updatedProjects[selectedProjectId].panels[selectedPanelId].codes.filter((_, i) => i !== index);
      onUpdateSettings({ ...settings, projects: updatedProjects });
    }

    setConfirmModal({ ...confirmModal, show: false });
  };

  return (
    <div className="space-y-10 pb-24 relative">
      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-red-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h4 className="text-xl font-black text-slate-800 mb-2">Konfirmasi Hapus</h4>
              <p className="text-slate-500 text-sm mb-1">Anda akan menghapus:</p>
              <p className="font-black text-slate-900 bg-slate-100 py-2 px-4 rounded-xl inline-block mb-4 text-sm truncate max-w-full">
                {confirmModal.title}
              </p>
              {confirmModal.warning && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider mb-6 border border-red-100">
                  {confirmModal.warning}
                </div>
              )}
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={executeDelete}
                  className="w-full py-3.5 bg-red-600 text-white rounded-xl font-black text-sm shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                >
                  IYA, HAPUS SEKARANG
                </button>
                <button 
                  onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                  className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONNECTION SETTINGS */}
      <div className="bg-white rounded-[2rem] shadow-xl border-4 border-blue-500/10 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-lg">Master Connection</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="p-8">
           <button 
              onClick={() => setShowGasCode(!showGasCode)}
              className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs border border-blue-200 mb-4"
            >
              {showGasCode ? 'Sembunyikan Kode' : 'Lihat Kode Script ID-Sync'}
            </button>
            {showGasCode && (
               <div className="relative">
                  <textarea readOnly className="w-full h-32 p-4 bg-slate-900 text-emerald-400 font-mono text-[9px] rounded-xl outline-none" value={gasCode} />
                  <button onClick={() => {navigator.clipboard.writeText(gasCode); alert("Salin Sukses!");}} className="absolute top-2 right-2 bg-white/10 text-white px-2 py-1 rounded text-[9px]">Salin</button>
               </div>
            )}
        </div>
      </div>

      {/* DROPDOWN VARIABLE MANAGEMENT - AUTO ADJUSTING LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* STEP 1: PROJECT */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-fit min-h-[200px] max-h-[600px] transition-all duration-300">
          <div className="bg-slate-800 px-4 py-3 text-white font-black text-[10px] uppercase tracking-widest text-center">Step 1: Project</div>
          <div className="p-4 border-b border-slate-100">
            <div className="flex space-x-1">
              <input type="text" className="flex-1 px-3 py-2 text-sm rounded-xl border outline-none bg-slate-50" placeholder="Tambah Project..." value={selectedProjectId === null ? newItem : ''} onChange={(e) => selectedProjectId === null && setNewItem(e.target.value)} onFocus={() => {setSelectedProjectId(null); setSelectedPanelId(null);}} />
              <button onClick={handleAddProject} className="bg-blue-600 text-white px-4 rounded-xl font-bold">+</button>
            </div>
          </div>
          <div className="overflow-y-auto">
            {projects.map((p, i) => (
              <div key={i} onClick={() => {setSelectedProjectId(i); setSelectedPanelId(null);}} className={`group p-4 text-sm flex justify-between items-center cursor-pointer transition-colors ${selectedProjectId === i ? 'bg-blue-50 text-blue-700 font-black border-r-4 border-blue-600' : 'hover:bg-slate-50 text-slate-600 border-r-4 border-transparent'}`}>
                <span className="truncate pr-2">{p.name}</span>
                <button 
                  onClick={(e) => triggerDelete('project', i, p.name, 'PERINGATAN: Semua panel & kode di dalamnya akan terhapus!', e)}
                  className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {projects.length === 0 && <p className="p-8 text-center text-[10px] font-bold text-slate-300 uppercase italic">Belum ada project</p>}
          </div>
        </div>

        {/* STEP 2: PANEL */}
        <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-fit min-h-[200px] max-h-[600px] transition-all duration-300 ${selectedProjectId === null ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="bg-slate-700 px-4 py-3 text-white font-black text-[10px] uppercase tracking-widest text-center">Step 2: Panel</div>
          <div className="p-4 border-b border-slate-100">
            <div className="flex space-x-1">
              <input type="text" className="flex-1 px-3 py-2 text-sm rounded-xl border outline-none bg-slate-50" placeholder="Tambah Panel..." value={selectedProjectId !== null && selectedPanelId === null ? newItem : ''} onChange={(e) => selectedProjectId !== null && selectedPanelId === null && setNewItem(e.target.value)} onFocus={() => setSelectedPanelId(null)} />
              <button onClick={handleAddPanel} className="bg-blue-600 text-white px-4 rounded-xl font-bold">+</button>
            </div>
          </div>
          <div className="overflow-y-auto">
            {currentProject?.panels.map((p, i) => (
              <div key={i} onClick={() => setSelectedPanelId(i)} className={`group p-4 text-sm flex justify-between items-center cursor-pointer transition-colors ${selectedPanelId === i ? 'bg-blue-50 text-blue-700 font-black border-r-4 border-blue-600' : 'hover:bg-slate-50 text-slate-600 border-r-4 border-transparent'}`}>
                <span className="truncate pr-2">{p.name}</span>
                <button 
                  onClick={(e) => triggerDelete('panel', i, p.name, 'Menghapus panel akan menghapus semua kode unik di dalamnya.', e)}
                  className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {selectedProjectId !== null && currentProject?.panels.length === 0 && (
              <p className="p-8 text-center text-[10px] font-bold text-slate-300 uppercase italic">Belum ada panel</p>
            )}
            {selectedProjectId === null && (
              <p className="p-8 text-center text-[10px] font-bold text-slate-300 uppercase italic">Pilih project dahulu</p>
            )}
          </div>
        </div>

        {/* STEP 3: KODE */}
        <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-fit min-h-[200px] max-h-[600px] transition-all duration-300 ${selectedPanelId === null ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="bg-slate-600 px-4 py-3 text-white font-black text-[10px] uppercase tracking-widest text-center">Step 3: Kode</div>
          <div className="p-4 border-b border-slate-100">
            <div className="flex space-x-1">
              <input type="text" className="flex-1 px-3 py-2 text-sm rounded-xl border outline-none bg-slate-50" placeholder="Kode Unik..." value={selectedPanelId !== null ? newItem : ''} onChange={(e) => selectedPanelId !== null && setNewItem(e.target.value)} />
              <button onClick={handleAddCode} className="bg-blue-600 text-white px-4 rounded-xl font-bold">+</button>
            </div>
          </div>
          <div className="overflow-y-auto p-2 space-y-1">
            {currentPanel?.codes.map((c, i) => (
              <div key={i} className="group p-3 text-xs bg-slate-50 rounded-lg text-slate-700 font-mono border border-slate-100 flex justify-between items-center transition-all hover:bg-white hover:shadow-sm">
                <span>{c}</span>
                <button 
                  onClick={(e) => triggerDelete('code', i, c, undefined, e)}
                  className="text-slate-300 hover:text-red-600 p-1 rounded transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {selectedPanelId !== null && currentPanel?.codes.length === 0 && (
              <p className="p-8 text-center text-[10px] font-bold text-slate-300 uppercase italic">Belum ada kode</p>
            )}
            {selectedPanelId === null && (
              <p className="p-8 text-center text-[10px] font-bold text-slate-300 uppercase italic">Pilih panel dahulu</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
