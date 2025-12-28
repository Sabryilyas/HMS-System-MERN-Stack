"use client"

import { createContext, useContext, useState } from "react"

const BookingContext = createContext()

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    roomId: null,
    checkInDate: null,
    checkOutDate: null,
    guests: 1,
    totalPrice: 0,
    guestDetails: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  })

  const updateBookingData = (data) => {
    setBookingData((prev) => ({
      ...prev,
      ...data,
    }))
  }

  const resetBookingData = () => {
    setBookingData({
      roomId: null,
      checkInDate: null,
      checkOutDate: null,
      guests: 1,
      totalPrice: 0,
      guestDetails: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      },
    })
  }

  const value = {
    bookingData,
    updateBookingData,
    resetBookingData,
  }

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export const useBooking = () => {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error("useBooking must be used within BookingProvider")
  }
  return context
}
