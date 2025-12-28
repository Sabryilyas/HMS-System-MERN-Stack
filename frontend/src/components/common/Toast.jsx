"use client"

import { useEffect } from "react"

const Toast = ({ message, type = "success", duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = {
    success: "bg-green-100 text-green-800 border-green-300",
    error: "bg-red-100 text-red-800 border-red-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
  }

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg border ${bgColor[type]} shadow-lg animate-fade-in`}>
      {message}
    </div>
  )
}

export default Toast
