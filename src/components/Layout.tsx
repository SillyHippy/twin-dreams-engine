
import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { cn } from "@/lib/utils";
import { getBackendInfo } from "@/utils/backendHelpers";
import { Toaster } from "sonner";

interface LayoutProps {
  className?: string;
  isLoading?: boolean;
  activeBackend?: string;
}

const Layout: React.FC<LayoutProps> = ({ className, isLoading, activeBackend }) => {
  const location = useLocation();
  const backendInfo = getBackendInfo();
  
  // Set CSS variables for mobile viewport height
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    
    // Set initial height
    setAppHeight();
    
    // Update on resize and orientation change
    window.addEventListener('resize', setAppHeight);
    window.addEventListener('orientationchange', setAppHeight);
    
    return () => {
      window.removeEventListener('resize', setAppHeight);
      window.removeEventListener('orientationchange', setAppHeight);
    };
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading application...</p>
          <p className="text-sm text-muted-foreground mt-2">Connecting to {backendInfo.name}</p>
        </div>
        <Toaster position="bottom-right" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main 
        className={cn(
          "flex-1 page-transition page-container pb-12 overflow-x-hidden overflow-y-auto overscroll-contain", 
          className
        )}
        style={{ 
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          height: 'var(--app-height, 100dvh)',
          maxHeight: 'calc(var(--app-height, 100dvh) - 56px)',
          transform: 'translate3d(0,0,0)',
          WebkitTransform: 'translate3d(0,0,0)',
          width: '100%',
          maxWidth: '100%'
        }}
      >
        <div className={`mb-1 text-xs px-2 py-1 inline-flex items-center gap-1 rounded-full ${backendInfo.color} text-white absolute top-2 right-2 z-10`}>
          <span>{backendInfo.icon}</span>
          <span>{backendInfo.name}</span>
        </div>
        <Outlet />
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default Layout;
