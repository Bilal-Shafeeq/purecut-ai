import React, { useState } from 'react';
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

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx'); // Replace with your actual public key

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { upgradeToPaid } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

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
      navigate('/'); // Redirect to home after successful payment
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
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onLoginClick={() => {}} onRegisterClick={() => {}} />
      <div className="flex-grow container mx-auto px-4 max-w-2xl py-16">
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-8 text-center">Complete Your Purchase</h1>
        <p className="text-muted-foreground text-center mb-12">
          Securely process your payment for unlimited access to PureCut AI.
        </p>

        <Elements stripe={stripePromise}>
          <div className="glass-card p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">Payment Details</h2>
            <CheckoutForm />
          </div>
        </Elements>
      </div>
      <Footer />
    </div>
  );
};

export default Payment;