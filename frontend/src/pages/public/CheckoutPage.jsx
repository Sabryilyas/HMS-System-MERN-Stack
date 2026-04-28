import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";
import { useBooking } from "../../context/BookingContext";
import * as bookingService from "../../services/bookingService";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookingData, resetBookingData } = useBooking();
  const [guestDetails, setGuestDetails] = useState({
    firstName: user?.name?.split(' ')[0] || "",
    lastName: user?.name?.split(' ')[1] || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: ""
  });
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [completedBooking, setCompletedBooking] = useState(null);

  const handleGuestChange = (e) => {
    setGuestDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCardChange = (e) => {
    let value = e.target.value;

    // Format card number with spaces
    if (e.target.name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    }

    // Format expiry as MM/YY
    if (e.target.name === 'expiry') {
      value = value.replace(/\D/g, '').slice(0, 4);
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
    }

    // Limit CVV to 4 digits
    if (e.target.name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardDetails((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleConfirmBooking = async () => {
    // Validate guest details
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email) {
      setError("Please fill in all guest details.");
      return;
    }

    // Double check dates for past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(bookingData?.checkInDate);
    checkIn.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      setError("The selected booking dates have passed. Please go back and select current or future dates.");
      return;
    }

    // Validate card details (just for saving, not charging)
    if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.cardName) {
      setError("Please fill in your card details. You will NOT be charged now - payment will be processed at checkout.");
      return;
    }

    setError("");
    setIsProcessing(true);

    try {
      const bookingPayload = {
        user: user?.id,
        room: bookingData?.roomId,
        checkInDate: bookingData?.checkInDate,
        checkOutDate: bookingData?.checkOutDate,
        guests: {
          adults: bookingData?.guests || 1,
          children: 0
        },
        totalPrice: bookingData?.totalPrice,
        guestDetails: guestDetails,
        paymentStatus: 'pending', // Payment at checkout
        status: 'confirmed',
        paymentLast4: cardDetails.cardNumber.slice(-4) // Save metadata for later
      };

      const booking = await bookingService.createBooking(bookingPayload);
      console.log('✅ Booking created successfully:', booking);

      setCompletedBooking(booking);
      setBookingComplete(true);
      resetBookingData();

    } catch (err) {
      console.error('❌ Error creating booking:', err);
      setError(`Error saving booking: ${err.message || 'Please try again.'}`);
      setIsProcessing(false);
    }
  };

  // No booking data
  if (!bookingData?.roomId && !bookingComplete) {
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

  // Booking complete - show confirmation
  if (bookingComplete && completedBooking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-10 text-center animate-fade-in">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Booking Reserved!</h1>
            <p className="text-lg text-slate-600 mb-8">
              We've successfully reserved your stay. Your journey begins soon.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 text-left space-y-4">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-2">📋 Stay Summary</h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <div className="space-y-1">
                  <p className="text-slate-500">Booking ID</p>
                  <p className="font-bold font-mono text-slate-900">#{completedBooking._id?.slice(-8).toUpperCase()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500">Room</p>
                  <p className="font-bold text-slate-900">{completedBooking.room?.name || 'Luxury Suite'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500">Check-In</p>
                  <p className="font-semibold">{new Date(completedBooking.checkInDate).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500">Check-Out</p>
                  <p className="font-semibold">{new Date(completedBooking.checkOutDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 text-center">
              <p className="text-indigo-800 font-medium">
                💳 <strong>Payment will be collected at checkout.</strong><br />
                <span className="text-sm opacity-90">An official invoice will be provided after final payment.</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => navigate("/user")}
                className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-bold transition-all"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={() => navigate("/rooms")}
                variant="outline"
                className="w-full border-2 border-slate-200 hover:bg-slate-50 text-slate-700 py-4 rounded-xl font-bold transition-all"
              >
                Book Another Stay
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalAmount = bookingData?.totalPrice ? bookingData.totalPrice + (bookingData.totalPrice * 0.1) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-slate-800 text-center">
            Complete Your Reservation
          </h1>

          {/* Info Banner */}
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center shadow-sm">
            <p className="text-indigo-800 font-medium">
              💳 <strong>Your card will NOT be charged now.</strong><br />
              <span className="text-sm">Payment will be processed when you check out from the hotel.</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 border border-red-200 rounded-lg text-center shadow-sm font-medium">
              {error}
            </div>
          )}

          <div className="bg-white p-8 rounded-3xl shadow-xl space-y-8 border border-slate-100">
            {/* Guest Information */}
            <section>
              <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                Guest Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  name="firstName"
                  value={guestDetails.firstName}
                  onChange={handleGuestChange}
                  placeholder="John"
                  required
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={guestDetails.lastName}
                  onChange={handleGuestChange}
                  placeholder="Doe"
                  required
                />
              </div>
              <div className="mt-6">
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={guestDetails.email}
                  onChange={handleGuestChange}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <div className="mt-6">
                <Input
                  label="Phone Number (Optional)"
                  type="tel"
                  name="phone"
                  value={guestDetails.phone}
                  onChange={handleGuestChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </section>

            <div className="h-px bg-slate-100" />

            {/* Room Summary */}
            <section>
              <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Stay Details
              </h2>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Room Selection</p>
                    <p className="text-xl font-extrabold text-slate-900">{bookingData?.roomName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Guests</p>
                    <p className="font-bold text-slate-800">{bookingData?.guests || 1} {bookingData?.guests > 1 ? 'Adults' : 'Adult'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200/60">
                  <div className="space-y-1">
                    <p className="text-slate-500 text-xs flex items-center gap-1">📅 Check-In</p>
                    <p className="font-bold text-slate-800">{new Date(bookingData?.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 text-xs flex items-center gap-1">📅 Check-Out</p>
                    <p className="font-bold text-slate-800">{new Date(bookingData?.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-slate-100" />

            {/* Card Information */}
            <section>
              <h2 className="text-xl font-bold mb-2 text-slate-800 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                Payment Information
              </h2>
              <p className="text-sm text-slate-500 mb-6 ml-10">
                Your card will be held as a guarantee. Payment is due at the hotel.
              </p>

              <div className="ml-10 space-y-5">
                <Input
                  label="Cardholder Name"
                  name="cardName"
                  value={cardDetails.cardName}
                  onChange={handleCardChange}
                  placeholder="EXACTLY AS ON CARD"
                  required
                />
                <Input
                  label="Card Number"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={handleCardChange}
                  placeholder="•••• •••• •••• ••••"
                  maxLength={19}
                  required
                />
                <div className="grid grid-cols-2 gap-6">
                  <Input
                    label="Expiry Date"
                    name="expiry"
                    value={cardDetails.expiry}
                    onChange={handleCardChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                  <Input
                    label="CVV"
                    name="cvv"
                    type="password"
                    value={cardDetails.cvv}
                    onChange={handleCardChange}
                    placeholder="•••"
                    maxLength={4}
                    required
                  />
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-start gap-3">
                  <span className="text-xl">🔒</span>
                  <p className="text-xs text-green-800 leading-relaxed font-medium">
                    Your payment information is encrypted and secure. We follow strict PCI-DSS standards to protect your data.
                  </p>
                </div>
              </div>
            </section>

            <div className="h-px bg-slate-100" />

            {/* Total Summary */}
            <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
              {/* Accent graphic */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8" />

              <h2 className="text-lg font-bold mb-6 opacity-70 uppercase tracking-widest text-blue-400">Total Price Estimate</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center opacity-80 font-medium">
                  <span>Room Subtotal</span>
                  <span>{Math.round(bookingData?.totalPrice || 0).toLocaleString()} LKR</span>
                </div>
                <div className="flex justify-between items-center opacity-80 font-medium">
                  <span>Estimated Tax (10%)</span>
                  <span>{Math.round((bookingData?.totalPrice || 0) * 0.1).toLocaleString()} LKR</span>
                </div>
                <div className="h-px bg-white/20 my-4" />
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">Estimated Total</p>
                    <p className="text-4xl font-extrabold">{Math.round(totalAmount).toLocaleString()} <span className="text-xl font-normal opacity-60">LKR</span></p>
                  </div>
                  <p className="text-xs text-white/50 italic max-w-[150px] text-right">
                    Actual total calculated at checkout based on services used.
                  </p>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="pt-4">
              <Button
                onClick={handleConfirmBooking}
                disabled={isProcessing}
                className="w-full text-xl py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-[0_10px_30px_rgba(37,99,235,0.3)] transform transition-all active:scale-[0.98] font-black uppercase tracking-widest"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-3">
                    <span className="animate-spin text-2xl">⏳</span>
                    <span>Processing...</span>
                  </div>
                ) : (
                  "✨ Complete Reservation ✨"
                )}
              </Button>
              <p className="text-center text-xs text-slate-400 mt-6 font-medium">
                By completing this reservation, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;