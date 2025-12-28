"use client"

import { useState, useEffect } from "react"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import Button from "../../components/common/Button"
import * as bookingService from "../../services/bookingService"

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const data = await bookingService.getAllBookings()
      setBookings(data || [])
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await bookingService.updateBookingStatus(id, newStatus)
      fetchBookings()
    } catch (error) {
      console.error("Failed to update booking status:", error)
      alert("Failed to update booking status")
    }
  }

  const handleCancelBooking = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await bookingService.cancelBooking(id)
        fetchBookings()
      } catch (error) {
        console.error("Failed to cancel booking:", error)
      }
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "confirmed") return booking.status === "confirmed"
    if (filter === "cancelled") return booking.status === "cancelled"
    if (filter === "pending") return booking.status === "pending"
    return true
  })

  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Management</h1>
          <p className="text-gray-600">Total Revenue: <span className="text-green-600 font-bold">${totalRevenue.toFixed(2)}</span></p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Confirmed</p>
            <p className="text-3xl font-bold text-green-600">{bookings.filter(b => b.status === 'confirmed').length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{bookings.filter(b => b.status === 'pending').length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Cancelled</p>
            <p className="text-3xl font-bold text-red-600">{bookings.filter(b => b.status === 'cancelled').length}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-4 mb-8">
          {["all", "confirmed", "pending", "cancelled"].map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? "primary" : "secondary"}
              onClick={() => setFilter(filterOption)}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Button>
          ))}
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Booking ID</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Guest</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Room</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Check-in</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Check-out</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Total</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Payment</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="py-4 px-4 text-gray-900 font-mono text-sm">#{booking._id?.slice(-8)}</td>
                    <td className="py-4 px-4 text-gray-600">
                      {booking.guestDetails?.firstName} {booking.guestDetails?.lastName}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{booking.room?.name || booking.room}</td>
                    <td className="py-4 px-4 text-gray-600">{new Date(booking.checkInDate).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-gray-600">{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                    <td className="py-4 px-4 font-semibold text-gray-900">${booking.totalPrice?.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${booking.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {booking.paymentStatus || 'pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={booking.status}
                        onChange={(e) => handleUpdateStatus(booking._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold border-0 cursor-pointer ${booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      {booking.status !== "cancelled" && (
                        <Button variant="danger" size="sm" onClick={() => handleCancelBooking(booking._id)}>
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default AdminBookingsPage
