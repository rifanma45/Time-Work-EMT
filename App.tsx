
import React, { useState, useEffect, useCallback } from 'react';
import { User, Settings, TimeLog, AppState } from './types';
import { INITIAL_SETTINGS, STORAGE_KEYS, ADMIN_EMAIL } from './constants';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { InputForm } from './components/InputForm';
import { ActiveTracker } from './components/ActiveTracker';
import { HistoryTable } from './components/HistoryTable';
import { SettingsPanel } from './components/SettingsPanel';
import { ShareModal } from './components/ShareModal';
import { EditLogModal } from './components/EditLogModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    let currentSettings: Settings = saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    if (INITIAL_SETTINGS.scriptUrl && INITIAL_SETTINGS.scriptUrl.trim() !== '') {
      currentSettings.scriptUrl = INITIAL_SETTINGS.scriptUrl;
    }
    return currentSettings;
  });

  const [history, setHistory] = useState<TimeLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  const [state, setState] = useState<AppState>({
    currentStep: 'input',
    activeLog: null
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null);
  
  // Delete Confirmation States
  const [deleteConfig, setDeleteConfig] = useState<{
    isOpen: boolean;
    type: 'single' | 'all';
    targetId?: string;
  }>({ isOpen: false, type: 'single' });

  useEffect(() => {
    if (INITIAL_SETTINGS.scriptUrl && settings.scriptUrl !== INITIAL_SETTINGS.scriptUrl) {
      setSettings(prev => ({ ...prev, scriptUrl: INITIAL_SETTINGS.scriptUrl }));
    }
  }, [settings.scriptUrl]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      const isAdmin = settings.adminEmails.some(a => a.toLowerCase() === user.email.toLowerCase()) || user.email === ADMIN_EMAIL;
      if (!isAdmin && (state.currentStep === 'history' || state.currentStep === 'settings')) {
        setState(prev => ({ ...prev, currentStep: 'input' }));
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user, state.currentStep, settings.adminEmails]);

  const refreshFromCloud = useCallback(async (silent = false) => {
    if (!settings.scriptUrl) return;
    if (!silent) setIsSyncing(true);
    try {
      const response = await fetch(settings.scriptUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setHistory(data);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Cloud Sync Error:", err);
      if (!silent) alert("Gagal mengambil data dari Google Sheets.");
    } finally {
      if (!silent) setIsSyncing(false);
    }
  }, [settings.scriptUrl]);

  useEffect(() => {
    if (state.currentStep === 'history') {
      refreshFromCloud();
    }
  }, [state.currentStep, refreshFromCloud]);

  const pushToCloud = async (log: any, action: 'create' | 'update' | 'delete' | 'clearAll' = 'create') => {
    if (!settings.scriptUrl) return;
    setIsSyncing(true);
    try {
      await fetch(settings.scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...log, cloudAction: action })
      });
      setTimeout(() => refreshFromCloud(true), 2000);
    } catch (err) {
      console.error("Cloud Push Error:", err);
    } finally {
      setTimeout(() => setIsSyncing(false), 1000);
    }
  };

  const handleLogin = (email: string) => {
    const isAdmin = settings.adminEmails.some(admin => admin.toLowerCase() === email.toLowerCase()) || email === ADMIN_EMAIL;
    setUser({ email, isAdmin });
  };

  const handleLogout = () => {
    setUser(null);
    setState({ currentStep: 'input', activeLog: null });
  };

  const startTracking = (data: Partial<TimeLog>) => {
    const now = new Date().toISOString();
    setState({
      currentStep: 'active',
      activeLog: { 
        ...data, 
        email: user?.email, 
        startTime: now,
        initialStartTime: now,
        isPaused: false,
        accumulatedMs: 0
      }
    });
  };

  const handlePause = () => {
    if (!state.activeLog || state.activeLog.isPaused) return;
    const now = new Date().getTime();
    const start = new Date(state.activeLog.startTime!).getTime();
    const sessionMs = now - start;
    setState(prev => ({
      ...prev,
      activeLog: {
        ...prev.activeLog,
        isPaused: true,
        accumulatedMs: (prev.activeLog?.accumulatedMs || 0) + sessionMs,
        startTime: undefined 
      }
    }));
  };

  const handleResume = () => {
    if (!state.activeLog || !state.activeLog.isPaused) return;
    setState(prev => ({
      ...prev,
      activeLog: {
        ...prev.activeLog,
        isPaused: false,
        startTime: new Date().toISOString()
      }
    }));
  };

  const stopTracking = async (endTime: string, totalTime: string) => {
    if (!state.activeLog) return;
    const newLog: TimeLog = {
      ...(state.activeLog as TimeLog),
      id: Math.random().toString(36).substr(2, 9),
      startTime: state.activeLog.initialStartTime || state.activeLog.startTime!,
      endTime,
      totalTime,
      timestamp: Date.now(),
      isPaused: false,
      accumulatedMs: 0
    };
    setHistory(prev => [newLog, ...prev]);
    setState({ currentStep: 'input', activeLog: null });
    await pushToCloud(newLog, 'create');
  };

  const handleUpdateLog = async (updatedLog: TimeLog) => {
    setHistory(prev => prev.map(log => log.id === updatedLog.id ? updatedLog : log));
    setEditingLog(null);
    await pushToCloud(updatedLog, 'update');
  };

  // NEW: Refined delete handlers using custom modal
  const confirmDeleteLog = (id: string) => {
    setDeleteConfig({ isOpen: true, type: 'single', targetId: id });
  };

  const confirmDeleteAll = () => {
    setDeleteConfig({ isOpen: true, type: 'all' });
  };

  const executeDelete = async () => {
    if (deleteConfig.type === 'single' && deleteConfig.targetId) {
      const logToDelete = history.find(l => l.id === deleteConfig.targetId);
      setHistory(prev => prev.filter(log => log.id !== deleteConfig.targetId));
      if (logToDelete) await pushToCloud(logToDelete, 'delete');
    } else if (deleteConfig.type === 'all') {
      setHistory([]);
      await pushToCloud({}, 'clearAll');
    }
    setDeleteConfig({ isOpen: false, type: 'single' });
  };

  if (!user) return <Login onLogin={handleLogin} />;
  const isAdmin = settings.adminEmails.some(a => a.toLowerCase() === user.email.toLowerCase()) || user.email === ADMIN_EMAIL;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentStep={state.currentStep} 
        onChangeStep={(step) => setState(prev => ({ ...prev, currentStep: step as any }))} 
        isAdmin={isAdmin}
        onLogout={handleLogout}
        userEmail={user.email}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-8 flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 bg-white border border-slate-200 rounded-lg text-slate-600 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                {state.currentStep === 'input' && 'Input Pekerjaan'}
                {state.currentStep === 'active' && 'Sesi Berjalan'}
                {state.currentStep === 'history' && 'Google Master Sheet'}
                {state.currentStep === 'settings' && 'Konfigurasi Sistem'}
              </h1>
              <p className="text-slate-500 mt-1 text-sm">
                EMT Time Keeper v2.0 {isAdmin && <span className="text-blue-600 font-bold ml-1">• Mode Admin Aktif</span>}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            {state.currentStep === 'history' && isAdmin && (
              <div className="flex items-center space-x-3">
                {lastSyncTime && (
                  <span className="hidden sm:inline-block text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                    Last Sync: {lastSyncTime}
                  </span>
                )}
                <button 
                  onClick={() => refreshFromCloud()}
                  disabled={isSyncing || !settings.scriptUrl}
                  className={`p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 shadow-sm hover:bg-slate-50 transition-all ${isSyncing ? 'animate-spin' : 'active:scale-95'}`}
                  title="Refresh dari Google Sheets"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357-2H15" /></svg>
                </button>
              </div>
            )}
            <button onClick={() => setIsShareModalOpen(true)} className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z" /></svg>
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {state.currentStep === 'input' && <InputForm settings={settings} onStart={startTracking} />}
          {state.currentStep === 'active' && state.activeLog && (
            <ActiveTracker activeLog={state.activeLog} onStop={stopTracking} onPause={handlePause} onResume={handleResume} isCloudEnabled={!!settings.scriptUrl} />
          )}
          {state.currentStep === 'history' && isAdmin && (
            <HistoryTable history={history} onEdit={setEditingLog} onDelete={confirmDeleteLog} onDeleteAll={confirmDeleteAll} isSyncing={isSyncing} />
          )}
          {state.currentStep === 'settings' && isAdmin && (
            <SettingsPanel settings={settings} onUpdateSettings={setSettings} currentUserEmail={user.email} />
          )}
        </div>
      </main>

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
      {editingLog && <EditLogModal log={editingLog} settings={settings} onSave={handleUpdateLog} onClose={() => setEditingLog(null)} />}
      
      <ConfirmDeleteModal 
        isOpen={deleteConfig.isOpen}
        type={deleteConfig.type}
        onConfirm={executeDelete}
        onClose={() => setDeleteConfig({ isOpen: false, type: 'single' })}
      />
    </div>
  );
};

export default App;
