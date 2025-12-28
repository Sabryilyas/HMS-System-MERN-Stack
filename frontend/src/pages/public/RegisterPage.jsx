"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"
import Input from "../../components/common/Input"
import { useAuth } from "../../context/AuthContext"

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setFieldErrors({})

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }))
      return
    }

    if (formData.password.length < 6) {
      setFieldErrors(prev => ({ ...prev, password: "Password must be at least 6 characters" }))
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...userData } = formData
      await register(userData)
      navigate("/dashboard")
    } catch (err) {
      const message = err.message || "Registration failed"
      setError(message)

      // Parse backend validation errors
      if (message.toLowerCase().includes("phone")) {
        setFieldErrors(prev => ({ ...prev, phone: "Please enter a valid phone number (e.g., 1234567890)" }))
      } else if (message.toLowerCase().includes("email")) {
        setFieldErrors(prev => ({ ...prev, email: message }))
      } else if (message.toLowerCase().includes("password")) {
        setFieldErrors(prev => ({ ...prev, password: message }))
      } else if (message.toLowerCase().includes("name")) {
        setFieldErrors(prev => ({ ...prev, name: message }))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Create Account</h1>
          <p className="text-gray-600 mb-8">Join us for luxury stays</p>

          {error && !Object.keys(fieldErrors).length && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              error={fieldErrors.name}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={fieldErrors.email}
              required
            />

            <Input
              label="Phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="1234567890"
              error={fieldErrors.phone}
            />

            <Input
              label="Address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St"
              error={fieldErrors.address}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={fieldErrors.password}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={fieldErrors.confirmPassword}
              required
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in here
            </Link>
          </p>
        </Card>
      </div>

      <Footer />
    </div>
  )
}

export default RegisterPage
