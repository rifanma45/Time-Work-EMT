
export interface User {
  email: string;
  isAdmin: boolean;
}

export interface Panel {
  name: string;
  codes: string[];
}

export interface Project {
  name: string;
  panels: Panel[];
}

export interface Settings {
  projects: Project[];
  adminEmails: string[];
  scriptUrl?: string; // URL Google Apps Script
}

export interface TimeLog {
  id: string;
  email: string;
  project: string;
  panelName: string;
  panelCode: string;
  jobSection: string;
  startTime: string;
  initialStartTime?: string;
  endTime: string;
  totalTime: string;
  timestamp: number;
  isPaused?: boolean;
  accumulatedMs?: number;
}

export interface AppState {
  currentStep: 'input' | 'active' | 'history' | 'settings';
  activeLog: Partial<TimeLog> | null;
}
