import React, { useEffect, useState } from 'react';

const CancelBookingModal = ({ open, onClose, onConfirm, booking }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [step, setStep] = useState('confirm'); // 'confirm' or 'success'

  useEffect(() => {
    if (open) {
      setIsAnimating(true);
      setStep('confirm');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  const handleConfirmCancel = () => {
    setStep('success');
    // Call the confirm function
    if (onConfirm) onConfirm(booking?.id);
    
    // Auto close after 3 seconds
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  const refundAmount = booking?.totalPrice ? (booking.totalPrice * 0.9).toFixed(2) : 0;
  const nonRefundable = booking?.totalPrice ? (booking.totalPrice * 0.1).toFixed(2) : 0;

  return (
    <div className={`fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-500 overflow-hidden ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        
        {/* Confirm Cancellation View */}
        {step === 'confirm' && (
          <>
            {/* Warning Header */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-8 pt-8 pb-6 border-b border-slate-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Cancel Booking?</h1>
                <p className="text-sm text-slate-600 mt-2">Please review the cancellation details below</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-8 space-y-6">
              
              {/* Booking Info */}
              <div className="bg-slate-50 p-6 rounded-2xl">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Booking Details</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Booking ID</span>
                    <span className="font-semibold text-slate-900">{booking?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Room</span>
                    <span className="font-semibold text-slate-900">{booking?.roomName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Original Amount</span>
                    <span className="font-semibold text-slate-900">${booking?.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Refund Breakdown */}
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-4">Refund Breakdown</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-slate-600">Refundable Amount (90%)</span>
                    <span className="text-lg font-bold text-green-600">${refundAmount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border-l-4 border-red-500">
                    <span className="text-slate-600">Non-Refundable (10%)</span>
                    <span className="text-lg font-bold text-red-600">${nonRefundable}</span>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <div className="flex gap-3">
                  <span className="text-2xl">ℹ️</span>
                  <div className="text-sm">
                    <p className="font-semibold text-yellow-900 mb-1">Cancellation Not Guaranteed</p>
                    <p className="text-yellow-800">We will review your cancellation request and get back to you within 24 hours. Refunds are processed after confirmation.</p>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <div className="flex gap-3">
                  <span className="text-2xl">⚡</span>
                  <div className="text-sm">
                    <p className="font-semibold text-red-900 mb-1">This Action Cannot Be Undone</p>
                    <p className="text-red-800">Once cancelled, you will need to make a new booking for future stays. Contact our support team if you change your mind.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-8 py-6 border-t border-slate-200 flex gap-3 bg-slate-50">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition text-sm"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition text-sm"
              >
                Confirm Cancel
              </button>
            </div>
          </>
        )}

        {/* Success View */}
        {step === 'success' && (
          <div className="px-8 py-12 text-center">
            <div className="mb-6 animate-bounce">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Cancellation Requested</h2>
            <p className="text-slate-600 mb-6">
              Your cancellation request has been submitted successfully. We'll review it and contact you within 24 hours.
            </p>
            <div className="bg-green-50 p-4 rounded-xl border border-green-200 mb-6">
              <p className="text-sm text-green-900">
                <strong>Estimated Refund:</strong> ${refundAmount} (minus 10% processing fee)
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Closing in 3 seconds... or click below
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Done
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CancelBookingModal;