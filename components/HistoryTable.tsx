
import React from 'react';
import { TimeLog } from '../types';

interface HistoryTableProps {
  history: TimeLog[];
  onEdit: (log: TimeLog) => void;
  onDelete: (id: string) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ history, onEdit, onDelete }) => {
  const exportToCSV = () => {
    const headers = ['Nama (Email)', 'Project', 'Nama Panel', 'Kode Panel', 'Bagian Pengerjaan', 'Jam Mulai', 'Jam Selesai', 'Durasi'];
    const rows = history.map(log => [
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
    link.setAttribute("download", `EMT_Timesheet_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-bold text-slate-800">Timesheet Spreadsheet</h3>
        <button 
          onClick={exportToCSV}
          className="flex items-center space-x-2 text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export CSV</span>
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama / Akun</th>
              <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project</th>
              <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Panel</th>
              <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kode Panel</th>
              <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bagian Pengerjaan</th>
              <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jam Mulai</th>
              <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jam Selesai</th>
              <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Durasi</th>
              <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-10 text-center text-slate-400 italic">Belum ada data pengerjaan tersimpan.</td>
              </tr>
            ) : (
              history.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-slate-800 text-sm">{log.email.split('@')[0]}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{log.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-bold border border-blue-100">
                      {log.project}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-700 font-medium">{log.panelName}</td>
                  <td className="p-4 text-sm font-mono text-slate-500">{log.panelCode}</td>
                  <td className="p-4 text-sm text-slate-600 italic">{log.jobSection}</td>
                  <td className="p-4 text-sm text-slate-500 tabular-nums">{formatTime(log.startTime)}</td>
                  <td className="p-4 text-sm text-slate-500 tabular-nums">{formatTime(log.endTime)}</td>
                  <td className="p-4 text-right">
                    <p className="font-mono font-bold text-blue-600 text-sm tabular-nums">{log.totalTime}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => onEdit(log)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Data"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => onDelete(log.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Hapus Data"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
};
