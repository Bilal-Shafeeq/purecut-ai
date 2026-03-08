import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleLoginProps {
  onSuccess: () => void;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onSuccess }) => {
  const { loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '105591471710-dq847b4jog5rcm7agqnua6fk29ae00lk.apps.googleusercontent.com', // Aapki Client ID yahan directly set ki gayi hai
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          { theme: 'outline', size: 'large', width: '300px' }
        );
      }
    };

    const handleCredentialResponse = async (response: any) => {
      try {
        // Decode the JWT token to get user info
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const googleUser = JSON.parse(jsonPayload);
        
        await loginWithGoogle({
          email: googleUser.email,
          name: googleUser.name,
          sub: googleUser.sub,
        });

        toast({ title: "Logged in with Google!", description: `Welcome back, ${googleUser.name}.` });
        onSuccess();
      } catch (error: any) {
        toast({
          title: "Google Login Failed",
          description: error.message || "An error occurred during Google Sign-In.",
          variant: "destructive"
        });
      }
    };

    // Check if google script is loaded
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initializeGoogleSignIn();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [loginWithGoogle, toast, onSuccess]);

  return <div ref={googleButtonRef} className="w-full" />;
};

export default GoogleLogin;
