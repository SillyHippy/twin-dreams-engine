
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, Users, Clock, File, Settings, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, className }) => {
  const location = useLocation();
  const path = location.pathname;

  const links = [
    { to: "/", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
    { to: "/clients", icon: <Users className="h-5 w-5" />, label: "Clients" },
    { to: "/history", icon: <Clock className="h-5 w-5" />, label: "History" },
    { to: "/export", icon: <File className="h-5 w-5" />, label: "Export" },
    { to: "/settings", icon: <Settings className="h-5 w-5" />, label: "Settings" },
  ];

  return (
    <aside
      className={cn(
        "bg-background border-r border-border h-screen w-64 flex flex-col",
        className
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <Link to="/" className="font-semibold text-lg">
          Serve Tracker
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onToggle}
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {links.map((link) => (
            <Button
              key={link.to}
              variant={path === link.to ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link to={link.to}>
                {link.icon}
                <span className="ml-3">{link.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </nav>
    </aside>
  );
};
