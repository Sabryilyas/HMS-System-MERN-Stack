import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckoutForm from './StripeCheckoutForm';
import { createPortal } from 'react-dom';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentModal = ({ isOpen, onClose, onSuccess, amount }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl transform transition-all animate-slide-up overflow-hidden">
        
        {/* Header with Gradient Accent */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Checkout</h2>
              <p className="text-sm text-slate-500 mt-1">Complete your booking</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 transition p-2 -mr-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Amount Display - Premium */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Due</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">${(amount / 100).toFixed(2)}</p>
            <p className="text-xs text-blue-600 mt-2">Secure payment powered by Stripe</p>
          </div>
        </div>

        {/* Form */}
        <div className="px-8 py-6">
          <Elements stripe={stripePromise}>
            <StripeCheckoutForm onSuccess={onSuccess} amount={amount} />
          </Elements>
        </div>

        {/* Security & Trust Badges */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Your payment information is encrypted and secure</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745-.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRole="evenodd" />
            </svg>
            <span>Trusted by thousands of travelers</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fade-in { animation: fade-in 200ms ease-out forwards; }
        .animate-slide-up { animation: slide-up 300ms ease-out forwards; }
      `}</style>
    </div>,
    document.body
  );
};

export default PaymentModal;