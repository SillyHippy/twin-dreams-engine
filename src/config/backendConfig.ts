
// Backend configuration
// This file manages the backend service for the app

export const BACKEND_PROVIDER = {
  APPWRITE: 'appwrite',
  LOCAL: 'local' // Option for offline development
};

// Set to 'appwrite' to use Appwrite, or 'local' for local storage only
export const ACTIVE_BACKEND = BACKEND_PROVIDER.APPWRITE;

// Appwrite configuration
export const APPWRITE_CONFIG = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '67ead974001245b7c6aa',
  databaseId: '67eae6fe0020c6721531', // serve-tracker-db
  collections: {
    clients: '67eae70e000c042112c8',
    serveAttempts: '67eae7ef0034c7ad35f6',
    clientCases: '67eae98f0017c9503bee',
    clientDocuments: '67eaeaa900128f318514'
  },
  storageBucket: 'client-documents'
};

// Helper function to determine if Appwrite is configured
export const isAppwriteConfigured = () => {
  return !!APPWRITE_CONFIG.projectId && !!APPWRITE_CONFIG.endpoint;
};

// Helper function to determine if we should fall back to local storage
export const shouldUseFallbackStorage = () => {
  // If we're using Appwrite but have connection issues, use local storage
  if (ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE) {
    // We'll check for connection errors elsewhere and use this flag
    return window.localStorage.getItem('useLocalStorageFallback') === 'true';
  }
  return ACTIVE_BACKEND === BACKEND_PROVIDER.LOCAL;
};
