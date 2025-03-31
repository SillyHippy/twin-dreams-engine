
import { ClientData } from "@/components/ClientForm";
import { ServeAttemptData } from "@/components/ServeAttempt";
import { toast } from "sonner";

// Local storage keys
const CLIENTS_STORAGE_KEY = 'serve-tracker-clients';
const SERVES_STORAGE_KEY = 'serve-tracker-serves';

// Get all data from local storage
export const getData = () => {
  try {
    const clientsStr = localStorage.getItem(CLIENTS_STORAGE_KEY);
    const servesStr = localStorage.getItem(SERVES_STORAGE_KEY);
    
    return {
      clients: clientsStr ? JSON.parse(clientsStr) : [],
      serves: servesStr ? JSON.parse(servesStr) : []
    };
  } catch (error) {
    console.error("Error getting data from localStorage:", error);
    return { clients: [], serves: [] };
  }
};

// Save all data to local storage
export const saveData = (data: { clients: ClientData[], serves: ServeAttemptData[] }) => {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(data.clients));
    localStorage.setItem(SERVES_STORAGE_KEY, JSON.stringify(data.serves));
    return true;
  } catch (error) {
    console.error("Error saving data to localStorage:", error);
    return false;
  }
};

// Client operations
export const addClient = (client: ClientData) => {
  try {
    const data = getData();
    const updatedClients = [client, ...data.clients];
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
    return true;
  } catch (error) {
    console.error("Error adding client to localStorage:", error);
    return false;
  }
};

export const updateClient = (client: ClientData) => {
  try {
    const data = getData();
    const updatedClients = data.clients.map(c => c.id === client.id ? client : c);
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
    return true;
  } catch (error) {
    console.error("Error updating client in localStorage:", error);
    return false;
  }
};

export const deleteClient = (clientId: string) => {
  try {
    const data = getData();
    const updatedClients = data.clients.filter(c => c.id !== clientId);
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
    
    // Also delete associated serves
    const updatedServes = data.serves.filter(s => s.clientId !== clientId);
    localStorage.setItem(SERVES_STORAGE_KEY, JSON.stringify(updatedServes));
    return true;
  } catch (error) {
    console.error("Error deleting client from localStorage:", error);
    return false;
  }
};

// Serve operations
export const addServe = (serve: ServeAttemptData) => {
  try {
    const data = getData();
    const updatedServes = [serve, ...data.serves];
    localStorage.setItem(SERVES_STORAGE_KEY, JSON.stringify(updatedServes));
    return true;
  } catch (error) {
    console.error("Error adding serve to localStorage:", error);
    return false;
  }
};

export const updateServe = (serve: ServeAttemptData) => {
  try {
    const data = getData();
    const updatedServes = data.serves.map(s => s.id === serve.id ? serve : s);
    localStorage.setItem(SERVES_STORAGE_KEY, JSON.stringify(updatedServes));
    return true;
  } catch (error) {
    console.error("Error updating serve in localStorage:", error);
    return false;
  }
};

export const deleteServe = (serveId: string) => {
  try {
    const data = getData();
    const updatedServes = data.serves.filter(s => s.id !== serveId);
    localStorage.setItem(SERVES_STORAGE_KEY, JSON.stringify(updatedServes));
    return true;
  } catch (error) {
    console.error("Error deleting serve from localStorage:", error);
    return false;
  }
};

// Clear all data from local storage
export const clearAllData = () => {
  try {
    localStorage.removeItem(CLIENTS_STORAGE_KEY);
    localStorage.removeItem(SERVES_STORAGE_KEY);
    toast.success("Local storage cleared", {
      description: "All local data has been reset"
    });
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    toast.error("Failed to clear local storage", {
      description: error instanceof Error ? error.message : "Unknown error"
    });
    return false;
  }
};
