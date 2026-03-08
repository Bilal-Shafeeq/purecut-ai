import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AuthModal from "@/components/AuthModal";

const History = () => {
  const { isPaidUser, isLoggedIn } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const handleLoginClick = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleRegisterClick = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
        <div className="flex-grow container mx-auto px-4 max-w-4xl flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Please Log In</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to view your history.
          </p>
          <div className="flex gap-4">
            <Button variant="cta" size="lg" onClick={handleLoginClick}>Log In</Button>
            <Button variant="outline" size="lg" onClick={handleRegisterClick}>Sign Up</Button>
          </div>
        </div>
        <Footer />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          initialMode={authModalMode}
        />
      </div>
    );
  }

  if (!isPaidUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
        <div className="flex-grow container mx-auto px-4 max-w-4xl flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            Image history is a premium feature. Please upgrade to a paid plan to view your history.
          </p>
          <Link to="/pricing">
            <Button variant="cta" size="lg">Upgrade to Paid</Button>
          </Link>
        </div>
        <Footer />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          initialMode={authModalMode}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
      <div className="flex-grow container mx-auto px-4 max-w-4xl py-16">
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-8 text-center">Image History</h1>
        <p className="text-muted-foreground text-center">
          This is a placeholder for your image history. Here you will see all your processed images.
        </p>
        {/* Placeholder for history items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-lg p-4 flex flex-col items-center justify-center h-48">
              <p className="text-muted-foreground">Image {i + 1}</p>
              <p className="text-sm text-muted-foreground">Processed on: 2026-03-07</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authModalMode}
      />
    </div>
  );
};

export default History;