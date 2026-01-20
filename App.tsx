
import React, { useState, useEffect } from 'react';
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
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Catatan: Di Vercel production, state 'history' ini harus di-sync ke Database (Supabase/Firebase)
  // agar data dari user A bisa muncul di browser Admin B secara real-time.
  const [history, setHistory] = useState<TimeLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  const [state, setState] = useState<AppState>({
    currentStep: 'input',
    activeLog: null
  });

  const [insight, setInsight] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null);

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
      
      // Keamanan: Jika bukan admin tapi mencoba buka Spreadsheet, lempar balik ke Input
      if (!isAdmin && (state.currentStep === 'history' || state.currentStep === 'settings')) {
        setState(prev => ({ ...prev, currentStep: 'input' }));
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user, state.currentStep, settings.adminEmails]);

  const handleLogin = (email: string) => {
    const isAdmin = settings.adminEmails.some(admin => admin.toLowerCase() === email.toLowerCase()) || email === ADMIN_EMAIL;
    const newUser = { email, isAdmin };
    setUser(newUser);
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

  const stopTracking = (endTime: string, totalTime: string) => {
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
    
    // Simpan ke history kolektif
    setHistory(prev => [newLog, ...prev]);
    setState({ currentStep: 'input', activeLog: null });
    generateInsights([newLog, ...history]);
  };

  const handleUpdateLog = (updatedLog: TimeLog) => {
    setHistory(prev => prev.map(log => log.id === updatedLog.id ? updatedLog : log));
    setEditingLog(null);
  };

  const handleDeleteLog = (id: string) => {
    if (window.confirm('Hapus data pengerjaan ini secara permanen?')) {
      setHistory(prev => prev.filter(log => log.id !== id));
    }
  };

  const generateInsights = async (currentHistory: TimeLog[]) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analisis logs kerja EMT: ${JSON.stringify(currentHistory.slice(0, 3))}. Berikan 1 tips produktivitas singkat (10 kata) untuk teknisi panel.`,
      });
      setInsight(response.text);
    } catch (err) {
      console.error("AI Insight Error:", err);
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

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
                {state.currentStep === 'input' && 'Input Task Baru'}
                {state.currentStep === 'active' && 'Task Berjalan'}
                {state.currentStep === 'history' && 'Master Spreadsheet EMT'}
                {state.currentStep === 'settings' && 'System Config'}
              </h1>
              <p className="text-slate-500 mt-1 text-sm">
                Halo, {user.email.split('@')[0]} {isAdmin && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold ml-2">ADMIN</span>}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {insight && (
              <div className="hidden lg:block bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs text-slate-600 shadow-sm">
                💡 {insight}
              </div>
            )}
            <button onClick={() => setIsShareModalOpen(true)} className="bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z" /></svg>
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {state.currentStep === 'input' && <InputForm settings={settings} onStart={startTracking} />}
          {state.currentStep === 'active' && state.activeLog && (
            <ActiveTracker 
              activeLog={state.activeLog} 
              onStop={stopTracking} 
              onPause={handlePause}
              onResume={handleResume}
            />
          )}
          {state.currentStep === 'history' && isAdmin && (
            <HistoryTable history={history} onEdit={setEditingLog} onDelete={handleDeleteLog} />
          )}
          {state.currentStep === 'settings' && isAdmin && (
            <SettingsPanel settings={settings} onUpdateSettings={setSettings} currentUserEmail={user.email} />
          )}
        </div>
      </main>

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
      {editingLog && <EditLogModal log={editingLog} settings={settings} onSave={handleUpdateLog} onClose={() => setEditingLog(null)} />}
    </div>
  );
};

export default App;
