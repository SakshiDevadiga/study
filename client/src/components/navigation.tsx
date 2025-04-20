import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navigation() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/groups", label: "Groups" },
    { path: "/meetings", label: "Meetings" },
    { path: "/notes", label: "Notes" },
    { path: "/chat", label: "Chat" }
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <a className="text-primary text-2xl font-bold">StudyMate</a>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location === link.path 
                    ? 'text-primary font-semibold' 
                    : 'text-gray-700 hover:text-primary'
                }`}>
                  {link.label}
                </a>
              </Link>
            ))}
          </nav>
          
          <div className="hidden md:block">
            {user ? (
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-primary text-primary hover:bg-primary/10"
              >
                Logout
              </Button>
            ) : (
              <Link href="/auth">
                <Button className="bg-primary hover:bg-primary/90">
                  Log In
                </Button>
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {navLinks.map((link) => (
                    <Link key={link.path} href={link.path}>
                      <a 
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                          location === link.path 
                            ? 'text-primary font-semibold' 
                            : 'text-gray-700 hover:text-primary'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </a>
                    </Link>
                  ))}
                  
                  {user ? (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full justify-start mt-4 border-primary text-primary hover:bg-primary/10"
                    >
                      Logout
                    </Button>
                  ) : (
                    <Link href="/auth">
                      <Button 
                        className="w-full mt-4 bg-primary hover:bg-primary/90"
                        onClick={() => setIsOpen(false)}
                      >
                        Log In
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
