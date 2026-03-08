import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getFingerprint } from '@/lib/fingerprint';

interface User {
  email: string;
  name: string;
  isPaid: boolean;
  credits: number;
  plan: 'free' | 'paid';
}

type AuthResponse = {
  email?: string;
  name?: string;
  isPaid?: boolean;
  credits?: number;
  plan?: 'free' | 'paid';
  user?: {
    email?: string;
    name?: string;
    isPaid?: boolean;
    plan?: 'free' | 'paid';
  };
};

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

  const handleAuthResponse = (data: AuthResponse | null, fallback: { email?: string; name?: string }) => {
    const resolvedEmail = data?.email || data?.user?.email || fallback.email || "user@example.com";
    const resolvedName = data?.name || data?.user?.name || fallback.name || "User";
    const resolvedIsPaid = data?.isPaid || data?.user?.isPaid || data?.plan === 'paid' || false;
    const resolvedPlan = data?.plan || (resolvedIsPaid ? 'paid' : 'free');
    const resolvedCredits = data?.credits !== undefined ? data.credits : 3;

    const userData: User = {
      email: resolvedEmail,
      name: resolvedName,
      isPaid: resolvedIsPaid,
      credits: resolvedCredits,
      plan: resolvedPlan
    };

    setUser(userData);
    setIsLoggedIn(true);
    setIsPaidUser(userData.plan === 'paid');
    localStorage.setItem('purecut_user', JSON.stringify(userData));
  };

  const parseJsonResponse = async (response: Response): Promise<AuthResponse | null> => {
    const text = await response.text();
    if (!text) return null;
    try {
      const parsed = JSON.parse(text);
      return typeof parsed === 'object' && parsed ? (parsed as AuthResponse) : null;
    } catch {
      return null;
    }
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
      
      const data = await parseJsonResponse(response);
      handleAuthResponse(data, { email, name });
    } catch (error: unknown) {
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
      
      const data = await parseJsonResponse(response);
      handleAuthResponse(data, { email, name });
    } catch (error: unknown) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (googleData: { email?: string; name?: string; sub?: string }) => {
    try {
      const fingerprint = await getFingerprint();
      const response = await fetch(AUTH_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: googleData.email,
          name: googleData.name,
          sub: googleData.sub,
          google_id: googleData.sub,
          fingerprint,
          login_type: 'google'
        }),
      });

      if (!response.ok) {
        const errorData = await parseJsonResponse(response);
        const message = errorData && 'message' in errorData ? String((errorData as { message?: string }).message) : '';
        throw new Error(message || `Google auth failed with status ${response.status}`);
      }
      
      const data = await parseJsonResponse(response);
      handleAuthResponse(data, { email: googleData.email, name: googleData.name });
    } catch (error: unknown) {
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
