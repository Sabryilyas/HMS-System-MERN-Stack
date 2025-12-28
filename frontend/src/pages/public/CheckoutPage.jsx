import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";
import { useBooking } from "../../context/BookingContext";
import * as bookingService from "../../services/bookingService";
import PaymentModal from "../../components/payment/PaymentModal";
import InvoiceModal from "../../components/payment/InvoiceModal";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookingData, resetBookingData } = useBooking();
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [guestDetails, setGuestDetails] = useState({
    firstName: user?.name?.split(' ')[0] || "",
    lastName: user?.name?.split(' ')[1] || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGuestChange = (e) => {
    setGuestDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProceedToPayment = () => {
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email) {
      setError("Please fill in all guest details before proceeding.");
      return;
    }
    setError("");
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    console.log('✅ PAYMENT SUCCESS - Closing payment modal');
    setPaymentModalOpen(false);
    setIsProcessing(true);

    try {
      console.log('💾 Creating booking...');

      const bookingPayload = {
        user: user?.id,
        room: bookingData?.roomId, // Backend expects 'room' but let's check the service
        checkInDate: bookingData?.checkInDate,
        checkOutDate: bookingData?.checkOutDate,
        guests: {
          adults: bookingData?.guests || 1,
          children: 0
        },
        totalPrice: bookingData?.totalPrice,
        guestDetails: guestDetails,
        paymentIntentId: paymentResult.id,
        paymentStatus: 'paid',
        status: 'confirmed'
      };

      if (!bookingPayload.room) {
        throw new Error("Critical booking information is missing (room ID).");
      }

      const booking = await bookingService.createBooking(bookingPayload);
      console.log('✅ Booking created successfully:', booking);

      // Get last 4 digits of card
      const last4 = paymentResult.charges?.data?.[0]?.payment_method_details?.card?.last4 || '4242';

      const finalInvoiceData = {
        booking,
        payment: {
          id: paymentResult.id,
          amount: paymentResult.amount / 100,
          last4: last4,
        },
      };

      console.log('📄 Setting invoice data:', finalInvoiceData);
      setInvoiceData(finalInvoiceData);

      // RESET BOOKING DATA FIRST - This is key!
      resetBookingData();

      // THEN show invoice after a slight delay
      setTimeout(() => {
        console.log('📄 SHOWING INVOICE MODAL NOW');
        setInvoiceModalOpen(true);
        setIsProcessing(false);
      }, 300);

    } catch (err) {
      console.error('❌ Error after payment:', err);
      setError(`Error saving booking: ${err.message}. Contact support with Payment ID: ${paymentResult.id}`);
      setIsProcessing(false);
    }
  };

  // CRITICAL FIX: Don't check bookingData when showing invoice
  if (!bookingData?.roomId && !invoiceData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">No booking data found.</h1>
            <Button onClick={() => navigate("/rooms")}>Browse Rooms</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If invoice data exists, show the page with invoice modal
  if (invoiceData) {
    return (
      <>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <div className="text-6xl mb-4">✓</div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Payment Processing...</h1>
              <p className="text-slate-500">Your invoice is loading. Please wait...</p>
            </div>
          </main>
          <Footer />
        </div>

        {/* INVOICE MODAL - GUARANTEED TO SHOW */}
        <InvoiceModal
          open={isInvoiceModalOpen}
          onClose={() => {
            console.log('📄 Closing invoice modal, navigating to bookings');
            setInvoiceModalOpen(false);
            setInvoiceData(null);
            navigate('/bookings');
          }}
          invoice={invoiceData}
          isFromBooking={false}
        />
      </>
    );
  }

  const totalAmount = bookingData.totalPrice + (bookingData.totalPrice * 0.1);

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-slate-800 text-center">Confirm and Pay</h1>

            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-800 border border-red-200 rounded-lg text-center shadow-sm">
                {error}
              </div>
            )}

            <div className="bg-white p-8 rounded-xl shadow-lg space-y-8">
              {/* Guest Information */}
              <div>
                <h2 className="text-xl font-bold mb-4 text-slate-800">👤 Guest Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    name="firstName"
                    value={guestDetails.firstName}
                    onChange={handleGuestChange}
                    required
                  />
                  <Input
                    label="Last Name"
                    name="lastName"
                    value={guestDetails.lastName}
                    onChange={handleGuestChange}
                    required
                  />
                </div>
                <div className="mt-4">
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={guestDetails.email}
                    onChange={handleGuestChange}
                    required
                  />
                </div>
                <div className="mt-4">
                  <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    name="phone"
                    value={guestDetails.phone}
                    onChange={handleGuestChange}
                  />
                </div>
              </div>

              <hr />

              {/* Room Details */}
              {bookingData && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-slate-800">🏨 Room Details</h2>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-slate-600 text-sm font-medium mb-1">Room</p>
                    <p className="text-lg font-bold text-slate-800 mb-3">{bookingData.roomName}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">📅 Check-In</p>
                        <p className="font-semibold text-slate-800">
                          {new Date(bookingData.checkInDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">📅 Check-Out</p>
                        <p className="font-semibold text-slate-800">
                          {new Date(bookingData.checkOutDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <hr />

              {/* Order Summary */}
              <div>
                <h2 className="text-xl font-bold mb-4 text-slate-800">💰 Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>${bookingData.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (10%)</span>
                    <span>${(bookingData.totalPrice * 0.1).toFixed(2)}</span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 font-semibold">Total</span>
                    <span className="text-3xl font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <div className="pt-4">
                <Button
                  onClick={handleProceedToPayment}
                  disabled={isProcessing}
                  className="w-full text-lg py-3"
                >
                  {isProcessing ? "⏳ Processing..." : "🔒 Proceed to Secure Payment"}
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={Math.round(totalAmount * 100)}
      />
    </>
  );
};

export default CheckoutPage;