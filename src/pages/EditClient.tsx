
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClientForm, { ClientData } from "@/components/ClientForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EditClientProps {
  clients: ClientData[];
  updateClient: (client: ClientData) => Promise<boolean>;
}

const EditClient: React.FC<EditClientProps> = ({ clients, updateClient }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientData | null>(null);

  useEffect(() => {
    if (id && clients.length > 0) {
      const foundClient = clients.find(c => c.id === id);
      if (foundClient) {
        setClient(foundClient);
      }
    }
  }, [id, clients]);

  const handleSubmit = async (data: ClientData) => {
    if (id) {
      const updatedClient = { ...data, id };
      const success = await updateClient(updatedClient);
      if (success) {
        navigate(`/clients/${id}`);
      }
    }
  };

  if (!client) {
    return (
      <div className="page-container">
        <Button variant="ghost" onClick={() => navigate("/clients")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p>Client not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-2"
          onClick={() => navigate(`/clients/${id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Client</h1>
        <p className="text-muted-foreground">
          Update client information
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <ClientForm onSubmit={handleSubmit} initialData={client} />
      </div>
    </div>
  );
};

export default EditClient;
