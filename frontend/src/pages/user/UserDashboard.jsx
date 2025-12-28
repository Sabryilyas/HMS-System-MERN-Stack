"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"
import { useAuth } from "../../context/AuthContext"
import * as bookingService from "../../services/bookingService"

const UserDashboard = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const data = await bookingService.getUserBookings(user.id)
        setBookings(data)
      } catch (error) {
        console.error("Failed to fetch bookings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user.id])

  const upcomingBookings = bookings.filter((b) => new Date(b.checkOutDate) > new Date())
  const pastBookings = bookings.filter((b) => new Date(b.checkOutDate) <= new Date())

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Manage your bookings and profile</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Upcoming Stays</p>
                <p className="text-3xl font-bold text-gray-900">{upcomingBookings.length}</p>
              </div>
              <div className="text-4xl">🏨</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${bookings.reduce((sum, b) => sum + b.totalPrice, 0)}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </Card>
        </div>

        {/* Upcoming Bookings */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Stays</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : upcomingBookings.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600 mb-4">No upcoming bookings</p>
              <Link to="/rooms">
                <Button>Browse Rooms</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Booking ID</p>
                      <p className="font-semibold text-gray-900">#{booking.id}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Check-in</p>
                      <p className="text-gray-900">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Check-out</p>
                      <p className="text-gray-900">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Price</p>
                      <p className="text-lg font-bold text-gray-900">${booking.totalPrice}</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full bg-transparent">
                    View Details
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Stays</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastBookings.map((booking) => (
                <Card key={booking.id} className="p-6 opacity-75">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Booking ID</p>
                      <p className="font-semibold text-gray-900">#{booking.id}</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                      Completed
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-600">Check-in</p>
                      <p className="text-gray-900">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Price</p>
                      <p className="text-lg font-bold text-gray-900">${booking.totalPrice}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default UserDashboard
