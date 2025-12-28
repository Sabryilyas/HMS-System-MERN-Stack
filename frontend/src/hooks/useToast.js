"use client"

import { useState } from "react"

export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = "success", duration = 3000) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }

  return { toasts, addToast }
}
