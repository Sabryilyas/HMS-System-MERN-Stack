import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as bookingService from '../../services/bookingService';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';
import InvoiceModal from '../../components/payment/InvoiceModal';
import CancellationModal from '../../components/booking/CancellationModal';
import { Link } from 'react-router-dom';

const FilterTabs = ({ currentFilter, onFilterChange, counts }) => {
  const filters = [
    { key: "all", label: "📋 All Bookings", count: counts.all },
    { key: "upcoming", label: "📅 Upcoming", count: counts.upcoming },
    { key: "completed", label: "✓ Completed", count: counts.completed },
    { key: "cancelled", label: "❌ Cancelled", count: counts.cancelled }
  ];

  return (
    <div className="flex gap-2 mb-8 justify-center print:hidden overflow-x-auto pb-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${currentFilter === filter.key
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
          {filter.label} {filter.count > 0 && `(${filter.count})`}
        </button>
      ))}
    </div>
  );
};

const BookingCard = ({ booking, index, onViewInvoice, onCancelBooking }) => {
  const isUpcoming = new Date(booking.checkInDate) > new Date();
  const isCompleted = new Date(booking.checkOutDate) < new Date() && booking.status !== 'cancelled';
  const isCancelled = booking.status === 'cancelled';
  const nights = Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24));
  const canCancel = isUpcoming && !isCancelled && booking.paymentStatus === 'paid';

  const getStatusBadge = () => {
    if (isCancelled) return { bg: 'bg-red-100', text: 'text-red-700', label: '❌ Cancelled' };
    if (booking.status === 'pending') return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '⏳ Pending' };
    if (isCompleted) return { bg: 'bg-green-100', text: 'text-green-700', label: '✓ Completed' };
    if (booking.status === 'confirmed') return { bg: 'bg-blue-100', text: 'text-blue-700', label: '📅 Confirmed' };
    return { bg: 'bg-gray-100', text: 'text-gray-700', label: booking.status };
  };

  const status = getStatusBadge();

  return (
    <div className={`bg-white border-2 rounded-2xl p-6 hover:shadow-xl transition-all opacity-0 animate-fade-in-up ${isCancelled ? 'border-red-200 bg-red-50/50' : 'border-slate-200 hover:border-blue-300'
      }`} style={{ animationDelay: `${index * 100}ms` }}>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{booking.room?.name || 'Room'}</h3>
          <p className="text-xs text-slate-500 mt-1 font-mono">#{booking._id?.slice(-8)}</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
            {status.label}
          </span>
          {booking.paymentStatus === 'paid' && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              💳 Paid
            </span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-slate-200">
        <div className="relative">
          <p className="text-xs text-slate-500 mb-1">Check-in</p>
          <p className="text-sm font-bold text-slate-900">
            {new Date(booking.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
          <p className="text-xs text-slate-400">
            {new Date(booking.checkInDate).toLocaleDateString('en-US', { weekday: 'short' })}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="text-xs text-slate-600 mb-1 font-semibold">{nights} night{nights > 1 ? 's' : ''}</div>
          <div className="w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600"></div>
        </div>

        <div className="relative text-right">
          <p className="text-xs text-slate-500 mb-1">Check-out</p>
          <p className="text-sm font-bold text-slate-900">
            {new Date(booking.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
          <p className="text-xs text-slate-400">
            {new Date(booking.checkOutDate).toLocaleDateString('en-US', { weekday: 'short' })}
          </p>
        </div>
      </div>

      {/* Price & Guest Info */}
      <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-slate-900">${booking.totalPrice?.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-1">Guests</p>
          <p className="text-2xl font-bold text-blue-600">{booking.guests?.adults || 1}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Per Night</p>
          <p className="text-2xl font-bold text-slate-900">${(booking.totalPrice / nights).toFixed(2)}</p>
        </div>
      </div>

      {/* Guest Name */}
      <div className="mb-6 p-4 bg-slate-50 rounded-xl">
        <p className="text-xs text-slate-500 mb-1">Guest Name</p>
        <p className="font-semibold text-slate-900">
          {booking.guestDetails?.firstName} {booking.guestDetails?.lastName}
        </p>
        <p className="text-xs text-slate-500 mt-1">{booking.guestDetails?.email}</p>
      </div>

      {/* Cancellation Info */}
      {isCancelled && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-semibold text-red-800">🔴 Booking Cancelled</p>
          <p className="text-xs text-red-600 mt-1">
            Refund will be processed within 5-7 business days
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={() => onViewInvoice(booking)}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2"
        >
          <span>📄</span> View Invoice
        </button>
        {canCancel && (
          <button
            onClick={() => onCancelBooking(booking)}
            className="flex-1 px-4 py-2.5 border-2 border-red-300 text-red-700 rounded-xl font-semibold hover:bg-red-50 transition text-sm flex items-center justify-center gap-2"
          >
            <span>✕</span> Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse">
    <div className="space-y-4">
      <div className="h-6 w-1/2 bg-slate-200 rounded-lg"></div>
      <div className="h-4 w-1/4 bg-slate-200 rounded-lg"></div>
      <div className="h-24 bg-slate-100 rounded-lg"></div>
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-slate-200 rounded-lg"></div>
        <div className="flex-1 h-10 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  </div>
);

const BookingHistoryPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await bookingService.getMyBookings();
      setBookings(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setBookings([]);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const filteredBookings = useMemo(() => {
    if (filter === "upcoming") {
      return bookings.filter((b) => new Date(b.checkInDate) > new Date() && b.status !== 'cancelled');
    }
    if (filter === "completed") {
      return bookings.filter((b) => new Date(b.checkOutDate) < new Date() && b.status !== 'cancelled');
    }
    if (filter === "cancelled") {
      return bookings.filter((b) => b.status === 'cancelled');
    }
    return bookings;
  }, [bookings, filter]);

  const counts = useMemo(() => ({
    all: bookings.length,
    upcoming: bookings.filter((b) => new Date(b.checkInDate) > new Date() && b.status !== 'cancelled').length,
    completed: bookings.filter((b) => new Date(b.checkOutDate) < new Date() && b.status !== 'cancelled').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length
  }), [bookings]);

  const handleViewInvoice = (booking) => {
    const invoiceData = {
      booking,
      payment: {
        id: booking.paymentIntentId || 'N/A',
        amount: booking.totalPrice,
        last4: '4242',
      },
    };
    setSelectedBooking(invoiceData);
    setIsInvoiceOpen(true);
  };

  const handleCancelBooking = (booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async (bookingId) => {
    try {
      await bookingService.cancelBooking(bookingId);
      fetchBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      throw error;
    }
  };

  const totalSpent = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
        <Header />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">

          {/* Header */}
          <div className="text-center mb-12 opacity-0 animate-fade-in-up">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">MY RESERVATIONS</span>
            <h1 className="text-5xl font-bold text-slate-900 mt-2">Your Bookings</h1>
            <p className="text-lg text-slate-600 mt-4">Manage and track all your hotel reservations</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-2xl font-bold text-blue-600">{counts.all}</p>
              <p className="text-xs text-slate-600 mt-1">Total</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-2xl font-bold text-blue-600">{counts.upcoming}</p>
              <p className="text-xs text-slate-600 mt-1">Upcoming</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-2xl font-bold text-green-600">${totalSpent.toFixed(0)}</p>
              <p className="text-xs text-slate-600 mt-1">Total Spent</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-2xl font-bold text-red-600">{counts.cancelled}</p>
              <p className="text-xs text-slate-600 mt-1">Cancelled</p>
            </div>
          </div>

          {/* Filters */}
          <FilterTabs currentFilter={filter} onFilterChange={setFilter} counts={counts} />

          {/* Bookings List */}
          <div className="space-y-4">
            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center bg-white border-2 border-dashed border-slate-300 rounded-2xl p-16 opacity-0 animate-fade-in-up">
                <div className="text-6xl mb-4">🏨</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No {filter !== 'all' && filter} bookings</h3>
                <p className="text-slate-600 mb-8">Your {filter} bookings will appear here</p>
                <Link
                  to="/rooms"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Explore Rooms Now →
                </Link>
              </div>
            ) : (
              filteredBookings.map((booking, index) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  index={index}
                  onViewInvoice={handleViewInvoice}
                  onCancelBooking={handleCancelBooking}
                />
              ))
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Invoice Modal */}
      {selectedBooking && (
        <InvoiceModal
          open={isInvoiceOpen}
          onClose={() => {
            setIsInvoiceOpen(false);
            setSelectedBooking(null);
          }}
          invoice={selectedBooking}
          isFromBooking={true}
        />
      )}

      {/* Cancellation Modal */}
      {bookingToCancel && (
        <CancellationModal
          open={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false);
            setBookingToCancel(null);
          }}
          booking={bookingToCancel}
          onConfirm={handleConfirmCancel}
        />
      )}

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default BookingHistoryPage;