
import { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import History from "./pages/History";
import Layout from "./components/Layout";
import NewClient from "./pages/NewClient";
import EditClient from "./pages/EditClient";
import NewServe from "./pages/NewServe";
import { ClientData } from "./components/ClientForm";
import { ServeAttemptData } from "./components/ServeAttempt";
import { v4 as uuidv4 } from "uuid";
import Export from "./pages/Export";
import Settings from "./pages/Settings";
import { checkBackendConnection } from "./utils/backendHelpers";
import { ACTIVE_BACKEND, BACKEND_PROVIDER, shouldUseFallbackStorage } from "./config/backendConfig";
import { appwrite } from "./lib/appwrite";
import * as localStorage from "./utils/localStorage";
import { useToast } from "@/hooks/use-toast";

function App() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [serves, setServes] = useState<ServeAttemptData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Function to load data based on the active backend
  const loadData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Check backend connection first
      const connectionStatus = await checkBackendConnection();
      console.log(`Backend connection status: ${connectionStatus.connected ? "Connected" : "Disconnected"} to ${connectionStatus.provider}`);
      
      // If we should use local storage (either configured or as fallback)
      if (shouldUseFallbackStorage() || ACTIVE_BACKEND === BACKEND_PROVIDER.LOCAL) {
        console.log("Loading from local storage");
        // Load from localStorage
        const localData = localStorage.getData();
        setClients(localData.clients || []);
        setServes(localData.serves || []);
      } 
      // If Appwrite is the active backend and we're connected
      else if (ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE && connectionStatus.connected) {
        console.log("Loading data from Appwrite instead of local storage");
        
        try {
          // Get clients from Appwrite
          const appwriteClients = await appwrite.getClients();
          
          // Get serve attempts from Appwrite
          const appwriteServes = await appwrite.getServeAttempts();
          
          console.log(`Loaded ${appwriteClients.length} clients and ${appwriteServes.length} serve attempts from Appwrite`);
          
          setClients(appwriteClients);
          setServes(appwriteServes);
          
          // Update local storage as backup
          localStorage.saveData({
            clients: appwriteClients,
            serves: appwriteServes
          });
        } catch (error) {
          console.error("Error fetching data from Appwrite:", error);
          
          // Fallback to local storage
          console.log("Falling back to local storage due to error");
          const localData = localStorage.getData();
          setClients(localData.clients || []);
          setServes(localData.serves || []);
          
          // Mark for fallback mode
          window.localStorage.setItem('useLocalStorageFallback', 'true');
        }
      } 
      // If Supabase is the active backend
      else if (ACTIVE_BACKEND === BACKEND_PROVIDER.SUPABASE) {
        // Supabase loading logic would go here
        // We're no longer supporting Supabase in this app version
        console.log("Supabase is no longer the primary backend, falling back to local storage");
        const localData = localStorage.getData();
        setClients(localData.clients || []);
        setServes(localData.serves || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      
      // Final fallback - use whatever might be in local storage
      const localData = localStorage.getData();
      setClients(localData.clients || []);
      setServes(localData.serves || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on initial load
  useEffect(() => {
    loadData();
    
    // Set up periodic sync with backend every 5 seconds
    const syncInterval = setInterval(() => {
      console.log("Running periodic sync with Appwrite...");
      loadData();
    }, 5000);
    
    return () => clearInterval(syncInterval);
  }, [loadData]);

  // Add a new client
  const addClient = async (client: ClientData) => {
    try {
      const newClient = { ...client, id: client.id || `client-${uuidv4()}` };
      
      // If using Appwrite and connected
      if (ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE && !shouldUseFallbackStorage()) {
        try {
          // Save to Appwrite
          await appwrite.createClient(newClient);
          
          // Reload all data to ensure we're in sync
          await loadData();
          
          toast({
            title: "Client added successfully",
            description: "New client has been created"
          });
          
          return true;
        } catch (error) {
          console.error("Error saving client to Appwrite:", error);
          
          // Fall back to local storage
          localStorage.addClient(newClient);
          setClients([...clients, newClient]);
          
          toast({
            title: "Client saved locally",
            description: "Connection to Appwrite failed, saved to local storage",
            variant: "destructive"
          });
          
          return true;
        }
      } else {
        // Save to local storage
        localStorage.addClient(newClient);
        setClients([...clients, newClient]);
        
        toast({
          title: "Client added successfully",
          description: "New client has been created"
        });
        
        return true;
      }
    } catch (error) {
      console.error("Error adding client:", error);
      
      toast({
        title: "Error adding client",
        description: "Failed to add client",
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Update an existing client
  const updateClient = async (updatedClient: ClientData) => {
    try {
      // Ensure client has an ID
      if (!updatedClient.id) {
        throw new Error("Client ID is missing");
      }
      
      // If using Appwrite and connected
      if (ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE && !shouldUseFallbackStorage()) {
        try {
          // Update in Appwrite
          await appwrite.updateClient(updatedClient);
          
          // Reload all data to ensure we're in sync
          await loadData();
          
          toast({
            title: "Client updated successfully",
            description: "Client information has been updated"
          });
          
          return true;
        } catch (error) {
          console.error("Error updating client in Appwrite:", error);
          
          // Fall back to local storage
          localStorage.updateClient(updatedClient);
          setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
          
          toast({
            title: "Client saved locally",
            description: "Connection to Appwrite failed, saved to local storage",
            variant: "destructive"
          });
          
          return true;
        }
      } else {
        // Update in local storage
        localStorage.updateClient(updatedClient);
        setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
        
        toast({
          title: "Client updated successfully",
          description: "Client information has been updated"
        });
        
        return true;
      }
    } catch (error) {
      console.error("Error updating client:", error);
      
      toast({
        title: "Error updating client",
        description: "Failed to update client",
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Add a new serve attempt
  const addServe = async (serve: ServeAttemptData) => {
    try {
      // Generate ID if not provided
      const newServe = { 
        ...serve,
        id: serve.id || `serve-${uuidv4()}`,
        timestamp: serve.timestamp || new Date().toISOString()
      };
      
      // If using Appwrite and connected
      if (ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE && !shouldUseFallbackStorage()) {
        try {
          // Save to Appwrite
          await appwrite.createServeAttempt(newServe);
          
          // Reload all data to ensure we're in sync
          await loadData();
          
          toast({
            title: "Serve record created",
            description: "New serve attempt has been recorded"
          });
          
          return true;
        } catch (error) {
          console.error("Error saving serve to Appwrite:", error);
          
          // Fall back to local storage
          localStorage.addServe(newServe);
          setServes([...serves, newServe]);
          
          toast({
            title: "Serve saved locally",
            description: "Connection to Appwrite failed, saved to local storage",
            variant: "destructive"
          });
          
          return true;
        }
      } else {
        // Save to local storage
        localStorage.addServe(newServe);
        setServes([...serves, newServe]);
        
        toast({
          title: "Serve record created",
          description: "New serve attempt has been recorded"
        });
        
        return true;
      }
    } catch (error) {
      console.error("Error adding serve:", error);
      
      toast({
        title: "Error recording serve",
        description: "Failed to record serve attempt",
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Delete a serve attempt
  const deleteServe = async (id: string) => {
    try {
      // If using Appwrite and connected
      if (ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE && !shouldUseFallbackStorage()) {
        try {
          // Delete from Appwrite
          await appwrite.deleteServeAttempt(id);
          
          // Reload all data to ensure we're in sync
          await loadData();
          
          toast({
            title: "Serve record deleted",
            description: "Serve attempt has been removed"
          });
          
          return true;
        } catch (error) {
          console.error("Error deleting serve from Appwrite:", error);
          
          // Fall back to local storage
          localStorage.deleteServe(id);
          setServes(serves.filter(s => s.id !== id));
          
          toast({
            title: "Serve deleted locally",
            description: "Connection to Appwrite failed, deleted from local storage",
            variant: "destructive"
          });
          
          return true;
        }
      } else {
        // Delete from local storage
        localStorage.deleteServe(id);
        setServes(serves.filter(s => s.id !== id));
        
        toast({
          title: "Serve record deleted",
          description: "Serve attempt has been removed"
        });
        
        return true;
      }
    } catch (error) {
      console.error("Error deleting serve:", error);
      
      toast({
        title: "Error deleting serve",
        description: "Failed to delete serve attempt",
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Update an existing serve attempt
  const updateServe = async (updatedServe: ServeAttemptData) => {
    try {
      // Ensure serve has an ID
      if (!updatedServe.id) {
        throw new Error("Serve ID is missing");
      }
      
      // If using Appwrite and connected
      if (ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE && !shouldUseFallbackStorage()) {
        try {
          // Update in Appwrite
          await appwrite.updateServeAttempt(updatedServe);
          
          // Reload all data to ensure we're in sync
          await loadData();
          
          toast({
            title: "Serve record updated",
            description: "Serve attempt has been updated"
          });
          
          return true;
        } catch (error) {
          console.error("Error updating serve in Appwrite:", error);
          
          // Fall back to local storage
          localStorage.updateServe(updatedServe);
          setServes(serves.map(s => s.id === updatedServe.id ? updatedServe : s));
          
          toast({
            title: "Serve updated locally",
            description: "Connection to Appwrite failed, updated in local storage",
            variant: "destructive"
          });
          
          return true;
        }
      } else {
        // Update in local storage
        localStorage.updateServe(updatedServe);
        setServes(serves.map(s => s.id === updatedServe.id ? updatedServe : s));
        
        toast({
          title: "Serve record updated",
          description: "Serve attempt has been updated"
        });
        
        return true;
      }
    } catch (error) {
      console.error("Error updating serve:", error);
      
      toast({
        title: "Error updating serve",
        description: "Failed to update serve attempt",
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Handle navigation to new serve attempt for specific client and case
  const handleNewAttempt = (clientId: string, caseNumber: string, previousAttempts: number) => {
    navigate(`/new-serve?clientId=${clientId}&caseNumber=${caseNumber}`);
  };

  // Add utility to create localStorage.ts file for local storage operations:
  return (
    <>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/" element={<Layout isLoading={isLoading} activeBackend={ACTIVE_BACKEND} />}>
          <Route 
            index 
            element={
              <Dashboard 
                clients={clients} 
                serves={serves} 
              />
            } 
          />
          <Route 
            path="clients" 
            element={
              <Clients 
                clients={clients} 
                setSelectedClient={(id) => navigate(`/clients/${id}`)} 
              />
            } 
          />
          <Route 
            path="clients/new" 
            element={
              <NewClient 
                addClient={addClient} 
              />
            } 
          />
          <Route 
            path="clients/:id" 
            element={
              <ClientDetail 
                clients={clients}
                serves={serves}
                addServe={addServe}
              />
            } 
          />
          <Route 
            path="clients/:id/edit" 
            element={
              <EditClient 
                clients={clients}
                updateClient={updateClient}
              />
            } 
          />
          <Route 
            path="history" 
            element={
              <History 
                serves={serves} 
                clients={clients}
                deleteServe={deleteServe}
                updateServe={updateServe}
              />
            } 
          />
          <Route 
            path="new-serve" 
            element={
              <NewServe 
                clients={clients} 
                addServe={addServe}
              />
            } 
          />
          <Route 
            path="export" 
            element={
              <Export />
            } 
          />
          <Route 
            path="settings" 
            element={
              <Settings 
                reloadData={loadData}
              />
            } 
          />
          <Route 
            path="*" 
            element={
              <div className="text-center py-10">
                <h1 className="text-xl font-bold mb-4">Page Not Found</h1>
                <p className="mb-4">Sorry, the page you're looking for doesn't exist.</p>
                <button 
                  onClick={() => navigate("/")}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
                >
                  Return to Dashboard
                </button>
              </div>
            } 
          />
        </Route>
        <Route path="/migration" element={<div>Redirecting...</div>} />
      </Routes>
    </>
  );
}

export default App;
