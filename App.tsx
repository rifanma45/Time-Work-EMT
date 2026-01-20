
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
      if (!user.isAdmin && (state.currentStep === 'history' || state.currentStep === 'settings')) {
        setState(prev => ({ ...prev, currentStep: 'input' }));
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user, state.currentStep]);

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
    
    // We use the original initialStartTime for the log record
    const newLog: TimeLog = {
      ...(state.activeLog as TimeLog),
      id: Math.random().toString(36).substr(2, 9),
      startTime: state.activeLog.initialStartTime || state.activeLog.startTime!,
      endTime,
      totalTime, // totalTime already excludes pauses as it comes from ActiveTracker's elapsed state
      timestamp: Date.now(),
      isPaused: false,
      accumulatedMs: 0
    };
    
    setHistory(prev => [newLog, ...prev]);
    setState({ currentStep: user?.isAdmin ? 'history' : 'input', activeLog: null });
    generateInsights([newLog, ...history]);
  };

  const handleUpdateLog = (updatedLog: TimeLog) => {
    setHistory(prev => prev.map(log => log.id === updatedLog.id ? updatedLog : log));
    setEditingLog(null);
  };

  const handleDeleteLog = (id: string) => {
    if (window.confirm('Hapus data ini?')) {
      setHistory(prev => prev.filter(log => log.id !== id));
    }
  };

  const generateInsights = async (currentHistory: TimeLog[]) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on these recent work logs for engineering work: ${JSON.stringify(currentHistory.slice(0, 5))}. 
                   Give a very short, motivating sentence (max 15 words) about productivity or progress for the EMT team.`,
      });
      setInsight(response.text);
    } catch (err) {
      console.error("AI Insight Error:", err);
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentStep={state.currentStep} 
        onChangeStep={(step) => setState(prev => ({ ...prev, currentStep: step as any }))} 
        isAdmin={user.isAdmin}
        onLogout={handleLogout}
        userEmail={user.email}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-8 flex justify-between items-start">
          <div className="flex items-start space-x-3">
            {user.isAdmin && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 bg-white border border-slate-200 rounded-lg text-slate-600 shadow-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                {state.currentStep === 'input' && 'Track New Entry'}
                {state.currentStep === 'active' && 'Current Job Running'}
                {state.currentStep === 'history' && 'Timesheet Spreadsheet'}
                {state.currentStep === 'settings' && 'System Configuration'}
              </h1>
              <p className="text-slate-500 mt-1 text-sm md:text-base">Hello, {user.email.split('@')[0]}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            {insight && (
              <div className="hidden lg:block bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg text-sm text-blue-700 italic max-w-sm">
                ✨ "{insight}"
              </div>
            )}
            
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center space-x-2 bg-white border border-slate-200 px-3 py-2 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-blue-200 transition-all shadow-sm active:scale-95"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z" />
              </svg>
              <span className="hidden xs:inline">Bagikan App</span>
              <span className="xs:hidden">Share</span>
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {state.currentStep === 'input' && (
            <InputForm settings={settings} onStart={startTracking} />
          )}
          
          {state.currentStep === 'active' && state.activeLog && (
            <ActiveTracker 
              activeLog={state.activeLog} 
              onStop={stopTracking} 
              onPause={handlePause}
              onResume={handleResume}
            />
          )}
          
          {state.currentStep === 'history' && user.isAdmin && (
            <HistoryTable history={history} onEdit={setEditingLog} onDelete={handleDeleteLog} />
          )}
          
          {state.currentStep === 'settings' && user.isAdmin && (
            <SettingsPanel settings={settings} onUpdateSettings={setSettings} currentUserEmail={user.email} />
          )}
        </div>
      </main>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
      />

      {editingLog && (
        <EditLogModal 
          log={editingLog} 
          settings={settings} 
          onSave={handleUpdateLog} 
          onClose={() => setEditingLog(null)} 
        />
      )}
    </div>
  );
};

export default App;
