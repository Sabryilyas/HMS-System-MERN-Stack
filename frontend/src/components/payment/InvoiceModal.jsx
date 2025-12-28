import React, { useEffect, useState } from 'react';

const CardBrandIcon = ({ last4 }) => {
  // Determine card type from last4 (in real scenario, use brand info from Stripe)
  const isVisa = true; // Default to Visa for demo
  
  if (isVisa) {
    return (
      <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="32" rx="4" fill="#1434CB"/>
        <text x="24" y="20" fontFamily="Arial" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">VISA</text>
      </svg>
    );
  }
  
  return (
    <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#EB001B"/>
      <circle cx="16" cy="16" r="6" fill="#FF5F00"/>
      <circle cx="32" cy="16" r="6" fill="#EB001B"/>
    </svg>
  );
};

const InvoiceModal = ({ open, onClose, invoice, isFromBooking = false }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open, invoice]);

  if (!open || !invoice) return null;

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  const handlePrint = () => {
    window.print();
  };

  const booking = invoice?.booking;
  const payment = invoice?.payment;

  const checkIn = new Date(booking?.checkInDate);
  const checkOut = new Date(booking?.checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  // Sample room images for slider
  const roomImages = [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    'https://images.unsplash.com/photo-1570129477492-45422b51d3d4?w=800&q=80',
    'https://images.unsplash.com/photo-1578654377249-e3b30dcd1d2f?w=800&q=80',
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % roomImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length);
  };

  return (
    <div className={`fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'} print:bg-white print:opacity-100`}>
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all duration-500 overflow-hidden max-h-[90vh] overflow-y-auto ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        
        {/* Success Animation Header */}
        {!isFromBooking && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 px-8 pt-8 pb-6 border-b border-slate-100 print:hidden">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-slate-900">Payment Successful</h1>
              <p className="text-sm text-slate-500 mt-1">Your booking is confirmed</p>
            </div>
          </div>
        )}

        {/* Invoice Content */}
        <div className="px-8 py-8 space-y-8 print:px-4 print:py-4 print:space-y-4">
          
          {/* Header with Amount */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 print:text-lg">Invoice</h2>
              <p className="text-sm text-slate-500 mt-1">#{booking?.id}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900">${payment?.amount?.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(booking?.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-100"></div>

          {/* Guest & Dates Section */}
          <div className="grid grid-cols-2 gap-8 print:gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">👤 Guest</p>
              <p className="text-sm font-semibold text-slate-900">
                {booking?.guestDetails?.firstName} {booking?.guestDetails?.lastName}
              </p>
              <p className="text-xs text-slate-500 mt-2">{booking?.guestDetails?.email}</p>
              {booking?.guestDetails?.phone && (
                <p className="text-xs text-slate-500 mt-1">{booking?.guestDetails?.phone}</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">📅 Dates</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-500">Check-in</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Check-out</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Room Section with Image Slider */}
          <div className="space-y-4 print:hidden">
            {/* Room Image Slider */}
            <div className="relative w-full bg-slate-100 rounded-2xl overflow-hidden h-64">
              <img 
                src={roomImages[currentImageIndex]} 
                alt="Room" 
                className="w-full h-full object-cover"
              />
              
              {/* Slider Navigation */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition"
              >
                <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition"
              >
                <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Slider Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {roomImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition ${
                      idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Room Details Below Slider */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">🏨 Accommodation</p>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{booking?.roomName}</p>
                  <p className="text-sm text-slate-600 mt-1">{nights} night{nights !== 1 ? 's' : ''} stay</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">Per night</p>
                  <p className="text-xl font-semibold text-blue-600">${(booking?.totalPrice / nights).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Print version - simple room info */}
          <div className="hidden print:block bg-slate-50 p-4 rounded-xl">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Accommodation</p>
            <p className="text-sm font-semibold text-slate-900">{booking?.roomName} • {nights} nights @ ${(booking?.totalPrice / nights).toFixed(2)}/night</p>
          </div>

          {/* Charges */}
          <div className="space-y-3 print:space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal ({nights} nights)</span>
              <span className="font-semibold text-slate-900">${booking?.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Taxes & fees (10%)</span>
              <span className="font-semibold text-slate-900">${(booking?.totalPrice * 0.1).toFixed(2)}</span>
            </div>
            <div className="h-px bg-slate-100"></div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="text-2xl font-semibold text-slate-900">${payment?.amount?.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Information - Enhanced */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200 print:bg-white print:border-slate-300">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">💳 Payment Information</p>
            
            <div className="space-y-4">
              {/* Card Display */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Card Type</p>
                    <p className="text-sm font-semibold text-slate-900">Visa</p>
                  </div>
                  <CardBrandIcon last4={payment?.last4} />
                </div>
                
                <div className="py-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Card Number</p>
                  <p className="text-sm font-mono text-slate-900 tracking-wider">•••• •••• •••• {payment?.last4}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Expires</p>
                    <p className="text-sm font-semibold text-slate-900">12/26</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">CVV</p>
                    <p className="text-sm font-semibold text-slate-900">•••</p>
                  </div>
                </div>
              </div>

              {/* Payment Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Method</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">Credit Card</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Status</p>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold mt-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Paid
                  </span>
                </div>
              </div>

              {/* Payment ID */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-slate-500 mb-1">Transaction ID</p>
                <p className="text-xs font-mono text-slate-900 break-all">{payment?.id?.slice(0, 30)}...</p>
              </div>
            </div>
          </div>

          {/* Confirmation Note */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 print:bg-white print:border-slate-200">
            <p className="text-xs text-blue-900 text-center">
              ✅ Confirmation details have been sent to <span className="font-semibold">{booking?.guestDetails?.email}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-8 py-4 border-t border-slate-100 flex gap-3 print:hidden bg-slate-50">
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9a2 2 0 00-2 2v2a2 2 0 002 2h4a2 2 0 002-2v-2a2 2 0 00-2-2z" />
            </svg>
            Print Invoice
          </button>
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-sm"
          >
            {isFromBooking ? 'Done' : 'Close'}
          </button>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block text-center py-3 border-t border-slate-200 text-xs text-slate-500">
          HotelHub Invoice • {new Date().toLocaleDateString()} • Transaction ID: {payment?.id?.slice(0, 20)}...
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;