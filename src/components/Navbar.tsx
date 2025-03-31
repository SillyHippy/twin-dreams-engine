
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <header className="fixed top-0 z-40 w-full bg-background border-b border-border">
      <div className="container h-16 flex items-center px-4 sm:px-6">
        <Button
          variant="ghost"
          className="mr-4 md:hidden"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="mr-4">
          <Link to="/" className="font-semibold text-lg">
            Serve Tracker
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-4 ml-auto">
          <Button variant="ghost" asChild>
            <Link to="/">Dashboard</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/clients">Clients</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/history">History</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};
