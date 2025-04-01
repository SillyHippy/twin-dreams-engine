
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
    console.log("Checking Appwrite connection...");
    // Try to get clients from Appwrite as a connection test
    const clients = await appwrite.getClients();
    console.log("Appwrite connection successful, retrieved", clients.length, "clients");
    
    // If we get here, we're connected
    // Reset any fallback flags
    window.localStorage.removeItem('useLocalStorageFallback');
    window.localStorage.removeItem('connectionErrorShown');
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

// Helper to get displayable backend information
export const getBackendInfo = () => {
  return {
    name: "Appwrite",
    icon: "⚡",
    color: "bg-indigo-500"
  };
};

export default {
  isUsingAppwrite,
  checkBackendConnection,
  getBackendInfo
};
