import React, { useEffect, useState } from 'react';

const CardBrandIcon = ({ last4 }) => {
  // Determine card type from last4 (in real scenario, use brand info from Stripe)
  const isVisa = true; // Default to Visa for demo

  if (isVisa) {
    return (
      <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="32" rx="4" fill="#1434CB" />
        <text x="24" y="20" fontFamily="Arial" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">VISA</text>
      </svg>
    );
  }

  return (
    <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#EB001B" />
      <circle cx="16" cy="16" r="6" fill="#FF5F00" />
      <circle cx="32" cy="16" r="6" fill="#EB001B" />
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

  // Handle both Booking object and Bill object
  const checkIn = new Date(booking?.checkInDate || booking?.checkIn);
  const checkOut = new Date(booking?.checkOutDate || booking?.checkOut);
  const nights = booking?.nightsStayed || Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));

  // Use either the bill totals or calculate from booking
  const roomSubtotal = booking?.roomCharges || booking?.totalPrice || 0;

  // Show confirmed, in-progress, or completed services on the invoice
  const allServices = booking?.services || [];
  const serviceRequests = allServices.filter(s => ['confirmed', 'in_progress', 'completed'].includes(s.status));

  const serviceCharges = booking?.serviceCharges !== undefined ? booking.serviceCharges : serviceRequests.reduce((acc, s) => acc + (s.price || 0), 0);
  const tax = booking?.taxAmount !== undefined ? booking.taxAmount : (roomSubtotal + serviceCharges) * 0.1;
  const grandTotal = payment?.amount || booking?.totalAmount || (roomSubtotal + serviceCharges + tax);

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
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 px-8 pt-8 pb-6 border-b border-slate-100 print:hidden text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce border-4 border-white shadow-sm">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Checkout Complete</h1>
            <p className="text-sm text-slate-500 mt-1">Payment processed and stay finalized</p>
          </div>
        )}

        {/* Invoice Content */}
        <div className="px-8 py-8 space-y-8 print:px-4 print:py-4 print:space-y-4">

          {/* Header with Amount */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">📄</span>
                <h2 className="text-2xl font-bold text-slate-900 print:text-lg">Invoice</h2>
              </div>
              <p className="text-sm text-slate-500 font-mono">#{booking?.id || (booking?._id || booking?.bookingId || '').toString().slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Amount Paid</p>
              <p className="text-4xl font-black text-slate-900 print:text-xl">
                {Math.round(grandTotal).toLocaleString()}
                <span className="text-sm font-bold text-slate-400 ml-1">LKR</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 print:gap-4 border-y border-slate-100 py-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">👤 Guest Details</p>
              <p className="font-bold text-slate-900 text-lg leading-tight">{booking?.guestName || `${booking?.guestDetails?.firstName || ''} ${booking?.guestDetails?.lastName || ''}`.trim() || 'Valued Guest'}</p>
              <p className="text-sm text-slate-500 mt-1">{booking?.guestDetails?.email || 'guest@example.com'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">📅 Stay Period</p>
              <p className="font-bold text-slate-900">
                {checkIn.toLocaleDateString()} {booking?.actualCheckIn && <span className="text-slate-400 font-normal">({new Date(booking.actualCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>}
                <span className="mx-2 text-slate-300">→</span>
                {checkOut.toLocaleDateString()} {booking?.actualCheckOut && <span className="text-slate-400 font-normal">({new Date(booking.actualCheckOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>}
              </p>
              <p className="text-sm text-slate-500 mt-1">{nights} night{nights !== 1 ? 's' : ''} stay</p>
            </div>
          </div>

          <div className="print:hidden">
            {/* Room Image Slider */}
            <div className="relative w-full bg-slate-100 rounded-3xl overflow-hidden h-64 shadow-inner group">
              <img
                src={roomImages[currentImageIndex]}
                alt="Room"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition opacity-0 group-hover:opacity-100"
              >
                <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition opacity-0 group-hover:opacity-100"
              >
                <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100/50 mt-4">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">🏨 Accommodation</p>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xl font-black text-slate-900">{booking?.roomName || 'Luxury Room'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <p className="text-xs font-bold text-green-600 uppercase tracking-tighter">Verified & Paid</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold">Base Price</p>
                  <p className="text-lg font-bold text-blue-600">{Math.round(roomSubtotal / nights).toLocaleString()} <span className="text-[10px]">LKR/N</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Charges Table */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">💰 Charge Breakdown</p>
              {serviceRequests.length > 0 && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  {serviceRequests.length} Room Service Requests
                </span>
              )}
            </div>
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden print:bg-white print:border-none">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-3 text-left font-bold">Item Description</th>
                    <th className="px-6 py-3 text-right font-bold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Room Charge */}
                  <tr>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">Room Accommodation</p>
                      <p className="text-xs text-slate-500">{nights} night stay in {booking?.roomName || 'Luxury Room'}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      {Math.round(roomSubtotal).toLocaleString()} LKR
                    </td>
                  </tr>

                  {/* Service Requests */}
                  {serviceRequests.map((service, idx) => (
                    <tr key={idx} className="bg-amber-50/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs">🛎️</span>
                          <div>
                            <p className="font-bold text-slate-800 capitalize">{service.type?.replace('_', ' ') || 'Service'}</p>
                            <p className="text-[10px] text-slate-500">{service.description || 'Room service request'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-amber-700">
                        {Math.round(service.price || 0).toLocaleString()} LKR
                      </td>
                    </tr>
                  ))}

                  {/* Tax */}
                  <tr>
                    <td className="px-6 py-4 text-slate-500 text-xs">Estimated Taxes & Service Fees (10%)</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-600">
                      {Math.round(tax).toLocaleString()} LKR
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white">
                    <td className="px-6 py-5 text-lg font-bold">Total Stay Amount</td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-2xl font-black">{Math.round(grandTotal).toLocaleString()}</span>
                      <span className="text-xs font-bold ml-1 opacity-70">LKR</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-3xl relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">💳 Transaction Details</p>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Method</p>
                    <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span>{(payment?.last4 === 'CASH' || !payment?.last4) ? '💵 Cash Payment' : '💳 Card Transaction'}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Transaction ID</p>
                    <p className="text-xs font-mono font-bold text-slate-600 truncate max-w-[120px]">{payment?.id || 'LOCAL-TRX-001'}</p>
                  </div>
                  {payment?.last4 && payment?.last4 !== 'CASH' && (
                    <div className="col-span-2">
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Authenticated Card</p>
                      <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-sm inline-flex">
                        <CardBrandIcon last4={payment.last4} />
                        <p className="text-sm font-mono font-bold text-slate-900 tracking-wider">•••• •••• •••• {payment.last4}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="w-24 h-24 border-8 border-slate-100 rounded-full flex items-center justify-center -rotate-12">
                  <span className="text-[10px] font-black text-slate-200 uppercase tracking-tighter text-center">HMS<br />OFFICIAL<br />RECEIPT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-black transition-all flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(0,0,0,0.1)] active:scale-95 group"
            >
              <span className="text-xl group-hover:animate-bounce">🖨️</span>
              <span className="uppercase tracking-widest text-sm">Print Official Invoice</span>
            </button>
            <button
              onClick={handleClose}
              className="flex-1 border-2 border-slate-200 py-5 rounded-2xl font-bold hover:bg-slate-50 transition-all text-slate-700 uppercase tracking-widest text-sm active:scale-95"
            >
              Close
            </button>
          </div>

          <div className="text-center space-y-2 pt-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
              Thank you for choosing our Luxury Hotel! We hope to see you again soon.
            </p>
            <p className="text-[10px] text-slate-300">
              © {new Date().getFullYear()} HMS Luxury Resorts • GST Registered • 24/7 Concierge Support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;