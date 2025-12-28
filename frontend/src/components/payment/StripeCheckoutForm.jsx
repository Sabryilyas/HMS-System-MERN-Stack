import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { confirmCardPayment } from '../../utils/mockStripe';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#111827',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#9ca3af',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: true,
};

const StripeCheckoutForm = ({ onSuccess, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    if (!amount || amount < 50) {
      setErrorMessage('Invalid amount');
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/payments/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount),
            currency: 'usd',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        setErrorMessage(`Failed to initialize payment: ${error.message}`);
      }
    };

    createPaymentIntent();
  }, [amount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!clientSecret) {
      setErrorMessage('Payment system is not ready. Please wait...');
      return;
    }

    setIsLoading(true);

    try {
      const cardElement = elements?.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      } else {
        setErrorMessage('Payment could not be completed. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">
          Card Information
        </label>
        <div className="p-4 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">⚠️ {errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !clientSecret}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition ${isLoading || !clientSecret
          ? 'bg-slate-300 cursor-not-allowed'
          : 'bg-slate-900 hover:bg-slate-800 active:scale-95'
          }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Pay $${(amount / 100).toFixed(2)}`
        )}
      </button>
    </form>
  );
};

export default StripeCheckoutForm;