
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClientDetailComponent from "@/components/ClientDetail";
import { ClientData } from "@/components/ClientForm";
import { ServeAttemptData } from "@/components/ServeAttempt";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ClientDetailProps {
  clients: ClientData[];
  serves: ServeAttemptData[];
  addServe: (serve: ServeAttemptData) => Promise<boolean>;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ clients, serves, addServe }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientData | null>(null);
  const [clientServes, setClientServes] = useState<ServeAttemptData[]>([]);
  
  useEffect(() => {
    if (id && clients.length > 0) {
      const foundClient = clients.find(c => c.id === id);
      if (foundClient) {
        setClient(foundClient);
        const relevantServes = serves.filter(serve => serve.clientId === id);
        setClientServes(relevantServes);
      }
    }
  }, [id, clients, serves]);

  const handleUpdateClient = (updatedClient: ClientData) => {
    setClient(updatedClient);
  };

  const handleBackClick = () => {
    navigate("/clients");
  };

  if (!client) {
    return (
      <div className="page-container">
        <Button variant="ghost" onClick={handleBackClick}>
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
      <ClientDetailComponent 
        client={client} 
        onUpdate={handleUpdateClient}
        onBack={handleBackClick}
      />
    </div>
  );
};

export default ClientDetail;
