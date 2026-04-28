"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"
import api from "../../utils/api"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    pendingBookings: 0,
    checkedInGuests: 0,
    totalUsers: 0,
    pendingServices: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [dashboardRes, roomsRes, usersRes] = await Promise.all([
        api.get('/admin/analytics/dashboard').catch(() => ({ data: { data: {} } })),
        api.get('/rooms').catch(() => ({ data: { data: [] } })),
        api.get('/admin/users').catch(() => ({ data: { data: [] } }))
      ])

      const dashData = dashboardRes.data?.data || {}
      const rooms = roomsRes.data?.data || []
      const users = usersRes.data?.data || []

      setStats({
        totalBookings: dashData.totalBookings || 0,
        totalRevenue: dashData.totalRevenue || 0,
        totalRooms: rooms.length || 0,
        occupiedRooms: rooms.filter(r => r.status === 'occupied').length || 0,
        pendingBookings: dashData.pendingBookings || 0,
        checkedInGuests: dashData.checkedInGuests || 0,
        totalUsers: users.length || 0,
        pendingServices: dashData.pendingServices || 0
      })
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const quickLinks = [
    {
      title: "Manage Bookings",
      description: "Check-in, check-out, view analytics & charts",
      icon: "📅",
      link: "/admin/bookings",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Manage Rooms",
      description: "Add, edit, or remove rooms",
      icon: "🏨",
      link: "/admin/rooms",
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      icon: "👥",
      link: "/admin/users",
      color: "from-purple-500 to-indigo-600"
    },
    {
      title: "Manage Staff",
      description: "Staff members and task assignments",
      icon: "👷",
      link: "/admin/staff",
      color: "from-amber-500 to-orange-600"
    },
    {
      title: "Service Requests",
      description: "View and manage service requests",
      icon: "🛎️",
      link: "/admin/services",
      color: "from-pink-500 to-rose-600"
    },
    {
      title: "Housekeeping",
      description: "Manage room cleaning schedules",
      icon: "🧹",
      link: "/admin/housekeeping",
      color: "from-cyan-500 to-blue-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-white flex flex-col">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 opacity-0 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your hotel overview.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <Card className="p-5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <p className="text-blue-100 text-sm">Total Bookings</p>
            <p className="text-3xl font-bold">
              {loading ? "..." : stats.totalBookings}
            </p>
          </Card>
          <Card className="p-5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <p className="text-green-100 text-sm">Checked-In Guests</p>
            <p className="text-3xl font-bold">
              {loading ? "..." : stats.checkedInGuests}
            </p>
          </Card>
          <Card className="p-5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
            <p className="text-purple-100 text-sm">Rooms Occupied</p>
            <p className="text-3xl font-bold">
              {loading ? "..." : `${stats.occupiedRooms}/${stats.totalRooms}`}
            </p>
          </Card>
          <Card className="p-5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <p className="text-amber-100 text-sm">Pending Services</p>
            <p className="text-3xl font-bold">
              {loading ? "..." : stats.pendingServices}
            </p>
          </Card>
        </div>

        {/* Main Action - Go to Bookings */}
        <div className="mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <Link to="/admin/bookings">
            <Card className="p-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-2xl transition-all hover:scale-[1.02] cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">📊 Booking Management & Analytics</h2>
                  <p className="text-blue-100">
                    View all bookings, check-in/out guests, process payments, and see real-time analytics charts
                  </p>
                </div>
                <div className="text-5xl">→</div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Quick Links Grid */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((item, idx) => (
              <Link key={item.title} to={item.link}>
                <Card className={`p-6 rounded-xl bg-gradient-to-br ${item.color} text-white hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full`}>
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                  <p className="text-sm opacity-90">{item.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
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
    </div>
  )
}

export default AdminDashboard