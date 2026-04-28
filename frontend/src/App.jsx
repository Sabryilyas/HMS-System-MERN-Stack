import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { BookingProvider } from "./context/BookingContext"
import { SocketProvider } from "./context/SocketContext"

// Pages
import HomePage from "./pages/public/HomePage"
import RoomsPage from "./pages/public/RoomsPage"
import RoomDetailPage from "./pages/public/RoomDetailPage"
import LoginPage from "./pages/public/LoginPage"
import RegisterPage from "./pages/public/RegisterPage"
import UserDashboard from "./pages/user/UserDashboard"
import BookingHistoryPage from "./pages/user/BookingHistoryPage"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminRoomsPage from "./pages/admin/AdminRoomsPage"
import AdminBookingsPage from "./pages/admin/AdminBookingsPage"
import ManageStaffPage from "./pages/admin/ManageStaffPage" // NEW
import AdminServicesPage from "./pages/admin/AdminServicesPage" // NEW
import StaffDashboard from "./pages/staff/StaffDashboard" // NEW
import CheckoutPage from "./pages/public/CheckoutPage"
import ContactPage from "./pages/public/ContactPage"
import AboutPage from "./pages/public/AboutPage"

// Components
import PrivateRoute from "./routes/PrivateRoute"
import AdminRoute from "./routes/AdminRoute"
import StaffRoute from "./routes/StaffRoute" // NEW
import ErrorBoundary from "./components/common/ErrorBoundary"

function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <SocketProvider>
            <BookingProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/rooms/:id" element={<RoomDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route
                  path="/checkout"
                  element={
                    <PrivateRoute>
                      <CheckoutPage />
                    </PrivateRoute>
                  }
                />

                {/* User Routes */}
                <Route
                  path="/user"
                  element={
                    <PrivateRoute>
                      <UserDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <UserDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <PrivateRoute>
                      <BookingHistoryPage />
                    </PrivateRoute>
                  }
                />

                {/* Staff Routes */}
                <Route
                  path="/staff"
                  element={
                    <StaffRoute>
                      <StaffDashboard />
                    </StaffRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/rooms"
                  element={
                    <AdminRoute>
                      <AdminRoomsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/bookings"
                  element={
                    <AdminRoute>
                      <AdminBookingsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/staff"
                  element={
                    <AdminRoute>
                      <ManageStaffPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/manage-staff"
                  element={
                    <AdminRoute>
                      <ManageStaffPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/services"
                  element={
                    <AdminRoute>
                      <AdminServicesPage />
                    </AdminRoute>
                  }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BookingProvider>
          </SocketProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App