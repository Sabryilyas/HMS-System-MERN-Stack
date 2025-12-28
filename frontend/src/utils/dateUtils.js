export const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export const calculateTotalPrice = (pricePerNight, nights) => {
  return pricePerNight * nights
}

export const isDateAvailable = (date, bookedDates) => {
  return !bookedDates.some(
    (booked) => new Date(date) >= new Date(booked.checkIn) && new Date(date) <= new Date(booked.checkOut),
  )
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
