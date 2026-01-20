
import React, { useState } from 'react';
import { TimeLog } from '../types';

interface HistoryTableProps {
  history: TimeLog[];
  onEdit: (log: TimeLog) => void;
  onDelete: (id: string) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ history, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(log => 
    log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.panelName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Worker', 'Project', 'Panel', 'Code', 'Job Section', 'Start', 'End', 'Duration'];
    const rows = filteredHistory.map(log => [
      log.email,
      log.project,
      log.panelName,
      log.panelCode,
      log.jobSection,
      new Date(log.startTime).toLocaleString(),
      new Date(log.endTime).toLocaleString(),
      log.totalTime
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Master_EMT_Sheet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Logs', val: history.length, color: 'text-slate-800' },
          { label: 'Active Workers', val: new Set(history.map(h => h.email)).size, color: 'text-blue-600' },
          { label: 'Total Projects', val: new Set(history.map(h => h.project)).size, color: 'text-indigo-600' },
          { label: 'Completed Panels', val: new Set(history.map(h => h.panelCode)).size, color: 'text-green-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <svg className="w-4 h-4 absolute left-3 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Filter by worker or project..." 
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center justify-center space-x-2 bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span>Export Master Sheet (.csv)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Worker</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project / Panel</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Section</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Times</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Duration</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-slate-400 italic">Belum ada data input kolektif.</td></tr>
              ) : (
                filteredHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-300">
                          {log.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{log.email.split('@')[0]}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-bold text-blue-600 uppercase">{log.project}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{log.panelName} ({log.panelCode})</p>
                    </td>
                    <td className="p-4 text-xs text-slate-600 italic">{log.jobSection}</td>
                    <td className="p-4">
                      <p className="text-[10px] text-slate-500">
                        {new Date(log.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - 
                        {new Date(log.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </p>
                      <p className="text-[8px] font-bold text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-mono font-bold text-slate-800 text-sm">{log.totalTime}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(log)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => onDelete(log.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
