import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true); // true for login, false for signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, upgradeToPaid, loginWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast({ title: "Logged in with Google!", description: "Welcome back." });
      onClose();
    } catch (error: any) {
      toast({ 
        title: "Google login failed", 
        description: error.message || "Could not authenticate with Google.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast({ title: "Logged in successfully!", description: "Welcome back." });
      } else {
        await signup(email, password);
        toast({ title: "Signed up successfully!", description: "Welcome to PureCut AI." });
      }
      onClose();
    } catch (error: any) {
      toast({ 
        title: isLogin ? "Login failed" : "Signup failed", 
        description: error.message || "Please check your credentials and try again.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] glass-card w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{isLogin ? "Log In" : "Sign Up"}</DialogTitle>
          <DialogDescription>
            {isLogin ? "Enter your credentials to access your account." : "Create a new account to get started."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAuth} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button type="submit" variant="cta" className="w-full h-11" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isLogin ? "Log In" : "Sign Up"}
            </Button>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-3 h-11"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />}
              {isLogin ? "Log In with Google" : "Sign Up with Google"}
            </Button>
          </div>

          <div className="space-y-2 text-center pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-sm hover:bg-transparent hover:text-primary"
              disabled={loading}
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </Button>
            
            {isLogin && (
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  upgradeToPaid();
                  toast({ title: "Upgraded to Paid!", description: "Enjoy unlimited features." });
                  onClose();
                }}
                className="w-full text-xs text-muted-foreground hover:text-primary"
                disabled={loading}
              >
                Simulate Upgrade to Paid
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
