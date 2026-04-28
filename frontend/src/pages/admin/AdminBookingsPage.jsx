"use client"

import { useState, useEffect } from "react"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import Button from "../../components/common/Button"
import Card from "../../components/common/Card"
import FinalBillModal from "../../components/booking/FinalBillModal"
import * as bookingService from "../../services/bookingService"
import * as analyticsService from "../../services/analyticsService"
import { useSocket } from "../../context/SocketContext"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState(null)
  const [billModal, setBillModal] = useState({ open: false, bookingId: null })
  const [showCharts, setShowCharts] = useState(true)

  // Chart data states
  const [bookingsChartData, setBookingsChartData] = useState([])
  const [revenueChartData, setRevenueChartData] = useState([])
  const [occupancyChartData, setOccupancyChartData] = useState([])
  const [servicesChartData, setServicesChartData] = useState([])
  const [chartsLoading, setChartsLoading] = useState(true)
  const socket = useSocket()

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  useEffect(() => {
    fetchBookings()
    fetchChartData()
  }, [])

  // Real-time updates
  useEffect(() => {
    if (!socket) return

    socket.on('booking_created', (newBooking) => {
      setBookings(prev => [newBooking, ...prev])
      fetchChartData() // Refresh charts on new booking
    })

    socket.on('booking_updated', (updatedBooking) => {
      setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b))
      fetchChartData() // Refresh charts on update
    })

    return () => {
      socket.off('booking_created')
      socket.off('booking_updated')
    }
  }, [socket])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const data = await bookingService.getAllBookings()
      setBookings(data || [])
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChartData = async () => {
    try {
      setChartsLoading(true)
      const [bookingsData, revenueData, occupancyData, servicesData] = await Promise.all([
        analyticsService.getBookingsChartData().catch(() => []),
        analyticsService.getRevenueChartData().catch(() => []),
        analyticsService.getOccupancyChartData().catch(() => []),
        analyticsService.getServicesChartData().catch(() => [])
      ])
      setBookingsChartData(bookingsData)
      setRevenueChartData(revenueData)
      setOccupancyChartData(occupancyData)
      setServicesChartData(servicesData)
    } catch (error) {
      console.error("Failed to fetch chart data:", error)
    } finally {
      setChartsLoading(false)
    }
  }

  const handleCheckIn = async (id) => {
    try {
      setActionLoading(id)
      const result = await bookingService.checkInBooking(id)
      if (result.success) {
        fetchBookings()
      }
    } catch (error) {
      console.error("Check-in failed:", error)
      alert(error.response?.data?.message || "Failed to check in guest")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCheckOut = (id) => {
    setBillModal({ open: true, bookingId: id })
  }

  const handleCheckoutComplete = () => {
    setBillModal({ open: false, bookingId: null })
    fetchBookings()
    fetchChartData() // Refresh charts after checkout
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
    if (statusFilter === "all") return true
    return booking.status === statusFilter
  })

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "confirmed": return "bg-blue-100 text-blue-800"
      case "checked-in": return "bg-green-100 text-green-800"
      case "checked-out": return "bg-purple-100 text-purple-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    "checked-in": bookings.filter((b) => b.status === "checked-in").length,
    "checked-out": bookings.filter((b) => b.status === "checked-out").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-white flex flex-col">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 opacity-0 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
              <p className="text-gray-600 mt-1">Manage check-ins, check-outs, and view analytics</p>
            </div>
            <Button
              onClick={() => setShowCharts(!showCharts)}
              variant="outline"
              className="flex items-center gap-2"
            >
              {showCharts ? '📊 Hide Charts' : '📊 Show Charts'}
            </Button>
          </div>
        </div>

        {/* Analytics Charts Section */}
        {showCharts && (
          <div className="mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Bookings Chart */}
              <Card className="p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  📅 Monthly Bookings
                </h3>
                {chartsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : bookingsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={bookingsChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="confirmed" fill="#3b82f6" name="Confirmed" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="checkedIn" fill="#22c55e" name="Checked In" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="checkedOut" fill="#8b5cf6" name="Checked Out" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-400">
                    No booking data available
                  </div>
                )}
              </Card>

              {/* Monthly Revenue Chart */}
              <Card className="p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  💰 Monthly Revenue
                </h3>
                {chartsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                  </div>
                ) : revenueChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip
                        formatter={(value) => [`${Math.round(value).toLocaleString()} LKR`, '']}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="roomRevenue" stroke="#3b82f6" strokeWidth={2} name="Room Revenue" dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="serviceRevenue" stroke="#f59e0b" strokeWidth={2} name="Service Revenue" dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="totalRevenue" stroke="#22c55e" strokeWidth={3} name="Total Revenue" dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-400">
                    No revenue data available
                  </div>
                )}
              </Card>

              {/* Room Occupancy Chart */}
              <Card className="p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  🏨 Room Occupancy
                </h3>
                {chartsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  </div>
                ) : occupancyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={occupancyChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                        label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {occupancyChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-400">
                    No occupancy data available
                  </div>
                )}
              </Card>

              {/* Popular Services Chart */}
              <Card className="p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  🛎️ Popular Services
                </h3>
                {chartsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                  </div>
                ) : servicesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={servicesChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="service" type="category" tick={{ fontSize: 12 }} width={100} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Requests" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-400">
                    No service data available
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Status Filter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`p-4 rounded-xl text-center transition-all hover:scale-105 ${statusFilter === status
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                : "bg-white border border-slate-200 text-slate-700 hover:border-blue-300"
                }`}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs font-medium capitalize">{status.replace("-", " ")}</p>
            </button>
          ))}
        </div>

        {/* Bookings Table */}
        <Card className="rounded-2xl overflow-hidden opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Booking ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Guest</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Room</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Check-in</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Check-out</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking, idx) => (
                    <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-900">
                          #{(booking._id || "").slice(-8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {booking.guestDetails?.firstName} {booking.guestDetails?.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{booking.guestDetails?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">{booking.room?.name || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {new Date(booking.checkInDate).toLocaleDateString()}
                        {booking.actualCheckInTime && (
                          <p className="text-xs text-green-600 font-bold">
                            ✓ {new Date(booking.actualCheckInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {new Date(booking.checkOutDate).toLocaleDateString()}
                        {booking.actualCheckOutTime && (
                          <p className="text-xs text-purple-600 font-bold">
                            ✓ {new Date(booking.actualCheckOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(booking.status)}`}>
                          {booking.status?.toUpperCase().replace("-", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {/* Check-In Button */}
                          {["pending", "confirmed"].includes(booking.status) && (
                            <Button
                              size="sm"
                              onClick={() => handleCheckIn(booking._id)}
                              disabled={actionLoading === booking._id}
                              className="bg-green-600 hover:bg-green-700 text-xs px-3 py-1"
                            >
                              {actionLoading === booking._id ? "..." : "✓ Check In"}
                            </Button>
                          )}

                          {/* Check-Out Button */}
                          {booking.status === "checked-in" && (
                            <Button
                              size="sm"
                              onClick={() => handleCheckOut(booking._id)}
                              className="bg-purple-600 hover:bg-purple-700 text-xs px-3 py-1"
                            >
                              💰 Check Out
                            </Button>
                          )}

                          {/* View Bill */}
                          {booking.status === "checked-out" && (
                            <Button
                              size="sm"
                              onClick={() => handleCheckOut(booking._id)}
                              variant="outline"
                              className="text-xs px-3 py-1"
                            >
                              📄 View Bill
                            </Button>
                          )}

                          {/* Cancel Button */}
                          {["pending", "confirmed"].includes(booking.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelBooking(booking._id)}
                              className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-3 py-1"
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Footer />

      {/* Final Bill Modal */}
      <FinalBillModal
        isOpen={billModal.open}
        onClose={() => setBillModal({ open: false, bookingId: null })}
        bookingId={billModal.bookingId}
        onCheckoutComplete={handleCheckoutComplete}
      />

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
    </div>
  )
}

export default AdminBookingsPage
