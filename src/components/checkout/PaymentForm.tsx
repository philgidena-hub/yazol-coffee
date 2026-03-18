"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentFormInnerProps {
  total: number;
  onSuccess: () => void;
  onError: (message: string) => void;
}

function PaymentFormInner({ total, onSuccess, onError }: PaymentFormInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    onError("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message || "Payment failed. Please try again.");
      setProcessing(false);
    } else {
      // Payment succeeded without redirect
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white rounded-xl border border-black/10 p-4">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-4 bg-brown text-white font-display text-base rounded-xl hover:bg-brown-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? "Processing Payment..." : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

interface PaymentFormProps {
  clientSecret: string;
  total: number;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function PaymentForm({
  clientSecret,
  total,
  onSuccess,
  onError,
}: PaymentFormProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#8B6914",
            colorBackground: "#ffffff",
            colorText: "#3D2B1F",
            colorDanger: "#ef4444",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "12px",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": {
              border: "1px solid rgba(0,0,0,0.1)",
              boxShadow: "none",
              padding: "12px 16px",
              fontSize: "14px",
            },
            ".Input:focus": {
              border: "1px solid rgba(139,105,20,0.5)",
              boxShadow: "none",
            },
            ".Label": {
              fontSize: "14px",
              fontWeight: "400",
              color: "rgba(61,43,31,0.5)",
            },
            ".Tab": {
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "12px",
            },
            ".Tab--selected": {
              border: "1px solid #8B6914",
              backgroundColor: "rgba(139,105,20,0.05)",
            },
          },
        },
      }}
    >
      <PaymentFormInner total={total} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
