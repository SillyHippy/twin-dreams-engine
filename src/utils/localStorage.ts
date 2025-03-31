
import { ClientData } from "@/components/ClientForm";
import { ServeAttemptData } from "@/components/ServeAttempt";

// Constants for localStorage keys
const CLIENTS_KEY = "serve-tracker-clients";
const SERVES_KEY = "serve-tracker-serves";

// Get all data from localStorage
export const getData = () => {
  try {
    // Get clients
    const clientsStr = localStorage.getItem(CLIENTS_KEY);
    const clients = clientsStr ? JSON.parse(clientsStr) : [];
    
    // Get serve attempts
    const servesStr = localStorage.getItem(SERVES_KEY);
    const serves = servesStr ? JSON.parse(servesStr) : [];
    
    return { clients, serves };
  } catch (error) {
    console.error("Error getting data from localStorage:", error);
    return { clients: [], serves: [] };
  }
};

// Save all data to localStorage
export const saveData = (data: { clients: ClientData[]; serves: ServeAttemptData[] }) => {
  try {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(data.clients));
    localStorage.setItem(SERVES_KEY, JSON.stringify(data.serves));
    return true;
  } catch (error) {
    console.error("Error saving data to localStorage:", error);
    return false;
  }
};

// Add a new client
export const addClient = (client: ClientData) => {
  try {
    // Get existing clients
    const clientsStr = localStorage.getItem(CLIENTS_KEY);
    const clients = clientsStr ? JSON.parse(clientsStr) : [];
    
    // Add new client
    clients.push(client);
    
    // Save back to localStorage
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    
    return true;
  } catch (error) {
    console.error("Error adding client to localStorage:", error);
    return false;
  }
};

// Update an existing client
export const updateClient = (updatedClient: ClientData) => {
  try {
    // Get existing clients
    const clientsStr = localStorage.getItem(CLIENTS_KEY);
    const clients = clientsStr ? JSON.parse(clientsStr) : [];
    
    // Find and update client
    const updatedClients = clients.map((c: ClientData) => 
      c.id === updatedClient.id ? updatedClient : c
    );
    
    // Save back to localStorage
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(updatedClients));
    
    return true;
  } catch (error) {
    console.error("Error updating client in localStorage:", error);
    return false;
  }
};

// Delete a client
export const deleteClient = (clientId: string) => {
  try {
    // Get existing clients
    const clientsStr = localStorage.getItem(CLIENTS_KEY);
    const clients = clientsStr ? JSON.parse(clientsStr) : [];
    
    // Filter out the client to delete
    const updatedClients = clients.filter((c: ClientData) => c.id !== clientId);
    
    // Save back to localStorage
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(updatedClients));
    
    return true;
  } catch (error) {
    console.error("Error deleting client from localStorage:", error);
    return false;
  }
};

// Add a new serve attempt
export const addServe = (serve: ServeAttemptData) => {
  try {
    // Get existing serves
    const servesStr = localStorage.getItem(SERVES_KEY);
    const serves = servesStr ? JSON.parse(servesStr) : [];
    
    // Add new serve
    serves.push(serve);
    
    // Save back to localStorage
    localStorage.setItem(SERVES_KEY, JSON.stringify(serves));
    
    return true;
  } catch (error) {
    console.error("Error adding serve to localStorage:", error);
    return false;
  }
};

// Update an existing serve attempt
export const updateServe = (updatedServe: ServeAttemptData) => {
  try {
    // Get existing serves
    const servesStr = localStorage.getItem(SERVES_KEY);
    const serves = servesStr ? JSON.parse(servesStr) : [];
    
    // Find and update serve
    const updatedServes = serves.map((s: ServeAttemptData) => 
      s.id === updatedServe.id ? updatedServe : s
    );
    
    // Save back to localStorage
    localStorage.setItem(SERVES_KEY, JSON.stringify(updatedServes));
    
    return true;
  } catch (error) {
    console.error("Error updating serve in localStorage:", error);
    return false;
  }
};

// Delete a serve attempt
export const deleteServe = (serveId: string) => {
  try {
    // Get existing serves
    const servesStr = localStorage.getItem(SERVES_KEY);
    const serves = servesStr ? JSON.parse(servesStr) : [];
    
    // Filter out the serve to delete
    const updatedServes = serves.filter((s: ServeAttemptData) => s.id !== serveId);
    
    // Save back to localStorage
    localStorage.setItem(SERVES_KEY, JSON.stringify(updatedServes));
    
    return true;
  } catch (error) {
    console.error("Error deleting serve from localStorage:", error);
    return false;
  }
};

// Clear all localStorage data
export const clearData = () => {
  try {
    localStorage.removeItem(CLIENTS_KEY);
    localStorage.removeItem(SERVES_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing localStorage data:", error);
    return false;
  }
};
