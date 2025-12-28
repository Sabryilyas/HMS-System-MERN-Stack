import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const CancellationModal = ({ open, onClose, booking, onConfirm }) => {
    const [email, setEmail] = useState(booking?.guestDetails?.email || '');
    const [reason, setReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!open || !booking) return null;

    // Calculate refund amount (90% refund policy)
    const refundPercentage = 90;
    const refundAmount = (booking.totalPrice * refundPercentage) / 100;
    const processingFee = booking.totalPrice - refundAmount;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            alert('Please enter your email address');
            return;
        }

        setIsProcessing(true);

        // Simulate processing delay
        setTimeout(async () => {
            try {
                await onConfirm(booking._id);
                setIsProcessing(false);
                setShowSuccess(true);

                // Auto close after 3 seconds
                setTimeout(() => {
                    setShowSuccess(false);
                    onClose();
                }, 3000);
            } catch (error) {
                setIsProcessing(false);
                alert('Failed to cancel booking. Please try again.');
            }
        }, 1500);
    };

    if (showSuccess) {
        return createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center transform animate-scale-in shadow-2xl">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Cancellation Confirmed!</h2>
                    <p className="text-gray-600 mb-2">Your booking has been cancelled successfully.</p>
                    <p className="text-sm text-gray-500 mb-6">
                        📧 Refund details have been sent to <span className="font-semibold text-blue-600">{email}</span>
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-sm text-green-800 font-semibold">
                            💰 Refund Amount: ${refundAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                            Processing time: 5-7 business days
                        </p>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full transform animate-slide-up shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">Cancel Booking</h2>
                            <p className="text-red-100 text-sm mt-1">Booking #{booking._id?.slice(-8)}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition p-2"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8">

                    {/* Booking Details */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Booking Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Room</p>
                                <p className="font-semibold text-gray-900">{booking.room?.name || 'Room'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Guest</p>
                                <p className="font-semibold text-gray-900">
                                    {booking.guestDetails?.firstName} {booking.guestDetails?.lastName}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Check-in</p>
                                <p className="font-semibold text-gray-900">
                                    {new Date(booking.checkInDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Check-out</p>
                                <p className="font-semibold text-gray-900">
                                    {new Date(booking.checkOutDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Refund Policy */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <span>💰</span> Refund Policy
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Original Amount</span>
                                <span className="font-bold text-gray-900">${booking.totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Processing Fee (10%)</span>
                                <span className="text-red-600">-${processingFee.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
                                <span className="text-blue-900 font-semibold">Refund Amount ({refundPercentage}%)</span>
                                <span className="text-2xl font-bold text-green-600">${refundAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            📧 Email Address for Refund Confirmation
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            We'll send refund details and confirmation to this email
                        </p>
                    </div>

                    {/* Reason (Optional) */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Reason for Cancellation (Optional)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Help us improve by sharing why you're cancelling..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Important Notice */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                        <div className="flex gap-3">
                            <span className="text-yellow-600 text-xl">⚠️</span>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-yellow-900 mb-1">Important Notice</p>
                                <ul className="text-xs text-yellow-800 space-y-1">
                                    <li>• Refund will be processed within 5-7 business days</li>
                                    <li>• Amount will be credited to your original payment method</li>
                                    <li>• This action cannot be undone</li>
                                    <li>• You'll receive a confirmation email shortly</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                            disabled={isProcessing}
                        >
                            Keep Booking
                        </button>
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <span>✓</span> Confirm Cancellation
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 200ms ease-out;
        }
        .animate-slide-up {
          animation: slide-up 300ms ease-out;
        }
        .animate-scale-in {
          animation: scale-in 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
        </div>,
        document.body
    );
};

export default CancellationModal;
