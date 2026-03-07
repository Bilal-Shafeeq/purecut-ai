import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  email: string;
  isPaid: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isPaidUser: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  upgradeToPaid: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_WEBHOOK_URL = "https://bilal000.app.n8n.cloud/webhook/signup";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isPaidUser, setIsPaidUser] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Load auth state from localStorage on init
  useEffect(() => {
    const savedUser = localStorage.getItem('purecut_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsLoggedIn(true);
      setIsPaidUser(parsedUser.isPaid || false);
    }
  }, []);

  const handleAuthResponse = (data: any) => {
    if (!data) throw new Error("No response data from server");
    
    // Assuming data contains user info and paid status
    const userData = {
      email: data.email || data.user?.email || "user@example.com",
      isPaid: data.isPaid || data.user?.isPaid || false
    };
    setUser(userData);
    setIsLoggedIn(true);
    setIsPaidUser(userData.isPaid);
    localStorage.setItem('purecut_user', JSON.stringify(userData));
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(AUTH_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, action: 'login' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed with status ${response.status}`);
      }
      
      const data = await response.json();
      handleAuthResponse(data);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const response = await fetch(AUTH_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, action: 'signup' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Signup failed with status ${response.status}`);
      }
      
      const data = await response.json();
      handleAuthResponse(data);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const response = await fetch(AUTH_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'google' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Google auth failed with status ${response.status}`);
      }
      
      const data = await response.json();
      handleAuthResponse(data);
    } catch (error: any) {
      console.error('Google auth error:', error);
      throw error;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsPaidUser(false);
    setUser(null);
    localStorage.removeItem('purecut_user');
  };

  const upgradeToPaid = () => {
    setIsPaidUser(true);
    if (user) {
      const updatedUser = { ...user, isPaid: true };
      setUser(updatedUser);
      localStorage.setItem('purecut_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      isPaidUser, 
      user, 
      login, 
      signup, 
      loginWithGoogle, 
      logout, 
      upgradeToPaid 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
