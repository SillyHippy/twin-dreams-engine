
// Fix the part where we handle client document uploads properly to match Appwrite's schema
const uploadClientDocument = async (clientId, file, caseNumber, description) => {
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

// Fix the getClientDocuments function to properly work with Appwrite field naming
const getClientDocuments = async (clientId, caseNumber) => {
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

// Fix deleteClient to remove all related data correctly
const deleteClient = async (clientId) => {
  try {
    console.log("Deleting client with ID:", clientId);
    
    // First get all client cases 
    const clientCases = await this.getClientCases(clientId);
    console.log(`Found ${clientCases.length} cases to delete for client ${clientId}`);
    
    // Delete each case
    for (const caseItem of clientCases) {
      if (caseItem.id) {
        await this.deleteClientCase(caseItem.id);
        console.log(`Deleted case ${caseItem.id}`);
      }
    }
    
    // Get and delete all client documents
    const documents = await this.getClientDocuments(clientId);
    console.log(`Found ${documents.length} documents to delete for client ${clientId}`);
    
    for (const doc of documents) {
      if (doc.$id) {
        await this.deleteClientDocument(doc.$id, doc.filePath);
        console.log(`Deleted document ${doc.$id}`);
      }
    }
    
    // Get and delete all serve attempts for this client
    const serveAttempts = await this.getClientServeAttempts(clientId);
    console.log(`Found ${serveAttempts.length} serve attempts to delete for client ${clientId}`);
    
    for (const serve of serveAttempts) {
      await this.deleteServeAttempt(serve.$id);
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

// Fix getClientCases function to properly query Appwrite with client_id
const getClientCases = async (clientId) => {
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

// Fix createClientCase function to use correct field names
const createClientCase = async (caseData) => {
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
}
