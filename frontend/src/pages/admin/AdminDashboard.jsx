"use client"

import { useState, useEffect } from "react"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"
import { Link } from "react-router-dom"
import * as bookingService from "../../services/bookingService"
import * as roomService from "../../services/roomService"

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [filteredBookings, setFilteredBookings] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [bookingsData, roomsData] = await Promise.all([
          bookingService.getAllBookings?.() || Promise.resolve([]),
          roomService.getAllRooms?.() || Promise.resolve([]),
        ])
        setBookings(bookingsData || [])
        setRooms(roomsData || [])
        setFilteredBookings(bookingsData || [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setBookings([])
        setRooms([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate metrics
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length
  const pendingBookings = bookings.filter((b) => b.status === "pending").length
  const occupancyRate = rooms.length > 0 ? Math.round((confirmedBookings / rooms.length) * 100) : 0
  const averageBookingValue = bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 0
  const availableRooms = rooms.filter((r) => r.status === "available").length

  const stats = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: "💰",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-600",
      delay: "0ms"
    },
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: "📅",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600",
      delay: "100ms"
    },
    {
      label: "Confirmed",
      value: confirmedBookings,
      icon: "✓",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-600",
      delay: "200ms"
    },
    {
      label: "Pending",
      value: pendingBookings,
      icon: "⏳",
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-600",
      delay: "300ms"
    },
    {
      label: "Cancelled",
      value: cancelledBookings,
      icon: "✕",
      color: "from-red-500 to-rose-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-600",
      delay: "400ms"
    },
    {
      label: "Occupancy Rate",
      value: `${occupancyRate}%`,
      icon: "📊",
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-600",
      delay: "500ms"
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-white flex flex-col">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12 opacity-0 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest bg-blue-100/50 px-4 py-2 rounded-full inline-block">
              ⚙️ Control Panel
            </span>
            <span className="text-xs text-slate-500 font-medium">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-lg text-slate-600">Manage your hotel business with real-time insights</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          {[
            { label: "This Week", value: "week" },
            { label: "This Month", value: "month" },
            { label: "This Year", value: "year" },
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                selectedPeriod === period.value
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="opacity-0 animate-fade-in-up group cursor-pointer"
              style={{ animationDelay: stat.delay }}
            >
              <Card className={`p-8 rounded-2xl border-2 ${stat.bgColor} ${stat.borderColor} hover:shadow-2xl transition-all duration-500 hover:border-opacity-100 hover:scale-105 transform`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <p className={`text-sm font-bold uppercase tracking-widest ${stat.textColor} mb-2`}>
                      {stat.label}
                    </p>
                    <p className="text-4xl font-bold text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-blue-600 transition-all">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`text-5xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300`}>
                    {stat.icon}
                  </div>
                </div>
                <div className={`h-2 rounded-full bg-gradient-to-r ${stat.color} opacity-60 group-hover:opacity-100 transition-all`}></div>
              </Card>
            </div>
          ))}
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Recent Bookings - LARGE */}
          <Card className="lg:col-span-2 p-8 rounded-2xl border border-slate-200 opacity-0 animate-fade-in-up hover:shadow-xl transition-all">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <span>📅</span> Recent Bookings
                </h2>
                <p className="text-sm text-slate-600 mt-2">Latest booking activity</p>
              </div>
              <Link to="/admin/bookings">
                <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                  View All →
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-600">Loading bookings...</p>
                </div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                <p className="text-4xl mb-4">📭</p>
                <p className="text-lg font-semibold text-slate-600">No bookings yet</p>
                <p className="text-sm text-slate-500 mt-1">Bookings will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 6).map((booking, idx) => (
                  <div 
                    key={booking.id} 
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl hover:shadow-lg transition-all border border-slate-200 opacity-0 animate-fade-in-up group hover:scale-105 transform origin-left"
                    style={{ animationDelay: `${(idx + 1) * 50}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {booking.guestDetails?.firstName?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {booking.guestDetails?.firstName} {booking.guestDetails?.lastName}
                          </p>
                          <p className="text-xs text-slate-600">
                            Booking #{booking.id?.slice(0, 8)}... • {new Date(booking.checkInDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-bold text-slate-900">${booking.totalPrice?.toFixed(2)}</p>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full block mt-1 transition-all ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Stats */}
          <div className="space-y-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            {[
              { label: "Available Rooms", value: availableRooms, icon: "🟢", color: "from-green-500 to-emerald-600" },
              { label: "Total Rooms", value: rooms.length, icon: "🏨", color: "from-blue-500 to-blue-600" },
              { label: "Avg. Booking", value: `$${averageBookingValue}`, icon: "💵", color: "from-purple-500 to-indigo-600" },
            ].map((quick, idx) => (
              <Card 
                key={idx}
                className={`p-6 rounded-xl bg-gradient-to-br ${quick.color} text-white border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 transform`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold opacity-90 mb-1">{quick.label}</p>
                    <p className="text-3xl font-bold">{quick.value}</p>
                  </div>
                  <div className="text-4xl opacity-80 group-hover:scale-125 transition-transform">{quick.icon}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Room Management */}
        <Card className="p-8 rounded-2xl border border-slate-200 opacity-0 animate-fade-in-up hover:shadow-xl transition-all" style={{ animationDelay: "300ms" }}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <span>🏨</span> Room Inventory
              </h2>
              <p className="text-sm text-slate-600 mt-2">Active rooms in your property</p>
            </div>
            <Link to="/admin/rooms">
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                Manage Rooms →
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600">Loading rooms...</p>
              </div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
              <p className="text-4xl mb-4">🏢</p>
              <p className="text-lg font-semibold text-slate-600">No rooms added yet</p>
              <p className="text-sm text-slate-500 mt-1">Create your first room to get started</p>
              <Link to="/admin/rooms" className="mt-4 inline-block">
                <Button size="sm">Add Room</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rooms.slice(0, 8).map((room, idx) => (
                <div
                  key={room.id}
                  className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-lg transition-all opacity-0 animate-fade-in-up group hover:scale-105 transform"
                  style={{ animationDelay: `${(idx + 1) * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-blue-600 transition">{room.name}</p>
                      <p className="text-xs text-slate-600 capitalize">{room.type}</p>
                    </div>
                    <span className={`text-2xl ${room.status === "available" ? "opacity-100" : "opacity-50"}`}>
                      {room.status === "available" ? "✓" : "✕"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">
                      👥 {room.maxOccupancy}
                    </span>
                    <span className="font-bold text-slate-900">${room.discountPrice}</span>
                  </div>
                  <div className={`mt-3 h-1.5 rounded-full ${room.status === "available" ? "bg-green-500" : "bg-red-500"}`}></div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Bottom Actions */}
        <div className="mt-12 flex flex-wrap gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <Link to="/admin/rooms">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              📝 Manage Rooms
            </Button>
          </Link>
          <Link to="/admin/bookings">
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800">
              📅 View All Bookings
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => {
              // Reload data
              window.location.reload()
            }}
            className="hover:scale-105 transition-transform"
          >
            🔄 Refresh Data
          </Button>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}

export default AdminDashboard