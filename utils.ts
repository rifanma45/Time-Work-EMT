
export const formatDuration = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  return formatMsToTime(diffMs);
};

export const formatMsToTime = (ms: number): string => {
  const diffHrs = Math.floor(ms / 3600000);
  const diffMins = Math.floor((ms % 3600000) / 60000);
  const diffSecs = Math.floor((ms % 60000) / 1000);
  
  return `${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`;
};

export const getCurrentTimestamp = () => new Date().toISOString();

export const generateId = () => Math.random().toString(36).substr(2, 9);
