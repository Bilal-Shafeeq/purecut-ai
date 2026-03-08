import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx'); // Replace with your actual public key

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { upgradeToPaid, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in or sign up before making a payment.",
      });
      navigate('/login');
    }
  }, [isLoggedIn, navigate, toast]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in before making a payment.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setLoading(true);

    // Placeholder for actual payment intent creation on backend
    // For now, we'll simulate success
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement)!,
      billing_details: {
        name: name,
      },
    });

    if (error) {
      console.error('[Stripe error]', error);
      toast({
        title: "Payment failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      setLoading(false);
    } else {
      console.log('[PaymentMethod]', paymentMethod);
      // Simulate successful payment
      upgradeToPaid();
      toast({
        title: "Payment successful!",
        description: "You now have unlimited access to PureCut AI.",
      });
      navigate('/tool'); // Redirect to tool after successful payment
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Cardholder Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label>Card Details</Label>
        <div className="mt-1 p-3 border border-input rounded-md bg-background">
          <CardElement options={{ style: { base: { color: 'hsl(var(--foreground))' } } }} />
        </div>
      </div>
      <Button type="submit" variant="cta" className="w-full" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay $20 for 1 Year'}
      </Button>
    </form>
  );
};

const Payment = () => {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
      <div className="flex-grow container mx-auto px-4 max-w-2xl py-16">
        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-3xl font-bold font-display mb-2 text-center">Upgrade to Paid</h1>
          <p className="text-muted-foreground mb-8 text-center">Get unlimited HD background removals for 1 year.</p>
          <Elements stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
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

export default Payment;