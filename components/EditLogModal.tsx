
import React, { useState, useMemo } from 'react';
import { TimeLog, Settings } from '../types';
import { formatDuration } from '../utils';

interface EditLogModalProps {
  log: TimeLog;
  settings: Settings;
  onSave: (updatedLog: TimeLog) => void;
  onClose: () => void;
}

export const EditLogModal: React.FC<EditLogModalProps> = ({ log, settings, onSave, onClose }) => {
  const [formData, setFormData] = useState<TimeLog>({ ...log });

  const selectedProjectObj = useMemo(() => 
    settings.projects.find(p => p.name === formData.project),
    [settings.projects, formData.project]
  );

  const selectedPanelObj = useMemo(() => 
    selectedProjectObj?.panels.find(p => p.name === formData.panelName),
    [selectedProjectObj, formData.panelName]
  );

  const handleUpdateField = (field: keyof TimeLog, value: string) => {
    const updated = { ...formData, [field]: value };
    
    // Recalculate duration if times change
    if (field === 'startTime' || field === 'endTime') {
      try {
        updated.totalTime = formatDuration(updated.startTime, updated.endTime);
      } catch (e) {
        console.error("Invalid dates for duration calculation");
      }
    }

    // Reset children fields if parent changes
    if (field === 'project') {
      updated.panelName = '';
      updated.panelCode = '';
    } else if (field === 'panelName') {
      updated.panelCode = '';
    }

    setFormData(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all text-sm";
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Edit Entry</h3>
            <p className="text-xs text-slate-400 mt-0.5">ID: {log.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-5">
            {/* Project */}
            <div>
              <label className={labelClass}>Project</label>
              <select 
                className={inputClass}
                value={formData.project}
                onChange={(e) => handleUpdateField('project', e.target.value)}
                required
              >
                <option value="">Select Project</option>
                {settings.projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Panel Name */}
              <div>
                <label className={labelClass}>Panel Name</label>
                <select 
                  className={inputClass}
                  value={formData.panelName}
                  onChange={(e) => handleUpdateField('panelName', e.target.value)}
                  disabled={!formData.project}
                  required
                >
                  <option value="">Select Panel</option>
                  {selectedProjectObj?.panels.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
              </div>

              {/* Panel Code */}
              <div>
                <label className={labelClass}>Panel Code</label>
                <select 
                  className={inputClass}
                  value={formData.panelCode}
                  onChange={(e) => handleUpdateField('panelCode', e.target.value)}
                  disabled={!formData.panelName}
                  required
                >
                  <option value="">Select Code</option>
                  {selectedPanelObj?.codes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Job Section */}
            <div>
              <label className={labelClass}>Bagian Pengerjaan</label>
              <input 
                type="text"
                className={inputClass}
                value={formData.jobSection}
                onChange={(e) => handleUpdateField('jobSection', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              {/* Start Time */}
              <div>
                <label className={labelClass}>Jam Mulai</label>
                <input 
                  type="datetime-local"
                  className={inputClass}
                  value={formData.startTime.substring(0, 16)} // Convert ISO to local-ready
                  onChange={(e) => handleUpdateField('startTime', new Date(e.target.value).toISOString())}
                  required
                />
              </div>

              {/* End Time */}
              <div>
                <label className={labelClass}>Jam Selesai</label>
                <input 
                  type="datetime-local"
                  className={inputClass}
                  value={formData.endTime.substring(0, 16)}
                  onChange={(e) => handleUpdateField('endTime', new Date(e.target.value).toISOString())}
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center">
            <div className="text-sm font-mono text-blue-600 font-bold">
              Total: {formData.totalTime}
            </div>
            <div className="flex space-x-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
