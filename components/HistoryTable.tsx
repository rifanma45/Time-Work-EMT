
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
    const headers = ['Worker (Email)', 'Project', 'Nama Panel', 'Kode Panel', 'Bagian Pengerjaan', 'Jam Mulai', 'Jam Selesai', 'Durasi Total'];
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
    link.setAttribute("download", `Collective_Timesheet_EMT_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards for Admin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Entry</p>
          <p className="text-3xl font-black text-slate-800">{history.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Projects</p>
          <p className="text-3xl font-black text-blue-600">{new Set(history.map(h => h.project)).size}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unique Workers</p>
          <p className="text-3xl font-black text-green-600">{new Set(history.map(h => h.email)).size}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama worker, project, atau panel..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={exportToCSV}
            className="w-full md:w-auto flex items-center justify-center space-x-2 text-sm bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors shadow-sm font-bold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Rekap CSV</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Worker (Engineer)</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Panel</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bagian Kerja</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Waktu</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Durasi Kerja</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400 italic">Data tidak ditemukan atau belum ada data masuk.</td>
                </tr>
              ) : (
                filteredHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                          {log.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{log.email.split('@')[0]}</p>
                          <p className="text-[10px] text-slate-400">{log.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-100 uppercase">
                        {log.project}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-700 font-semibold">{log.panelName}</p>
                      <p className="text-[10px] font-mono text-slate-400 uppercase">{log.panelCode}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-600 italic leading-snug">{log.jobSection}</td>
                    <td className="p-4">
                      <div className="text-xs text-slate-500 flex flex-col">
                        <span>{formatTime(log.startTime)} → {formatTime(log.endTime)}</span>
                        <span className="text-[9px] font-bold text-slate-400 mt-0.5">{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-mono font-black text-blue-600 text-sm tabular-nums">{log.totalTime}</p>
                      <span className="text-[8px] bg-green-100 text-green-700 px-1 py-0.5 rounded font-bold uppercase tracking-tighter">Verified</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center space-x-1">
                        <button 
                          onClick={() => onEdit(log)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Koreksi Data"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => onDelete(log.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Hapus Permanen"
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
