
import React, { useState, useMemo } from 'react';
import { Settings, TimeLog, Project, Panel } from '../types';

interface InputFormProps {
  settings: Settings;
  onStart: (data: Partial<TimeLog>) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ settings, onStart }) => {
  const [formData, setFormData] = useState({
    project: '',
    panelName: '',
    panelCode: '',
    jobSection: ''
  });

  // Find selected project object
  const selectedProjectObj = useMemo(() => 
    settings.projects.find(p => p.name === formData.project),
    [settings.projects, formData.project]
  );

  // Find selected panel object within the project
  const selectedPanelObj = useMemo(() => 
    selectedProjectObj?.panels.find(p => p.name === formData.panelName),
    [selectedProjectObj, formData.panelName]
  );

  const isValid = formData.project && formData.panelName && formData.panelCode && formData.jobSection;

  const handleProjectChange = (val: string) => {
    setFormData({
      project: val,
      panelName: '',
      panelCode: '',
      jobSection: formData.jobSection
    });
  };

  const handlePanelChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      panelName: val,
      panelCode: ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onStart(formData);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-2xl mx-auto">
      <div className="bg-blue-600 px-8 py-4 text-white">
        <h3 className="text-lg font-semibold uppercase tracking-wider">Start New Task</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Project</label>
            <select 
              className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50"
              value={formData.project}
              onChange={(e) => handleProjectChange(e.target.value)}
              required
            >
              <option value="">Select Project</option>
              {settings.projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Panel Name - Filtered by Project */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Panel Name</label>
              <select 
                className={`w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all ${!formData.project ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-slate-50'}`}
                value={formData.panelName}
                onChange={(e) => handlePanelChange(e.target.value)}
                disabled={!formData.project}
                required
              >
                <option value="">Select Panel Name</option>
                {selectedProjectObj?.panels.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            </div>

            {/* Panel Code - Filtered by Panel Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Panel Code</label>
              <select 
                className={`w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all ${!formData.panelName ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-slate-50'}`}
                value={formData.panelCode}
                onChange={(e) => setFormData(prev => ({ ...prev, panelCode: e.target.value }))}
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Job Section (Bagian Pengerjaan)</label>
            <input 
              type="text"
              placeholder="e.g. Wiring, Component Mounting"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50"
              value={formData.jobSection}
              onChange={(e) => setFormData(prev => ({ ...prev, jobSection: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button 
            type="submit"
            disabled={!isValid}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2 ${
              isValid ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-green-500/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Mulai Kerja (Start Session)</span>
          </button>
        </div>
      </form>
    </div>
  );
};
