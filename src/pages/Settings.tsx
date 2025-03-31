
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import { ACTIVE_BACKEND, BACKEND_PROVIDER } from "@/config/backendConfig";
import { getBackendInfo } from "@/utils/backendHelpers";
import { toast } from "sonner";
import { appwrite } from "@/lib/appwrite";

interface SettingsProps {
  reloadData: () => Promise<void>;
}

const Settings: React.FC<SettingsProps> = ({ reloadData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const backendInfo = getBackendInfo();
  const isAppwrite = ACTIVE_BACKEND === BACKEND_PROVIDER.APPWRITE;
  const isLocal = ACTIVE_BACKEND === BACKEND_PROVIDER.LOCAL;

  const handleSyncData = async () => {
    setIsLoading(true);
    try {
      await reloadData();
      toast.success("Data synchronized successfully");
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to synchronize data", {
        description: "Please check your connection and try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLocalData = () => {
    if (window.confirm("Are you sure? This will delete all local data.")) {
      localStorage.removeItem("serve-tracker-clients");
      localStorage.removeItem("serve-tracker-serves");
      toast.success("Local data cleared", {
        description: "All locally stored data has been removed"
      });
    }
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure application settings and manage data
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme-mode" className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
                <Switch id="theme-mode" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backend Provider</CardTitle>
              <CardDescription>
                Current backend: <span className="font-medium">{backendInfo.name}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                To change backend providers, update the ACTIVE_BACKEND variable in the configuration file.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Synchronization</CardTitle>
              <CardDescription>
                Manage your application data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Sync with {isAppwrite ? "Appwrite" : "Local Storage"}</h3>
                  <p className="text-sm text-muted-foreground">
                    Refresh data from the backend
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleSyncData} 
                  disabled={isLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Sync Now
                </Button>
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <div>
                  <h3 className="font-medium">Clear Local Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Delete all locally stored data
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleClearLocalData}
                >
                  Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
