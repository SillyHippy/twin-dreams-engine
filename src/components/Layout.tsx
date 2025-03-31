
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { toast } from "sonner";
import { ThemeProvider } from "./theme-provider";
import { ReloadIcon } from "@/components/ui/icons";
import { Loader2 } from "lucide-react";
import { BACKEND_PROVIDER } from "@/config/backendConfig";
import { getBackendInfo } from "@/utils/backendHelpers";

interface LayoutProps {
  isLoading?: boolean;
  activeBackend?: string;
}

const Layout: React.FC<LayoutProps> = ({ isLoading = false, activeBackend }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const backendInfo = getBackendInfo();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="serve-tracker-theme">
      <div className="flex min-h-screen bg-background">
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebar}
          className="hidden md:block"
        />
        <div className="flex-1 overflow-x-hidden">
          <Navbar onMenuClick={toggleSidebar} />
          <main className="pb-16 pt-20 bg-white dark:bg-slate-900 min-h-screen">
            {isLoading ? (
              <div className="flex items-center justify-center h-[80vh]">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="mt-2 text-muted-foreground">Loading...</p>
                </div>
              </div>
            ) : (
              <div className="px-4 md:px-6">
                <Outlet />
                {activeBackend && (
                  <div className="fixed bottom-4 right-4 text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${backendInfo.color}`}></span>
                    <span className="opacity-70">
                      {backendInfo.icon} {backendInfo.name}
                    </span>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        {/* Mobile sidebar (shown on small screens) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={toggleSidebar}
          >
            <Sidebar 
              isOpen={sidebarOpen} 
              onToggle={toggleSidebar}
              className="absolute w-3/4 max-w-xs h-full"
            />
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default Layout;
