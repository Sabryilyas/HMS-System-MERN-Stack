"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import LoadingSpinner from "../components/common/LoadingSpinner"

const StaffRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth()

    if (loading) {
        return <LoadingSpinner />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    // Allow only staff (and admin optionally, but let's say strict staff for dashboard)
    // If admin needs access, they can login as staff or we add logic.
    // Requirement: "Staff must be able to view ONLY tasks assigned to them".
    // Admin has "Manage Staff" page separately.
    if (user?.role !== 'staff') {
        return <Navigate to="/" replace />
    }

    return children
}

export default StaffRoute
