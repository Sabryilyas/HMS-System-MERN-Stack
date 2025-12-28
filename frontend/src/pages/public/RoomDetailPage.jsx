"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"
import { useAuth } from "../../context/AuthContext"
import { useBooking } from "../../context/BookingContext"
import * as roomService from "../../services/roomService"

const RoomDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { updateBookingData } = useBooking()
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [bookingDates, setBookingDates] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
  })
  const [error, setError] = useState("")
  const [nights, setNights] = useState(0)

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true)
        const data = await roomService.getRoomById(id)
        setRoom(data)
      } catch (error) {
        console.error("Failed to fetch room:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoom()
  }, [id])

  // Calculate nights when dates change
  useEffect(() => {
    if (bookingDates.checkIn && bookingDates.checkOut) {
      const checkIn = new Date(bookingDates.checkIn)
      const checkOut = new Date(bookingDates.checkOut)
      const diff = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
      setNights(diff > 0 ? diff : 0)
    }
  }, [bookingDates.checkIn, bookingDates.checkOut])

  const handleBooking = () => {
    setError("")

    if (!bookingDates.checkIn || !bookingDates.checkOut) {
      setError("Please select both check-in and check-out dates")
      return
    }

    if (nights <= 0) {
      setError("Check-out date must be after check-in date")
      return
    }

    if (bookingDates.guests > room.maxOccupancy) {
      setError(`Maximum occupancy is ${room.maxOccupancy} guests`)
      return
    }

    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/rooms/${id}` } })
      return
    }

    const totalPrice = nights * room.discountPrice

    updateBookingData({
      roomId: room._id || room.id,
      roomName: room.name,
      checkInDate: bookingDates.checkIn,
      checkOutDate: bookingDates.checkOut,
      guests: bookingDates.guests,
      totalPrice,
    })

    navigate("/checkout")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading room details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">🏨</div>
          <h1 className="text-2xl font-bold text-slate-900">Room not found</h1>
          <Button className="mt-6" onClick={() => navigate("/rooms")}>
            Back to Rooms
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  const totalPrice = nights > 0 ? nights * room.discountPrice : 0
  const taxAmount = totalPrice * 0.1

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images Section */}
          <div className="lg:col-span-2 space-y-4 opacity-0 animate-fade-in-up">
            {/* Main Image */}
            <Card className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="relative h-96 bg-slate-200">
                <img
                  src={room.images[selectedImage] || "/placeholder.svg"}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedImage((prev) => (prev === 0 ? room.images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition backdrop-blur-sm"
                >
                  <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev === room.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition backdrop-blur-sm"
                >
                  <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Thumbnail Gallery */}
              <div className="p-4 flex gap-2 overflow-x-auto bg-white">
                {room.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition ${
                      selectedImage === idx ? "border-blue-600 ring-2 ring-blue-300" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`${room.name} ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </Card>

            {/* Room Details */}
            <Card className="p-8 rounded-2xl border border-slate-200">
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">{room.name}</h1>
                <p className="text-slate-600">{room.description}</p>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-2xl ${i < Math.round(room.rating) ? 'text-yellow-400' : 'text-slate-300'}`}>
                      ★
                    </span>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{room.rating} out of 5</p>
                  <p className="text-sm text-slate-600">{room.reviews} guest reviews</p>
                </div>
              </div>

              {/* Room Features Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-slate-200">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Room Size</p>
                  <p className="text-2xl font-bold text-slate-900">{room.size}</p>
                  <p className="text-xs text-slate-500">square feet</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Max Occupancy</p>
                  <p className="text-2xl font-bold text-slate-900">{room.maxOccupancy}</p>
                  <p className="text-xs text-slate-500">guests</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Room Type</p>
                  <p className="text-2xl font-bold text-blue-600 capitalize">{room.type}</p>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-slate-900">✨ Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {room.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-blue-50">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-slate-900 font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1 opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <Card className="p-8 sticky top-24 rounded-2xl border border-slate-200">
              {/* Price Section */}
              <div className="mb-8 pb-8 border-b border-slate-200">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-slate-900">${room.discountPrice}</span>
                  {room.price !== room.discountPrice && (
                    <span className="text-lg text-slate-500 line-through">${room.price}</span>
                  )}
                </div>
                <p className="text-sm text-slate-600">per night</p>
                {nights > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-600 mb-1">Total for {nights} night{nights !== 1 ? 's' : ''}</p>
                    <p className="text-2xl font-bold text-blue-600">${totalPrice.toFixed(2)}</p>
                  </div>
                )}
              </div>

              {/* Booking Form */}
              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm font-medium">⚠️ {error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Check-in Date</label>
                  <input
                    type="date"
                    value={bookingDates.checkIn}
                    onChange={(e) =>
                      setBookingDates({
                        ...bookingDates,
                        checkIn: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Check-out Date</label>
                  <input
                    type="date"
                    value={bookingDates.checkOut}
                    onChange={(e) =>
                      setBookingDates({
                        ...bookingDates,
                        checkOut: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Number of Guests</label>
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <button
                      onClick={() =>
                        setBookingDates({
                          ...bookingDates,
                          guests: Math.max(1, bookingDates.guests - 1),
                        })
                      }
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition text-slate-900 font-bold"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center font-semibold text-slate-900">{bookingDates.guests}</span>
                    <button
                      onClick={() =>
                        setBookingDates({
                          ...bookingDates,
                          guests: Math.min(room.maxOccupancy, bookingDates.guests + 1),
                        })
                      }
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition text-slate-900 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Max: {room.maxOccupancy} guests</p>
                </div>

                {/* Price Breakdown */}
                {nights > 0 && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>${room.discountPrice} × {nights} night{nights !== 1 ? 's' : ''}</span>
                      <span className="font-semibold text-slate-900">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Taxes & fees</span>
                      <span className="font-semibold text-slate-900">${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-blue-200 pt-2 flex justify-between">
                      <span className="font-bold text-slate-900">Total</span>
                      <span className="font-bold text-blue-600">${(totalPrice + taxAmount).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button className="w-full" variant="primary" onClick={handleBooking}>
                  Book Now
                </Button>

                <p className="text-xs text-slate-600 text-center">
                  ✓ You won't be charged until checkout
                </p>
              </div>
            </Card>
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

export default RoomDetailPage