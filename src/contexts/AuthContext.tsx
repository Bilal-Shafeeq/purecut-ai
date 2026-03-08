import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getFingerprint } from '@/lib/fingerprint';

interface User {
  email: string;
  name: string;
  isPaid: boolean;
  credits: number;
  plan: 'free' | 'paid';
}

interface AuthContextType {
  isLoggedIn: boolean;
  isPaidUser: boolean;
  user: User | null;
  login: (email: string, password: string, name?: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: (googleData: any) => Promise<void>;
  logout: () => void;
  upgradeToPaid: () => void;
  useCredit: () => boolean;
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
      setIsPaidUser(parsedUser.isPaid || parsedUser.plan === 'paid');
    }
  }, []);

  const handleAuthResponse = (data: any, loginType: 'google' | 'email') => {
    console.log('Auth response data:', data);
    
    // Assuming data contains user info or fallback to defaults
    const userData: User = {
      email: data.email || data.user?.email || "user@example.com",
      name: data.name || data.user?.name || "User",
      isPaid: data.isPaid || data.user?.isPaid || data.plan === 'paid' || false,
      credits: data.credits !== undefined ? data.credits : 3,
      plan: data.plan || (data.isPaid ? 'paid' : 'free')
    };
    
    setUser(userData);
    setIsLoggedIn(true);
    setIsPaidUser(userData.plan === 'paid');
    localStorage.setItem('purecut_user', JSON.stringify(userData));
  };

  const login = async (email: string, password: string, name: string = "User") => {
    try {
      const fingerprint = await getFingerprint();
      const response = await fetch(AUTH_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          name, 
          fingerprint, 
          login_type: 'email' 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed with status ${response.status}`);
      }
      
      const data = await response.json();
      handleAuthResponse(data, 'email');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const fingerprint = await getFingerprint();
      const response = await fetch(AUTH_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          name, 
          fingerprint, 
          login_type: 'email' 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Signup failed with status ${response.status}`);
      }
      
      const data = await response.json();
      handleAuthResponse(data, 'email');
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (googleData: any) => {
    try {
      const fingerprint = await getFingerprint();
      const response = await fetch(AUTH_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: googleData.email,
          name: googleData.name,
          fingerprint,
          login_type: 'google'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Google auth failed with status ${response.status}`);
      }
      
      const data = await response.json();
      handleAuthResponse(data, 'google');
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
      const updatedUser: User = { ...user, isPaid: true, plan: 'paid', credits: 999999 };
      setUser(updatedUser);
      localStorage.setItem('purecut_user', JSON.stringify(updatedUser));
    }
  };

  const useCredit = (): boolean => {
    if (!user) return false;
    if (user.plan === 'paid') return true;
    
    if (user.credits > 0) {
      const updatedUser = { ...user, credits: user.credits - 1 };
      setUser(updatedUser);
      localStorage.setItem('purecut_user', JSON.stringify(updatedUser));
      return true;
    }
    
    return false;
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
      upgradeToPaid,
      useCredit
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
