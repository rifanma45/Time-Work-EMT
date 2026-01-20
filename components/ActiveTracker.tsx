
import React, { useState, useEffect } from 'react';
import { TimeLog } from '../types';
import { formatMsToTime } from '../utils';

interface ActiveTrackerProps {
  activeLog: Partial<TimeLog>;
  onStop: (endTime: string, totalTime: string) => void;
  onPause: () => void;
  onResume: () => void;
}

export const ActiveTracker: React.FC<ActiveTrackerProps> = ({ activeLog, onStop, onPause, onResume }) => {
  const [elapsed, setElapsed] = useState('00:00:00');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      let currentSessionMs = 0;
      if (!activeLog.isPaused && activeLog.startTime) {
        currentSessionMs = new Date().getTime() - new Date(activeLog.startTime).getTime();
      }
      
      const totalMs = (activeLog.accumulatedMs || 0) + currentSessionMs;
      setElapsed(formatMsToTime(totalMs));
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, [activeLog.startTime, activeLog.isPaused, activeLog.accumulatedMs]);

  return (
    <div className="flex flex-col items-center space-y-8 max-w-2xl mx-auto">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 w-full text-center relative overflow-hidden transition-all">
        <div className={`absolute top-0 left-0 w-full h-2 ${activeLog.isPaused ? 'bg-amber-400' : 'bg-blue-500 animate-pulse'}`}></div>
        
        <div className="flex justify-center items-center space-x-2 mb-2">
          <p className={`text-sm uppercase font-bold tracking-widest ${activeLog.isPaused ? 'text-amber-600' : 'text-slate-500'}`}>
            {activeLog.isPaused ? 'Session Paused' : 'Work Session In Progress'}
          </p>
          {activeLog.isPaused && (
             <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
          )}
        </div>

        <div className={`text-7xl font-black tabular-nums mb-6 font-mono tracking-tighter transition-colors ${activeLog.isPaused ? 'text-slate-400' : 'text-slate-800'}`}>
          {elapsed}
        </div>
        
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-8 mt-4 text-left">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Started At</p>
            <p className="font-medium text-slate-700">
              {new Date(activeLog.startTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Current Clock</p>
            <p className="font-medium text-slate-700">{currentTime}</p>
          </div>
        </div>

        <div className="mt-8 bg-slate-50 p-4 rounded-xl text-left border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-600 font-bold">{activeLog.project}</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{activeLog.panelCode}</span>
          </div>
          <p className="text-slate-600 text-sm italic">Working on: {activeLog.jobSection}</p>
        </div>
      </div>

      <div className="w-full flex flex-col space-y-4">
        {activeLog.isPaused ? (
          <button 
            onClick={onResume}
            className="w-full h-20 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-xl transition-all shadow-xl hover:shadow-green-500/30 flex items-center justify-center space-x-3 active:scale-[0.98]"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span>Lanjutkan Kerja (Resume)</span>
          </button>
        ) : (
          <button 
            onClick={onPause}
            className="w-full h-20 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-xl transition-all shadow-xl hover:shadow-amber-500/30 flex items-center justify-center space-x-3 active:scale-[0.98]"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Istirahat / Jeda (Pause)</span>
          </button>
        )}

        <button 
          onClick={() => onStop(new Date().toISOString(), elapsed)}
          className="group relative w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-red-500/30 flex items-center justify-center space-x-3 active:scale-[0.98]"
        >
          <div className="w-3 h-3 bg-white rounded-sm group-hover:scale-125 transition-transform"></div>
          <span>Stop & Selesai Kerja</span>
        </button>
      </div>
    </div>
  );
};
