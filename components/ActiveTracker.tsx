
import React, { useState, useEffect } from 'react';
import { TimeLog } from '../types';
import { formatMsToTime } from '../utils';

interface ActiveTrackerProps {
  activeLog: Partial<TimeLog>;
  onStop: (endTime: string, totalTime: string) => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  isCloudEnabled?: boolean;
}

export const ActiveTracker: React.FC<ActiveTrackerProps & { isCloudEnabled?: boolean }> = ({ 
  activeLog, 
  onStop, 
  onPause, 
  onResume,
  onCancel,
  isCloudEnabled = true 
}) => {
  const [elapsed, setElapsed] = useState('00:00:00');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour12: false }));
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      let currentSessionMs = 0;
      if (!activeLog.isPaused && activeLog.startTime) {
        currentSessionMs = new Date().getTime() - new Date(activeLog.startTime).getTime();
      }
      
      const totalMs = (activeLog.accumulatedMs || 0) + currentSessionMs;
      setElapsed(formatMsToTime(totalMs));
      setCurrentTime(new Date().toLocaleTimeString([], { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeLog.startTime, activeLog.isPaused, activeLog.accumulatedMs]);

  useEffect(() => {
    if (isConfirmingCancel) {
      const t = setTimeout(() => setIsConfirmingCancel(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isConfirmingCancel]);

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isConfirmingCancel) {
      onCancel();
    } else {
      setIsConfirmingCancel(true);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 max-w-2xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl border border-slate-100 w-full text-center relative overflow-hidden transition-all">
        <div className={`absolute top-0 left-0 w-full h-2 sm:h-3 transition-colors duration-500 ${activeLog.isPaused ? 'bg-amber-400' : 'bg-blue-600 animate-pulse'}`}></div>
        
        <div className="flex justify-center items-center space-x-2 mb-6">
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${activeLog.isPaused ? 'text-amber-600' : 'text-slate-400'}`}>
            {activeLog.isPaused ? 'Sesi Dijeda' : 'Sesi Sedang Berjalan'}
          </p>
          {activeLog.isPaused && (
             <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
          )}
        </div>

        <div className={`text-5xl sm:text-7xl md:text-8xl font-black tabular-nums mb-8 font-mono tracking-tighter transition-all leading-none ${activeLog.isPaused ? 'text-slate-300' : 'text-slate-900'}`}>
          {elapsed}
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:gap-8 border-t border-slate-50 pt-8 mt-4 text-left">
          <div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Mulai Jam</p>
            <p className="font-bold text-slate-800 text-base sm:text-lg">
              {new Date(activeLog.startTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Jam Sekarang</p>
            <p className="font-bold text-blue-600 text-base sm:text-lg">{currentTime}</p>
          </div>
        </div>

        <div className="mt-8 bg-slate-50 rounded-3xl p-5 sm:p-6 text-left border border-slate-100/50">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 mr-2">
              <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">Project</p>
              <h4 className="text-slate-800 font-black leading-tight uppercase text-sm sm:text-base break-words">{activeLog.project}</h4>
            </div>
            <div className="bg-white border border-slate-200 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-sm h-fit">
              <span className="text-[10px] sm:text-xs font-mono font-black text-slate-700">{activeLog.panelCode}</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-medium italic border-t border-slate-200/50 pt-3">
            <span className="text-slate-400 font-bold not-italic text-[10px] uppercase mr-2 tracking-wider">Bagian:</span> 
            {activeLog.jobSection}
          </p>
        </div>
      </div>

      <div className="w-full flex flex-col space-y-4">
        <div className="flex flex-col space-y-3">
          {activeLog.isPaused ? (
            <button 
              type="button"
              onClick={onResume}
              className="w-full h-16 sm:h-20 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[1.5rem] sm:rounded-[2rem] font-black text-lg sm:text-xl transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center space-x-3 active:scale-[0.97]"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>LANJUTKAN KERJA</span>
            </button>
          ) : (
            <button 
              type="button"
              onClick={onPause}
              className="w-full h-16 sm:h-20 bg-amber-500 hover:bg-amber-600 text-white rounded-[1.5rem] sm:rounded-[2rem] font-black text-lg sm:text-xl transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center space-x-3 active:scale-[0.97]"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>ISTIRAHAT (PAUSE)</span>
            </button>
          )}

          <button 
            type="button"
            onClick={() => onStop(new Date().toISOString(), elapsed)}
            className="group relative w-full h-16 sm:h-20 bg-slate-900 hover:bg-blue-600 text-white rounded-[1.5rem] sm:rounded-[2rem] font-black text-base sm:text-lg transition-all shadow-xl active:scale-[0.97] flex items-center justify-center space-x-4"
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-sm group-hover:bg-white group-hover:scale-125 transition-all"></div>
                <span>STOP & SELESAI</span>
              </div>
              {isCloudEnabled && (
                <span className="text-[8px] sm:text-[9px] text-blue-400 font-bold uppercase tracking-widest mt-0.5 opacity-80 group-hover:text-white transition-colors">Data Akan Terinput</span>
              )}
            </div>
          </button>
        </div>

        <button 
          type="button"
          onClick={handleCancelClick}
          className={`mx-auto flex items-center space-x-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all py-3 px-8 rounded-2xl active:scale-95 border-none outline-none ${
            isConfirmingCancel 
              ? 'bg-red-600 text-white shadow-lg shadow-red-500/40 animate-pulse scale-105' 
              : 'text-slate-400 hover:text-red-500 bg-slate-100/50 hover:bg-slate-100'
          }`}
        >
          <svg className={`w-3.5 h-3.5 ${isConfirmingCancel ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isConfirmingCancel ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
          <span>{isConfirmingCancel ? 'KLIK LAGI UNTUK BATAL' : 'Batal & Discard Sesi'}</span>
        </button>
      </div>
    </div>
  );
};
