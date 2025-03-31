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

  const loadData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const connectionStatus = await checkBackendConnection();
      console.log(`Backend connection status: ${connectionStatus.connected ? "Connected" : "Disconnected"} to ${connectionStatus.provider}`);
      
      if (shouldUseFallbackStorage() || ACTIVE_BACKEND === BACKEND_PROVIDER.LOCAL) {
        console.log("Loading from local storage");
        const localData = localStorage.getData();
        setClients(localData.clients || []);
        setServes(localData.serves || []);
      } 
      else if (ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE && connectionStatus.connected) {
        console.log("Loading data from Appwrite instead of local storage");
        
        try {
          const appwriteClients = await appwrite.getClients();
          const appwriteServes = await appwrite.getServeAttempts();
          
          console.log(`Loaded ${appwriteClients.length} clients and ${appwriteServes.length} serve attempts from Appwrite`);
          
          setClients(appwriteClients);
          setServes(appwriteServes);
          
          localStorage.saveData({
            clients: appwriteClients,
            serves: appwriteServes
          });
        } catch (error) {
          console.error("Error fetching data from Appwrite:", error);
          
          console.log("Falling back to local storage due to error");
          const localData = localStorage.getData();
          setClients(localData.clients || []);
          setServes(localData.serves || []);
          
          window.localStorage.setItem('useLocalStorageFallback', 'true');
        }
      } 
      else if (ACTIVE_BACKEND === BACKEND_PROVIDER.SUPABASE) {
        console.log("Supabase is no longer the primary backend, falling back to local storage");
        const localData = localStorage.getData();
        setClients(localData.clients || []);
        setServes(localData.serves || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      
      const localData = localStorage.getData();
      setClients(localData.clients || []);
      setServes(localData.serves || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    
    const syncInterval = setInterval(() => {
      console.log("Running periodic sync with Appwrite...");
      loadData();
    }, 5000);
    
    return () => clearInterval(syncInterval);
  }, [loadData]);

  const addClient = async (client: ClientData): Promise<boolean> => {
    try {
      const newClient = { ...client, id: client.id || `client-${uuidv4()}` };
      
      if (ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE && !shouldUseFallbackStorage()) {
        try {
          await appwrite.createClient(newClient);
          await loadData();
          
          toast({
            title: "Client added successfully",
            description: "New client has been created"
          });
          
          return true;
        } catch (error) {
          console.error("Error saving client to Appwrite:", error);
          
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

  const updateClient = async (updatedClient: ClientData): Promise<boolean> => {
    try {
      if (!updatedClient.id) {
        throw new Error("Client ID is missing");
      }
      
      if (ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE && !shouldUseFallbackStorage()) {
        try {
          await appwrite.updateClient(updatedClient);
          await loadData();
          
          toast({
            title: "Client updated successfully",
            description: "Client information has been updated"
          });
          
          return true;
        } catch (error) {
          console.error("Error updating client in Appwrite:", error);
          
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

  const addServe = async (serve: ServeAttemptData): Promise<boolean> => {
    try {
      const newServe: ServeAttemptData = {
        ...serve,
        id: serve.id || `serve-${uuidv4()}`,
        timestamp: serve.timestamp || new Date(),
      };
      
      if (ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE && !shouldUseFallbackStorage()) {
        try {
          await appwrite.createServeAttempt(newServe);
          await loadData();
          
          toast({
            title: "Serve record created",
            description: "New serve attempt has been recorded"
          });
          
          return true;
        } catch (error) {
          console.error("Error saving serve to Appwrite:", error);
          
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

  const deleteServe = async (id: string): Promise<boolean> => {
    try {
      if (ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE && !shouldUseFallbackStorage()) {
        try {
          await appwrite.deleteServeAttempt(id);
          await loadData();
          
          toast({
            title: "Serve record deleted",
            description: "Serve attempt has been removed"
          });
          
          return true;
        } catch (error) {
          console.error("Error deleting serve from Appwrite:", error);
          
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

  const updateServe = async (updatedServe: ServeAttemptData): Promise<boolean> => {
    try {
      if (!updatedServe.id) {
        throw new Error("Serve ID is missing");
      }
      
      if (ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE && !shouldUseFallbackStorage()) {
        try {
          await appwrite.updateServeAttempt(updatedServe);
          await loadData();
          
          toast({
            title: "Serve record updated",
            description: "Serve attempt has been updated"
          });
          
          return true;
        } catch (error) {
          console.error("Error updating serve in Appwrite:", error);
          
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

  const handleNewAttempt = (clientId: string, caseNumber: string, previousAttempts: number) => {
    navigate(`/new-serve?clientId=${clientId}&caseNumber=${caseNumber}`);
  };

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
                onSelectClient={(id) => navigate(`/clients/${id}`)} 
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
