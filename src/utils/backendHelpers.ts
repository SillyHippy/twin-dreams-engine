
import { ACTIVE_BACKEND, BACKEND_PROVIDER } from '@/config/backendConfig';
import { supabase } from '@/lib/supabase';
import { appwrite } from '@/lib/appwrite';
import { toast } from 'sonner';

// Helper function to check which backend is currently active
export const isUsingAppwrite = () => {
  return ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE;
};

// Helper function to check if we're properly connected to the active backend
export const checkBackendConnection = async () => {
  if (isUsingAppwrite()) {
    try {
      const clients = await appwrite.getClients();
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
  } else if (ACTIVE_BACKEND === BACKEND_PROVIDER.SUPABASE) {
    try {
      const { data, error } = await supabase.from('clients').select('id').limit(1);
      if (error) throw error;
      return { connected: true, provider: 'Supabase' };
    } catch (error) {
      console.error("Supabase connection check failed:", error);
      return { connected: false, provider: 'Supabase', error };
    }
  } else {
    // Local storage mode
    return { connected: true, provider: 'Local' };
  }
};

// Helper function to switch backends
export const switchBackend = (targetBackend: string) => {
  // This function would need to update a configuration file or localStorage
  // For now, it just displays a message that requires app reload
  toast.info(`Switching to ${targetBackend} requires an application restart`, {
    description: "Please reload the application after making this change in the configuration file"
  });
};

// Helper to get displayable backend information
export const getBackendInfo = () => {
  const backendName = isUsingAppwrite() ? "Appwrite" : (ACTIVE_BACKEND === BACKEND_PROVIDER.LOCAL ? "Local Storage" : "Supabase");
  return {
    name: backendName,
    icon: isUsingAppwrite() ? "⚡" : (ACTIVE_BACKEND === BACKEND_PROVIDER.LOCAL ? "💾" : "⚡️"),
    color: isUsingAppwrite() ? "bg-indigo-500" : (ACTIVE_BACKEND === BACKEND_PROVIDER.LOCAL ? "bg-gray-500" : "bg-emerald-500")
  };
};

export default {
  isUsingAppwrite,
  checkBackendConnection,
  switchBackend,
  getBackendInfo
};
