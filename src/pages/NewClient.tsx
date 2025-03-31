
import React from "react";
import { useNavigate } from "react-router-dom";
import ClientForm, { ClientData } from "@/components/ClientForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface NewClientProps {
  addClient: (client: ClientData) => Promise<boolean>;
}

const NewClient: React.FC<NewClientProps> = ({ addClient }) => {
  const navigate = useNavigate();

  const handleSubmit = async (data: ClientData) => {
    const success = await addClient(data);
    if (success) {
      navigate("/clients");
    }
  };

  return (
    <div className="page-container">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-2"
          onClick={() => navigate("/clients")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Add New Client</h1>
        <p className="text-muted-foreground">
          Create a new client record with their contact information
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <ClientForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default NewClient;
