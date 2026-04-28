"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"
import RoomServicesPanel from "../../components/booking/RoomServicesPanel"
import { useAuth } from "../../context/AuthContext"
import * as bookingService from "../../services/bookingService"
import InvoiceModal from "../../components/payment/InvoiceModal"
import { useSocket } from "../../context/SocketContext"

const UserDashboard = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("bookings") // bookings, services
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [fetchingBill, setFetchingBill] = useState(false)
  const [currentBill, setCurrentBill] = useState(null)
  const [shouldRefreshBill, setShouldRefreshBill] = useState(0)
  const socket = useSocket()

  const checkedInBooking = bookings.find(b => b.status === 'checked-in')

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const data = await bookingService.getMyBookings()
        setBookings(data || [])
      } catch (error) {
        console.error("Failed to fetch bookings:", error)
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    // Real-time updates for guest bookings
    if (socket) {
      socket.on('my_booking_updated', (updatedBooking) => {
        setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b))
      });

      // Refresh bill when a service is updated
      socket.on('service_updated', () => {
        setShouldRefreshBill(prev => prev + 1);
      });
    }

    // Fetch bookings if user exists (check both id and _id)
    if (user) {
      fetchBookings()
    } else {
      setLoading(false)
    }

    return () => {
      if (socket) {
        socket.off('my_booking_updated');
        socket.off('service_updated');
      }
    };
  }, [user, socket])

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
      return;
    }

    try {
      setLoading(true);
      const result = await bookingService.cancelBooking(bookingId);
      if (result.success) {
        // Refresh bookings list
        const data = await bookingService.getMyBookings();
        setBookings(data || []);
      }
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert(err.response?.data?.message || "Failed to cancel booking. Please contact support.");
    } finally {
      setLoading(false);
    }
  };


  const fetchCurrentBill = async (bookingId) => {
    try {
      const billData = await bookingService.getBookingBill(bookingId)
      setCurrentBill(billData)
    } catch (err) {
      console.error("Failed to fetch running bill:", err)
    }
  }

  useEffect(() => {
    if (checkedInBooking) {
      fetchCurrentBill(checkedInBooking._id)
    } else {
      setCurrentBill(null)
    }
  }, [checkedInBooking, shouldRefreshBill])

  const upcomingBookings = bookings.filter((b) =>
    new Date(b.checkOutDate) > new Date() && !['checked-out', 'cancelled'].includes(b.status)
  )
  const pastBookings = bookings.filter((b) =>
    new Date(b.checkOutDate) <= new Date() || b.status === 'checked-out'
  )
  const totalSpent = bookings
    .filter(b => b.status === 'checked-out')
    .reduce((sum, b) => {
      const subtotal = b.totalAmount || b.finalBill?.totalAmount || b.totalPrice || 0;
      // If booking doesn't have taxAmount saved, calculate 10% tax for display consistency
      const tax = b.taxAmount || b.finalBill?.taxAmount || (subtotal * 0.1);
      return sum + subtotal + (b.taxAmount || b.finalBill?.taxAmount ? 0 : tax);
    }, 0)

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'checked-in': return 'bg-green-100 text-green-800'
      case 'checked-out': return 'bg-purple-100 text-purple-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-white flex flex-col">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12 opacity-0 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest bg-blue-100/50 px-4 py-2 rounded-full inline-block">
              👋 Welcome Back
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hello, {user?.name || 'Guest'}!
          </h1>
          <p className="text-gray-600">Manage your bookings and request room services</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold">{bookings.length}</p>
              </div>
              <div className="text-4xl opacity-80">📅</div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Upcoming Stays</p>
                <p className="text-3xl font-bold">{upcomingBookings.length}</p>
              </div>
              <div className="text-4xl opacity-80">🏨</div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  {checkedInBooking ? 'Current Running Bill' : 'Total Spent'}
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(currentBill?.totalAmount || totalSpent).toLocaleString('en-US')} LKR
                </p>
              </div>
              <div className="text-4xl opacity-80">💰</div>
            </div>
          </Card>

          <Card className={`p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 ${checkedInBooking
            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
            : 'bg-slate-100 text-slate-600'
            }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={checkedInBooking ? 'text-green-100' : 'text-slate-500'} style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Current Status
                </p>
                <p className="text-2xl font-bold">
                  {checkedInBooking ? 'Checked In' : 'Not Checked In'}
                </p>
              </div>
              <div className="text-4xl opacity-80">{checkedInBooking ? '✅' : '➖'}</div>
            </div>
          </Card>
        </div>

        {/* Checked-In Banner */}
        {checkedInBooking && (
          <Card className="mb-8 p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl opacity-0 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                  🏨
                </div>
                <div>
                  <p className="text-green-100 text-sm font-medium">Currently Checked In</p>
                  <p className="text-2xl font-bold">{checkedInBooking.room?.name || 'Your Room'}</p>
                  <p className="text-green-100 text-sm">
                    Since {new Date(checkedInBooking.actualCheckInTime || checkedInBooking.checkInDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setSelectedBooking(currentBill);
                  setShowInvoiceModal(true);
                }}
                className="bg-white text-green-700 hover:bg-green-50 font-bold px-6 py-3"
              >
                📄 View Live Bill
              </Button>
              <Button
                onClick={() => setActiveTab("services")}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold px-6 py-3 border-none"
              >
                🛎️ Request Services
              </Button>
            </div>
          </Card>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "bookings"
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
              : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
          >
            📅 My Bookings
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "services"
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg"
              : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
          >
            🛎️ Room Services
          </button>
        </div>

        {/* Content Based on Tab */}
        {activeTab === "bookings" ? (
          <>
            {/* Upcoming Bookings */}
            <div className="mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>🗓️</span> Upcoming Stays
              </h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : upcomingBookings.length === 0 ? (
                <Card className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
                  <p className="text-4xl mb-4">📭</p>
                  <p className="text-gray-600 mb-4 font-medium">No upcoming bookings</p>
                  <Link to="/rooms">
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700">Browse Rooms</Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingBookings.map((booking, idx) => (
                    <Card
                      key={booking._id || booking.id}
                      className="p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all opacity-0 animate-fade-in-up"
                      style={{ animationDelay: `${(idx + 1) * 50}ms` }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Booking ID</p>
                          <p className="font-semibold text-gray-900 font-mono">
                            #{(booking._id || booking.id)?.slice(-8)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusStyle(booking.status)}`}>
                          {booking.status?.toUpperCase().replace('-', ' ')}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-slate-600 text-sm">Room</span>
                          <span className="font-semibold text-slate-900">{booking.room?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-slate-600 text-sm">Check-in</span>
                          <span className="text-gray-900">{new Date(booking.checkInDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-slate-600 text-sm">Check-out</span>
                          <span className="text-gray-900">{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-100 mb-2">
                          <span className="text-slate-600 font-medium tracking-tight text-sm">Final Amount</span>
                          <span className="text-2xl font-black text-green-700">
                            {Math.round(
                              (booking.status === 'checked-in' && currentBill?.bookingId === (booking._id || booking.id))
                                ? currentBill.totalAmount
                                : (booking.totalAmount || booking.totalPrice || 0)
                            ).toLocaleString('en-US')} LKR
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <Button
                          variant="outline"
                          onClick={async () => {
                            try {
                              setFetchingBill(true);
                              const billData = await bookingService.getBookingBill(booking._id || booking.id);
                              setSelectedBooking(billData);
                              setShowInvoiceModal(true);
                            } catch (err) {
                              console.error("Failed to fetch bill details:", err);
                              setSelectedBooking(booking);
                              setShowInvoiceModal(true);
                            } finally {
                              setFetchingBill(false);
                            }
                          }}
                          disabled={fetchingBill}
                          className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 font-bold py-2"
                        >
                          {fetchingBill ? "⌛ Loading..." : (booking.status === 'checked-in' ? "📄 Current Bill" : "📄 Invoice")}
                        </Button>
                        {booking.status === 'checked-in' && (
                          <Button
                            onClick={() => setActiveTab("services")}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 font-bold px-2 py-2"
                          >
                            🛎️ Services
                          </Button>
                        )}
                        {['pending', 'confirmed'].includes(booking.status) && (
                          <Button
                            variant="danger"
                            onClick={() => handleCancelBooking(booking._id || booking.id)}
                            className="flex-1 font-bold py-2 border-none"
                          >
                            ❌ Cancel Stay
                          </Button>
                        )}
                      </div>
                    </Card>

                  ))}
                </div>
              )}
            </div>

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>📚</span> Past Stays
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pastBookings.slice(0, 4).map((booking, idx) => (
                    <Card
                      key={booking._id || booking.id}
                      className="p-6 rounded-2xl border border-slate-200 opacity-75 hover:opacity-100 transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Booking ID</p>
                          <p className="font-semibold text-gray-900 font-mono">
                            #{(booking._id || booking.id)?.slice(-8)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusStyle(booking.status)}`}>
                          {booking.status === 'checked-out' ? 'COMPLETED' : booking.status?.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Room</span>
                          <span className="text-gray-900 font-medium">{booking.room?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Dates</span>
                          <span className="text-gray-900">
                            {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                          <span className="text-gray-600 font-medium">Final Amount</span>
                          <span className="text-lg font-bold text-green-700">
                            {Math.round(
                              booking.totalAmount ||
                              booking.finalBill?.totalAmount ||
                              (booking.totalPrice * 1.1) || 0
                            ).toLocaleString('en-US')} LKR
                          </span>
                        </div>
                        {booking.serviceCharges > 0 && (
                          <div className="flex justify-between text-sm text-amber-600">
                            <span>Including services</span>
                            <span>{Math.round(booking.serviceCharges).toLocaleString('en-US')} LKR</span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            setFetchingBill(true);
                            const billData = await bookingService.getBookingBill(booking._id || booking.id);
                            setSelectedBooking(billData);
                            setShowInvoiceModal(true);
                          } catch (err) {
                            console.error("Failed to fetch invoice details:", err);
                            // Fallback to basic booking data if bill fetch fails
                            setSelectedBooking(booking);
                            setShowInvoiceModal(true);
                          } finally {
                            setFetchingBill(false);
                          }
                        }}
                        disabled={fetchingBill}
                        className="w-full mt-4 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
                      >
                        {fetchingBill ? "⌛ Loading..." : "📄 View Invoice"}
                      </Button>
                    </Card>
                  ))}

                </div>
              </div>
            )}
          </>
        ) : (
          /* Room Services Tab */
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            {checkedInBooking ? (
              <RoomServicesPanel
                bookingId={checkedInBooking._id || checkedInBooking.id}
              />
            ) : (
              <Card className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
                <p className="text-5xl mb-4">🏨</p>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Not Currently Checked In</h3>
                <p className="text-gray-600 mb-6">
                  You need to be checked into a room to request services.
                  <br />
                  Please contact the front desk for check-in.
                </p>
                <Link to="/rooms">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700">
                    Browse Available Rooms
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        )}
      </div>

      <Footer />

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

      {/* Invoice Modal */}
      <InvoiceModal
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        invoice={{
          booking: selectedBooking,
          payment: selectedBooking ? {
            id: selectedBooking.paymentIntentId || selectedBooking.payment?.id || 'LOCAL_TRX',
            amount: selectedBooking.totalAmount || selectedBooking.finalBill?.totalAmount || selectedBooking.totalPrice,
            last4: selectedBooking.paymentLast4 || selectedBooking.payment?.last4 || 'CASH'
          } : null
        }}
        isFromBooking={true}
      />
    </div>
  )
}

export default UserDashboard
