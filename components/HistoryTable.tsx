
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
    log.panelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.panelCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Worker', 'Project', 'Panel', 'Code', 'Job Section', 'Start', 'End', 'Duration', 'Date'];
    const rows = filteredHistory.map(log => [
      log.email,
      log.project,
      log.panelName,
      log.panelCode,
      log.jobSection,
      new Date(log.startTime).toLocaleString(),
      new Date(log.endTime).toLocaleString(),
      log.totalTime,
      new Date(log.timestamp).toLocaleDateString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Master_EMT_Cloud_Sheet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Ringkasan Admin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Logs</p>
          <p className="text-3xl font-black text-slate-800 tracking-tighter">{history.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Workers Aktif</p>
          <p className="text-3xl font-black text-blue-600 tracking-tighter">{new Set(history.map(h => h.email)).size}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Project Berjalan</p>
          <p className="text-3xl font-black text-indigo-600 tracking-tighter">{new Set(history.map(h => h.project)).size}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Panel Selesai</p>
          <p className="text-3xl font-black text-green-600 tracking-tighter">{new Set(history.map(h => h.panelCode)).size}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <svg className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Cari worker, project, atau kode panel..." 
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center justify-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Ekstrak Data CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Worker</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project & Panel</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pengerjaan</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waktu</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Durasi</th>
                <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-slate-400 italic font-medium">Belum ada data pengerjaan yang masuk.</td>
                </tr>
              ) : (
                filteredHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center text-[11px] font-black text-slate-600 border border-white shadow-sm">
                          {log.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 truncate max-w-[120px]">{log.email.split('@')[0]}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{log.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="text-xs font-black text-blue-600 uppercase tracking-tight">{log.project}</p>
                      <p className="text-[11px] text-slate-600 font-semibold mt-0.5">{log.panelName} <span className="text-slate-400 font-mono">({log.panelCode})</span></p>
                    </td>
                    <td className="p-5">
                      <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/50 italic">
                        {log.jobSection}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="text-[11px] text-slate-500 font-medium">
                        <span className="block text-slate-700 font-bold">{new Date(log.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(log.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <span className="font-mono font-black text-slate-900 text-sm tracking-tighter">{log.totalTime}</span>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onEdit(log)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => onDelete(log.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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
