import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type GoogleCredentialResponse = {
  credential: string;
  select_by?: string;
};

type GoogleAccountsId = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: string;
      size?: string;
      width?: number | string;
      text?: string;
      shape?: string;
      logo_alignment?: string;
      type?: string;
    }
  ) => void;
  disableAutoSelect?: () => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
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
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '105591471710-dq847b4jog5rcm7agqnua6fk29ae00lk.apps.googleusercontent.com';

    const loadGoogleScript = () =>
      new Promise<void>((resolve, reject) => {
        if (window.google?.accounts?.id) {
          resolve();
          return;
        }

        const existingScript = document.querySelector<HTMLScriptElement>(
          'script[data-google-gsi]'
        );
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve(), { once: true });
          existingScript.addEventListener('error', () => reject(), { once: true });
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.setAttribute('data-google-gsi', 'true');
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.head.appendChild(script);
      });

    const renderGoogleButton = () => {
      const googleId = window.google?.accounts?.id;
      const container = googleButtonRef.current;
      if (!googleId || !container) return;
      const width = Math.max(240, Math.floor(container.clientWidth || 0));
      container.innerHTML = '';
      googleId.renderButton(container, {
        theme: 'outline',
        size: 'large',
        width: width,
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
        type: 'standard',
      });
    };

    const initializeGoogleSignIn = () => {
      const googleId = window.google?.accounts?.id;
      if (!googleId) return;
      googleId.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      googleId.disableAutoSelect?.();
      renderGoogleButton();
    };

    const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
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
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An error occurred during Google Sign-In.";
        toast({
          title: "Google Login Failed",
          description: message,
          variant: "destructive"
        });
      }
    };

    let resizeObserver: ResizeObserver | null = null;

    loadGoogleScript()
      .then(() => {
        initializeGoogleSignIn();
        if (googleButtonRef.current && 'ResizeObserver' in window) {
          resizeObserver = new ResizeObserver(() => renderGoogleButton());
          resizeObserver.observe(googleButtonRef.current);
        }
      })
      .catch(() => {
        toast({
          title: "Google Script Load Failed",
          description: "Please refresh and try again.",
          variant: "destructive",
        });
      });

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [loginWithGoogle, toast, onSuccess]);

  return <div ref={googleButtonRef} className="w-full" />;
};

export default GoogleLogin;
