import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { PlusCircle, Briefcase, FileText } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ClientDocuments from "./ClientDocuments";
import * as appwriteStorage from "@/utils/appwriteStorage";
import { appwrite } from "@/lib/appwrite";
import { useIsMobile } from "@/hooks/use-mobile";
import ResponsiveDialog from "./ResponsiveDialog";

interface ClientCasesProps {
  clientId: string;
  clientName?: string;
}

export default function ClientCases({ clientId, clientName }: ClientCasesProps) {
  const [activeTab, setActiveTab] = useState<string>("cases");
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addCaseDialogOpen, setAddCaseDialogOpen] = useState(false);
  const [caseNumber, setCaseNumber] = useState("");
  const [caseName, setCaseName] = useState("");
  const [courtName, setCourtName] = useState("");
  const [caseNotes, setCaseNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    const loadCases = async () => {
      setIsLoading(true);
      try {
        const clientCases = await appwriteStorage.getClientCases(clientId);
        setCases(clientCases);
      } catch (error) {
        console.error("Error loading cases:", error);
        toast({
          title: "Error loading cases",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      loadCases();
    }
  }, [clientId, toast]);

  const handleAddCase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!caseNumber) {
      toast({
        title: "Missing information",
        description: "Case number is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newCase = {
        clientId,
        caseNumber,
        caseName: caseName || undefined,
        courtName: courtName || undefined,
        notes: caseNotes || undefined,
      };
      
      const result = await appwrite.createClientCase(newCase);
      
      if (result) {
        setCases([...cases, {...newCase, id: result.$id}]);
        
        setAddCaseDialogOpen(false);
        setCaseNumber("");
        setCaseName("");
        setCourtName("");
        setCaseNotes("");
        
        toast({
          title: "Case added",
          description: "New case has been added successfully",
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Error adding case:", error);
      toast({
        title: "Error adding case",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <TabsList className="h-auto">
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <ResponsiveDialog
          open={addCaseDialogOpen}
          onOpenChange={setAddCaseDialogOpen}
          trigger={
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Case
            </Button>
          }
          title="Add New Case"
          description={`Add a new case for ${clientName}`}
        >
          <form onSubmit={handleAddCase} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="caseNumber">Case Number</Label>
              <Input
                id="caseNumber"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="caseName">Case Name (Optional)</Label>
              <Input
                id="caseName"
                value={caseName}
                onChange={(e) => setCaseName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="courtName">Court Name (Optional)</Label>
              <Input
                id="courtName"
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="caseNotes">Notes (Optional)</Label>
              <Textarea
                id="caseNotes"
                value={caseNotes}
                onChange={(e) => setCaseNotes(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddCaseDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Case"}
              </Button>
            </div>
          </form>
        </ResponsiveDialog>
      </div>
      
      <TabsContent value="cases" className="mt-0">
        <Card className="neo-card">
          <CardHeader>
            <CardTitle>Client Cases</CardTitle>
            <CardDescription>
              Manage cases associated with this client
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                Loading cases...
              </div>
            ) : cases.length === 0 ? (
              <div className="text-center py-8">
                No cases added yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cases.map((caseItem) => (
                  <Card key={caseItem.caseNumber} className="neo-card">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2" />
                        {caseItem.caseName ? `${caseItem.caseNumber} - ${caseItem.caseName}` : caseItem.caseNumber}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Court: {caseItem.courtName || "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Notes: {caseItem.notes || "N/A"}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="documents" className="mt-0">
        <ClientDocuments clientId={clientId} clientName={clientName} />
      </TabsContent>
    </Tabs>
  );
}
