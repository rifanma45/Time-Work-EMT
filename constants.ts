
export const ADMIN_EMAIL = 'rifanma45@gmail.com';

export const INITIAL_SETTINGS = {
  // TEMPELKAN URL GOOGLE APPS SCRIPT ANDA DI SINI AGAR SEMUA USER OTOMATIS TERKONEKSI
  scriptUrl: '', 
  projects: [
    {
      name: 'Project Alpha',
      panels: [
        { name: 'Main Switchboard A', codes: ['MSA-01', 'MSA-02'] },
        { name: 'Distribution Board A', codes: ['DBA-01'] }
      ]
    },
    {
      name: 'Project Beta',
      panels: [
        { name: 'Control Panel B', codes: ['CPB-X', 'CPB-Y'] }
      ]
    }
  ],
  adminEmails: ['rifanma45@gmail.com']
};

export const STORAGE_KEYS = {
  USER: 'emt_user',
  SETTINGS: 'emt_settings',
  HISTORY: 'emt_history'
};
