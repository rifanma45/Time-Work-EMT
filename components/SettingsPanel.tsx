
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

  const projects = settings.projects;
  const adminEmails = settings.adminEmails || [];
  const currentProject = selectedProjectId !== null ? projects[selectedProjectId] : null;
  const currentPanel = (currentProject && selectedPanelId !== null) ? currentProject.panels[selectedPanelId] : null;

  const isSuperAdmin = currentUserEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

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
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      alert('Root administrator tidak bisa dihapus.');
      return;
    }
    const updated = { ...settings, adminEmails: adminEmails.filter(a => a !== email) };
    onUpdateSettings(updated);
  };

  const removeProject = (idx: number) => {
    const updated = { ...settings, projects: projects.filter((_, i) => i !== idx) };
    if (selectedProjectId === idx) {
      setSelectedProjectId(null);
      setSelectedPanelId(null);
    }
    onUpdateSettings(updated);
  };

  const removePanel = (pIdx: number) => {
    if (selectedProjectId === null) return;
    const updatedProjects = [...projects];
    updatedProjects[selectedProjectId].panels = updatedProjects[selectedProjectId].panels.filter((_, i) => i !== pIdx);
    if (selectedPanelId === pIdx) setSelectedPanelId(null);
    onUpdateSettings({ ...settings, projects: updatedProjects });
  };

  const removeCode = (cIdx: number) => {
    if (selectedProjectId === null || selectedPanelId === null) return;
    const updatedProjects = [...projects];
    updatedProjects[selectedProjectId].panels[selectedPanelId].codes = updatedProjects[selectedProjectId].panels[selectedPanelId].codes.filter((_, i) => i !== cIdx);
    onUpdateSettings({ ...settings, projects: updatedProjects });
  };

  return (
    <div className="space-y-10">
      {/* SUPER ADMIN SECTION: MANAGE ADMINS */}
      {isSuperAdmin && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-red-600 px-6 py-4 text-white flex justify-between items-center">
            <h3 className="font-bold uppercase tracking-wider text-xs flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Manage Administrators (Root Admin Access Only)
            </h3>
          </div>
          <div className="p-6">
            <div className="flex space-x-3 mb-6">
              <input 
                type="email"
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Tambah email admin baru..."
                value={newAdmin}
                onChange={(e) => setNewAdmin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
              />
              <button 
                onClick={handleAddAdmin}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
              >
                Tambah Admin
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminEmails.map((email, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl group">
                  <span className="text-sm font-medium text-slate-700 truncate mr-2" title={email}>{email}</span>
                  {email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() ? (
                    <button 
                      onClick={() => removeAdmin(email)}
                      className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  ) : (
                    <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Root</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DROPDOWN CONFIGURATION SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1: PROJECTS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-6 py-4 text-white">
            <h3 className="font-bold uppercase tracking-wider text-xs">Step 1: Projects</h3>
          </div>
          <div className="p-4 border-b border-slate-100">
            <div className="flex space-x-2">
              <input 
                type="text"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add Project..."
                value={selectedProjectId === null ? newItem : ''}
                onChange={(e) => selectedProjectId === null && setNewItem(e.target.value)}
                onFocus={() => { setSelectedProjectId(null); setSelectedPanelId(null); }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
              />
              <button onClick={handleAddProject} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">+</button>
            </div>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {projects.map((p, i) => (
              <div 
                key={i} 
                onClick={() => { setSelectedProjectId(i); setSelectedPanelId(null); }}
                className={`flex justify-between items-center p-4 cursor-pointer transition-all ${selectedProjectId === i ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-slate-50'}`}
              >
                <span className={`text-sm font-medium ${selectedProjectId === i ? 'text-blue-700' : 'text-slate-700'}`}>{p.name}</span>
                <button onClick={(e) => { e.stopPropagation(); removeProject(i); }} className="text-slate-300 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: PANELS */}
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${selectedProjectId === null ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="bg-slate-800 px-6 py-4 text-white flex justify-between items-center">
            <h3 className="font-bold uppercase tracking-wider text-xs">Step 2: Panels</h3>
            {currentProject && <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded uppercase">{currentProject.name}</span>}
          </div>
          <div className="p-4 border-b border-slate-100">
            <div className="flex space-x-2">
              <input 
                type="text"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add Panel..."
                value={selectedProjectId !== null && selectedPanelId === null ? newItem : ''}
                onChange={(e) => selectedProjectId !== null && selectedPanelId === null && setNewItem(e.target.value)}
                onFocus={() => setSelectedPanelId(null)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPanel()}
              />
              <button onClick={handleAddPanel} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">+</button>
            </div>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {currentProject?.panels.map((p, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedPanelId(i)}
                className={`flex justify-between items-center p-4 cursor-pointer transition-all ${selectedPanelId === i ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-slate-50'}`}
              >
                <span className={`text-sm font-medium ${selectedPanelId === i ? 'text-blue-700' : 'text-slate-700'}`}>{p.name}</span>
                <button onClick={(e) => { e.stopPropagation(); removePanel(i); }} className="text-slate-300 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            ))}
            {!currentProject && <div className="p-8 text-center text-slate-400 text-xs">Select a Project first</div>}
          </div>
        </div>

        {/* COLUMN 3: CODES */}
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${selectedPanelId === null ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="bg-slate-700 px-6 py-4 text-white flex justify-between items-center">
            <h3 className="font-bold uppercase tracking-wider text-xs">Step 3: Codes</h3>
            {currentPanel && <span className="text-[10px] bg-slate-600 px-2 py-0.5 rounded uppercase">{currentPanel.name}</span>}
          </div>
          <div className="p-4 border-b border-slate-100">
            <div className="flex space-x-2">
              <input 
                type="text"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add Code..."
                value={selectedPanelId !== null ? newItem : ''}
                onChange={(e) => selectedPanelId !== null && setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCode()}
              />
              <button onClick={handleAddCode} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">+</button>
            </div>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {currentPanel?.codes.map((c, i) => (
              <div 
                key={i} 
                className="flex justify-between items-center p-4 hover:bg-slate-50 transition-all"
              >
                <span className="text-sm font-medium text-slate-700">{c}</span>
                <button onClick={() => removeCode(i)} className="text-slate-300 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            ))}
            {!currentPanel && <div className="p-8 text-center text-slate-400 text-xs">Select a Panel first</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
