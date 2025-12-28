export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[\d\s\-+$$$$]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10
}

export const validateDateRange = (checkIn, checkOut) => {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  return end > start
}

export const validateBookingData = (data) => {
  const errors = {}

  if (!data.checkInDate) errors.checkInDate = "Check-in date is required"
  if (!data.checkOutDate) errors.checkOutDate = "Check-out date is required"
  if (!data.guests || data.guests < 1) errors.guests = "At least 1 guest required"

  if (data.checkInDate && data.checkOutDate) {
    if (!validateDateRange(data.checkInDate, data.checkOutDate)) {
      errors.dateRange = "Check-out date must be after check-in date"
    }
  }

  return errors
}
