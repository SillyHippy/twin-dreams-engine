
import { appwrite } from "@/lib/appwrite";
import { toast } from "@/hooks/use-toast";

export const migrateSupabaseToAppwrite = async () => {
  try {
    // This utility would help users migrate their remaining Supabase data
    // This is a placeholder function that your migration page might use
    
    // 1. Get data from local storage first (if available)
    const clientsStr = localStorage.getItem("serve-tracker-clients");
    const servesStr = localStorage.getItem("serve-tracker-serves");
    
    const localClients = clientsStr ? JSON.parse(clientsStr) : [];
    const localServes = servesStr ? JSON.parse(servesStr) : [];
    
    // 2. Migrate clients to Appwrite
    const migratedClients = [];
    for (const client of localClients) {
      try {
        // Format client data to match Appwrite schema
        const formattedClient = {
          name: client.name,
          email: client.email,
          additional_emails: client.additionalEmails || [],
          phone: client.phone,
          address: client.address,
          notes: client.notes || ""
        };
        
        await appwrite.createClient(formattedClient);
        migratedClients.push(client);
      } catch (error) {
        console.error(`Error migrating client ${client.id}:`, error);
      }
    }
    
    // 3. Migrate serves to Appwrite
    const migratedServes = [];
    for (const serve of localServes) {
      try {
        await appwrite.createServeAttempt({
          clientId: serve.clientId,
          date: serve.timestamp ? new Date(serve.timestamp).toLocaleDateString() : new Date().toLocaleDateString(),
          time: serve.timestamp ? new Date(serve.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
          address: serve.address || "",
          notes: serve.notes || "",
          status: serve.status || "attempted",
          imageData: serve.imageData || null,
          coordinates: serve.coordinates || null
        });
        migratedServes.push(serve);
      } catch (error) {
        console.error(`Error migrating serve ${serve.id}:`, error);
      }
    }
    
    toast({
      title: "Migration complete",
      description: `Migrated ${migratedClients.length} clients and ${migratedServes.length} serve attempts`
    });
    
    return {
      success: true,
      clientsCount: migratedClients.length,
      servesCount: migratedServes.length
    };
  } catch (error) {
    console.error("Error during migration:", error);
    toast({
      title: "Migration failed",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive"
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
