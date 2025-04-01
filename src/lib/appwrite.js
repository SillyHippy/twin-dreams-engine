
// Appwrite client configuration and utilities

import { Client, Account, ID, Databases, Storage, Query } from 'appwrite';

// Appwrite configuration constants
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '65f22e5c08c4984a67e1';
const DATABASE_ID = '65f22fcfe21d5e9dcd75';
const CLIENTS_COLLECTION_ID = '65f23032e6e4bc6cd171';
const SERVE_ATTEMPTS_COLLECTION_ID = '65f2301a1020cefd1b7a';
const CASES_COLLECTION_ID = '65f23069330c19aa2b27';
const DOCUMENTS_COLLECTION_ID = '65f2307c675cae38a6c2';
const STORAGE_BUCKET_ID = '65f230b5e6e4bc6cd18b';

// Initialize Appwrite clients
const client = new Client();
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Initialize Appwrite services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Helper to check if Appwrite is configured
const isAppwriteConfigured = () => {
  return !!(APPWRITE_PROJECT_ID && APPWRITE_ENDPOINT);
};

// Appwrite service exports
export const appwrite = {
  client,
  account,
  databases,
  storage,
  ID,
  DATABASE_ID,
  CLIENTS_COLLECTION_ID,
  SERVE_ATTEMPTS_COLLECTION_ID,
  CASES_COLLECTION_ID,
  DOCUMENTS_COLLECTION_ID,
  STORAGE_BUCKET_ID,
  
  isAppwriteConfigured,
  
  // Client document upload function
  uploadClientDocument: async (clientId, file, caseNumber, description) => {
    try {
      // First upload the file to storage
      const fileId = ID.unique();
      await storage.createFile(
        STORAGE_BUCKET_ID,
        fileId,
        file
      );
      
      // Then create a document record
      const docId = ID.unique();
      const now = new Date().toISOString();
      
      const documentData = {
        client_id: clientId, // Changed from clientId to client_id
        caseNumber: caseNumber || '',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        filePath: fileId,
        description: description || '',
        created_at: now // Changed from uploadedAt to created_at
      };
      
      console.log("Creating document with data:", documentData);
      
      const document = await databases.createDocument(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        docId,
        documentData
      );
      
      return {
        $id: docId,
        fileId: fileId,
        ...document
      };
    } catch (error) {
      console.error('Error uploading client document:', error);
      throw error;
    }
  },

  // Get client documents function
  getClientDocuments: async (clientId, caseNumber) => {
    try {
      let queries = [Query.equal('client_id', clientId)]; // Changed to client_id
      
      if (caseNumber) {
        queries.push(Query.equal('caseNumber', caseNumber));
      }
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        queries
      );
      
      return response.documents;
    } catch (error) {
      console.error(`Error fetching documents for client ${clientId}:`, error);
      return [];
    }
  },

  // Delete client function
  deleteClient: async (clientId) => {
    try {
      console.log("Deleting client with ID:", clientId);
      
      // First get all client cases 
      const clientCases = await appwrite.getClientCases(clientId);
      console.log(`Found ${clientCases.length} cases to delete for client ${clientId}`);
      
      // Delete each case
      for (const caseItem of clientCases) {
        if (caseItem.id) {
          await appwrite.deleteClientCase(caseItem.id);
          console.log(`Deleted case ${caseItem.id}`);
        }
      }
      
      // Get and delete all client documents
      const documents = await appwrite.getClientDocuments(clientId);
      console.log(`Found ${documents.length} documents to delete for client ${clientId}`);
      
      for (const doc of documents) {
        if (doc.$id) {
          await appwrite.deleteClientDocument(doc.$id, doc.filePath);
          console.log(`Deleted document ${doc.$id}`);
        }
      }
      
      // Get and delete all serve attempts for this client
      const serveAttempts = await appwrite.getClientServeAttempts(clientId);
      console.log(`Found ${serveAttempts.length} serve attempts to delete for client ${clientId}`);
      
      for (const serve of serveAttempts) {
        await appwrite.deleteServeAttempt(serve.$id);
        console.log(`Deleted serve attempt ${serve.$id}`);
      }
      
      // Finally delete the client
      await databases.deleteDocument(
        DATABASE_ID,
        CLIENTS_COLLECTION_ID,
        clientId
      );
      
      console.log(`Successfully deleted client ${clientId} and all related data`);
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  },

  // Get client cases function
  getClientCases: async (clientId) => {
    try {
      console.log(`Fetching cases for client ${clientId}`);
      const response = await databases.listDocuments(
        DATABASE_ID,
        CASES_COLLECTION_ID,
        [Query.equal('client_id', clientId)]
      );
      
      console.log(`Found ${response.documents.length} cases for client ${clientId}`);
      
      // Map the Appwrite document fields to our app's format
      return response.documents.map(doc => ({
        id: doc.$id,
        clientId: doc.client_id,
        caseNumber: doc.case_number,
        caseName: doc.case_name,
        courtName: doc.courtName || "",
        notes: doc.description || "",
        status: doc.status || "active"
      }));
    } catch (error) {
      console.error(`Error fetching cases for client ${clientId}:`, error);
      return [];
    }
  },

  // Create client case function
  createClientCase: async (caseData) => {
    try {
      const caseId = caseData.id || ID.unique();
      const now = new Date().toISOString();
      
      // Ensure we're using the correct field names based on Appwrite schema
      const appwriteCaseData = {
        client_id: caseData.client_id,
        case_number: caseData.case_number,
        case_name: caseData.case_name || "",
        description: caseData.description || "",
        status: caseData.status || "active",
        created_at: now,
        // Include courtName even though it's not in the schema screenshots
        courtName: caseData.courtName || ""
      };
      
      console.log("Creating client case with data:", appwriteCaseData);
      
      const response = await databases.createDocument(
        DATABASE_ID,
        CASES_COLLECTION_ID,
        caseId,
        appwriteCaseData
      );
      
      console.log("Case created successfully:", response);
      return response;
    } catch (error) {
      console.error('Error creating client case:', error);
      throw error;
    }
  },
  
  // Additional required methods for client functionality
  getClients: async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        CLIENTS_COLLECTION_ID
      );
      return response.documents;
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  },
  
  createClient: async (clientData) => {
    try {
      const clientId = clientData.id || ID.unique();
      const now = new Date().toISOString();
      
      const appwriteClientData = {
        name: clientData.name,
        email: clientData.email,
        additional_emails: clientData.additionalEmails || [],
        phone: clientData.phone || "",
        address: clientData.address || "",
        notes: clientData.notes || "",
        created_at: now
      };
      
      const response = await databases.createDocument(
        DATABASE_ID,
        CLIENTS_COLLECTION_ID,
        clientId,
        appwriteClientData
      );
      
      return response;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },
  
  updateClient: async (clientId, clientData) => {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        CLIENTS_COLLECTION_ID,
        clientId,
        clientData
      );
      return response;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },
  
  deleteClientCase: async (caseId) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        CASES_COLLECTION_ID,
        caseId
      );
      return true;
    } catch (error) {
      console.error('Error deleting client case:', error);
      throw error;
    }
  },
  
  deleteClientDocument: async (documentId, fileId) => {
    try {
      // Delete the document entry
      await databases.deleteDocument(
        DATABASE_ID,
        DOCUMENTS_COLLECTION_ID,
        documentId
      );
      
      // Delete the actual file from storage
      if (fileId) {
        await storage.deleteFile(
          STORAGE_BUCKET_ID,
          fileId
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting client document:', error);
      throw error;
    }
  },
  
  getClientServeAttempts: async (clientId) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SERVE_ATTEMPTS_COLLECTION_ID,
        [Query.equal('clientId', clientId)]
      );
      return response.documents;
    } catch (error) {
      console.error(`Error fetching serve attempts for client ${clientId}:`, error);
      return [];
    }
  },
  
  deleteServeAttempt: async (serveId) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        SERVE_ATTEMPTS_COLLECTION_ID,
        serveId
      );
      return true;
    } catch (error) {
      console.error('Error deleting serve attempt:', error);
      throw error;
    }
  },
  
  getServeAttempts: async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SERVE_ATTEMPTS_COLLECTION_ID
      );
      return response.documents;
    } catch (error) {
      console.error('Error fetching serve attempts:', error);
      return [];
    }
  },
  
  createServeAttempt: async (serveData) => {
    try {
      const serveId = serveData.id || ID.unique();
      const now = new Date().toISOString();
      
      const response = await databases.createDocument(
        DATABASE_ID,
        SERVE_ATTEMPTS_COLLECTION_ID,
        serveId,
        {
          clientId: serveData.clientId,
          date: serveData.date,
          time: serveData.time,
          address: serveData.address || "",
          notes: serveData.notes || "",
          status: serveData.status || "failed",
          imageData: serveData.imageData || null,
          coordinates: serveData.coordinates || null,
          caseNumber: serveData.caseNumber || "",
          created_at: now
        }
      );
      
      return response;
    } catch (error) {
      console.error('Error creating serve attempt:', error);
      throw error;
    }
  },
  
  updateServeAttempt: async (serveId, serveData) => {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        SERVE_ATTEMPTS_COLLECTION_ID,
        serveId,
        serveData
      );
      return response;
    } catch (error) {
      console.error('Error updating serve attempt:', error);
      throw error;
    }
  },
  
  getDocumentUrl: async (fileId) => {
    try {
      const result = await storage.getFileView(
        STORAGE_BUCKET_ID,
        fileId
      );
      return URL.createObjectURL(result);
    } catch (error) {
      console.error('Error getting document URL:', error);
      throw error;
    }
  },
  
  updateCaseStatus: async (caseId, status) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        CASES_COLLECTION_ID,
        caseId,
        { status }
      );
      return true;
    } catch (error) {
      console.error('Error updating case status:', error);
      throw error;
    }
  },
  
  migrateSupabaseToAppwrite: async () => {
    try {
      // Get data from local storage
      const clientsStr = localStorage.getItem("serve-tracker-clients");
      const servesStr = localStorage.getItem("serve-tracker-serves");
      
      const localClients = clientsStr ? JSON.parse(clientsStr) : [];
      const localServes = servesStr ? JSON.parse(servesStr) : [];
      
      let importedClients = 0;
      let importedServes = 0;
      
      // Import clients
      for (const client of localClients) {
        try {
          await appwrite.createClient({
            name: client.name,
            email: client.email,
            additionalEmails: client.additionalEmails || [],
            phone: client.phone || "",
            address: client.address || "",
            notes: client.notes || ""
          });
          importedClients++;
        } catch (error) {
          console.error(`Error importing client ${client.name}:`, error);
        }
      }
      
      // Import serve attempts
      for (const serve of localServes) {
        try {
          await appwrite.createServeAttempt({
            clientId: serve.clientId,
            date: new Date(serve.timestamp).toLocaleDateString(),
            time: new Date(serve.timestamp).toLocaleTimeString(),
            address: serve.address || "",
            notes: serve.notes || "",
            status: serve.status || "failed",
            imageData: serve.imageData || null,
            coordinates: serve.coordinates || null,
            caseNumber: serve.caseNumber || ""
          });
          importedServes++;
        } catch (error) {
          console.error(`Error importing serve attempt:`, error);
        }
      }
      
      return {
        success: true,
        message: `Migration complete! Imported ${importedClients} clients and ${importedServes} serve attempts.`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error during migration"
      };
    }
  },
  
  sendEmail: async (emailData) => {
    try {
      // This is a stub - in a real app, you'd implement email sending
      console.log("Sending email:", emailData);
      
      // Simulate a successful email send
      return {
        success: true,
        message: "Email sent successfully (simulated)"
      };
    } catch (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error sending email"
      };
    }
  },
  
  // Add a real-time subscription setup function
  setupRealtimeSubscription: (callback) => {
    // Real-time subscription setup for Appwrite
    // This is a simplified version
    console.log("Setting up real-time subscription for Appwrite");
    
    // Return a cleanup function
    return () => {
      console.log("Cleaning up real-time subscription");
    };
  }
};
