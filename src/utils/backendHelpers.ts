
import { ACTIVE_BACKEND, BACKEND_PROVIDER } from '@/config/backendConfig';
import { appwrite } from '@/lib/appwrite';
import { toast } from 'sonner';

// Helper function to check which backend is currently active
export const isUsingAppwrite = () => {
  return ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE;
};

// Helper function to check if we're properly connected to the active backend
export const checkBackendConnection = async () => {
  try {
    if (ACTIVE_BACKEND === BACKEND_PROVIDER.LOCAL) {
      return { connected: true, provider: 'Local Storage' };
    }
    
    // Try to connect to Appwrite
    const clients = await appwrite.getClients();
    // If we get here, we're connected
    // Reset any fallback flags
    window.localStorage.removeItem('useLocalStorageFallback');
    return { connected: true, provider: 'Appwrite' };
  } catch (error) {
    console.error("Appwrite connection check failed:", error);
    // Set fallback flag for offline usage
    window.localStorage.setItem('useLocalStorageFallback', 'true');
    
    // Show toast only once - not on every failed check
    if (!window.localStorage.getItem('connectionErrorShown')) {
      toast.error("Appwrite connection failed", {
        description: "Using local storage as fallback. Data will sync when connection is restored."
      });
      window.localStorage.setItem('connectionErrorShown', 'true');
    }
    
    return { connected: false, provider: 'Appwrite', error };
  }
};

// Helper function to switch backends
export const switchBackend = (targetBackend: string) => {
  // This function would need to update localStorage settings
  toast.info(`Switching to ${targetBackend} requires an application restart`, {
    description: "Please reload the application after making this change"
  });
};

// Helper to get displayable backend information
export const getBackendInfo = () => {
  return {
    name: ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE ? "Appwrite" : "Local Storage",
    icon: "⚡",
    color: ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE ? "bg-indigo-500" : "bg-slate-500"
  };
};

export default {
  isUsingAppwrite,
  checkBackendConnection,
  switchBackend,
  getBackendInfo
};
