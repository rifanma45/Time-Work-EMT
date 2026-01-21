
export const ADMIN_EMAIL = 'rifanma45@gmail.com';

export const INITIAL_SETTINGS = {
  /**
   * MASTER CONFIGURATION
   * URL Google Apps Script Web App yang sudah dikoneksikan.
   * Begitu diisi, SEMUA user yang membuka aplikasi ini akan otomatis 
   * terhubung ke database yang sama tanpa perlu setting lagi.
   */
  scriptUrl: 'https://script.google.com/macros/s/AKfycbxmx-zANMST-un3SmTk-sN7nFmzWtQwjtLSz360VSgmoZGOibmK4bgLmoydV0xcWb01/exec', 
  
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