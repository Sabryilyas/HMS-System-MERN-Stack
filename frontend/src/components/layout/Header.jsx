"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Button from "../common/Button"

const Header = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [showSosMenu, setShowSosMenu] = useState(false)
  const [sosClicked, setSosClicked] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/")
    setMobileMenuOpen(false)
  }

  const isHome = location.pathname === "/"
  const isDark = scrollY > 50 || !isHome

  const sosOptions = [
    {
      icon: "📱",
      label: "Call Now",
      value: "+1 (234) 567-890",
      action: () => window.location.href = "tel:+1234567890",
      color: "blue"
    },
    {
      icon: "💬",
      label: "WhatsApp",
      value: "Chat Now",
      action: () => window.location.href = "https://wa.me/1234567890",
      color: "green"
    },
    {
      icon: "✉️",
      label: "Email",
      value: "sos@hotelhub.com",
      action: () => window.location.href = "mailto:sos@hotelhub.com",
      color: "blue"
    },
  ]

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isDark 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200' 
          : 'bg-gradient-to-b from-slate-900/80 to-transparent backdrop-blur-md'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className={`w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all ${
                isDark ? '' : 'ring-2 ring-white/30'
              }`}>
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div className="hidden sm:block">
                <span className={`text-2xl font-bold transition-colors ${
                  isDark ? 'text-slate-900' : 'text-white'
                }`}>HotelHub</span>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-blue-200'}`}>Premium Stays</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink to="/" isDark={isDark} active={location.pathname === "/"}>
                Home
              </NavLink>
              <NavLink to="/rooms" isDark={isDark} active={location.pathname === "/rooms"}>
                Rooms
              </NavLink>
              <NavLink to="/about" isDark={isDark} active={location.pathname === "/about"}>
                About
              </NavLink>
              <NavLink to="/contact" isDark={isDark} active={location.pathname === "/contact"}>
                Contact
              </NavLink>
              {isAuthenticated && (
                <>
                  <NavLink to="/bookings" isDark={isDark} active={location.pathname === "/bookings"}>
                    My Bookings
                  </NavLink>
                  {isAdmin && (
                    <NavLink to="/admin" isDark={isDark} active={location.pathname === "/admin"}>
                      Admin
                    </NavLink>
                  )}
                </>
              )}
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center space-x-4">
              {/* SOS Button - ENHANCED */}
              <div className="relative group">
                <button 
                  onClick={() => setSosClicked(!sosClicked)}
                  className={`relative px-5 py-2.5 rounded-full font-bold text-sm overflow-hidden transition-all duration-300 flex items-center gap-2 ${
                    sosClicked 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-500/50' 
                      : isDark
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                  }`}
                >
                  <span className="animate-pulse">🆘</span>
                  <span>SOS 24/7</span>
                </button>

                {/* SOS Dropdown - PERSISTENT */}
                {sosClicked && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border-2 border-red-500 p-6 space-y-3 opacity-100 animate-fade-in-scale pointer-events-auto">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-red-600">Emergency Help</span>
                      <button
                        onClick={() => setSosClicked(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-2">
                      {sosOptions.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            option.action()
                            setSosClicked(false)
                          }}
                          className={`w-full p-4 rounded-xl text-left transition-all hover:scale-105 border-2 ${
                            option.color === 'green'
                              ? 'bg-green-50 border-green-200 hover:border-green-600'
                              : 'bg-blue-50 border-blue-200 hover:border-blue-600'
                          }`}
                        >
                          <p className="font-bold text-slate-900 text-lg">{option.icon} {option.label}</p>
                          <p className={`text-sm ${option.color === 'green' ? 'text-green-600' : 'text-blue-600'}`}>
                            {option.value}
                          </p>
                        </button>
                      ))}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs text-yellow-900">
                      <p className="font-bold">⚠️ Available 24/7/365</p>
                      <p>Immediate assistance for emergencies</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className={`text-right hidden lg:block text-sm ${isDark ? '' : 'text-white'}`}>
                    <p className="font-semibold">{user?.name}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-blue-200'}`}>{user?.email}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout} 
                    className={`${
                      isDark 
                        ? 'border-slate-300 text-slate-900 hover:bg-slate-100' 
                        : 'border-white/30 text-white hover:bg-white/10'
                    }`}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`${
                        isDark 
                          ? 'border-slate-300 text-slate-900 hover:bg-slate-100' 
                          : 'border-white/30 text-white hover:bg-white/10'
                      }`}
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-2">
              <button 
                onClick={() => setSosClicked(!sosClicked)}
                className="px-3 py-1.5 rounded-full text-xs font-bold text-red-600 bg-red-100 hover:bg-red-200 transition animate-pulse"
              >
                🆘 SOS
              </button>
              <button 
                className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className={`w-6 h-6 transition-colors ${isDark ? 'text-slate-900' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-6 space-y-3 pb-6 border-t border-slate-200 pt-6 opacity-0 animate-fade-in-down">
              <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)}>
                🏠 Home
              </MobileNavLink>
              <MobileNavLink to="/rooms" onClick={() => setMobileMenuOpen(false)}>
                🏨 Rooms
              </MobileNavLink>
              <MobileNavLink to="/about" onClick={() => setMobileMenuOpen(false)}>
                ℹ️ About
              </MobileNavLink>
              <MobileNavLink to="/contact" onClick={() => setMobileMenuOpen(false)}>
                📧 Contact
              </MobileNavLink>
              {isAuthenticated && (
                <>
                  <MobileNavLink to="/bookings" onClick={() => setMobileMenuOpen(false)}>
                    📚 My Bookings
                  </MobileNavLink>
                  {isAdmin && (
                    <MobileNavLink to="/admin" onClick={() => setMobileMenuOpen(false)}>
                      ⚙️ Admin
                    </MobileNavLink>
                  )}
                </>
              )}
              <div className="border-t border-slate-200 pt-4">
                {isAuthenticated ? (
                  <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                    Logout
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full">
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile SOS Menu */}
          {sosClicked && (
            <div className="md:hidden mt-4 p-4 bg-red-50 border-2 border-red-500 rounded-xl space-y-2 opacity-0 animate-fade-in-scale">
              {sosOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    option.action()
                    setSosClicked(false)
                  }}
                  className={`w-full p-3 rounded-lg text-left font-bold transition ${
                    option.color === 'green'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {option.icon} {option.label}: {option.value}
                </button>
              ))}
            </div>
          )}
        </nav>
      </header>

      <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out forwards;
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.3s ease-out forwards;
        }
      `}</style>
    </>
  )
}

const NavLink = ({ to, href, isDark, children, active }) => {
  const Component = to ? Link : "a"
  const props = to ? { to } : { href }

  return (
    <Component
      {...props}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all group relative ${
        active
          ? isDark
            ? 'text-blue-600 bg-blue-50'
            : 'text-blue-300 bg-blue-500/20'
          : isDark
            ? 'text-slate-700 hover:text-blue-600'
            : 'text-slate-200 hover:text-white'
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></span>
      )}
    </Component>
  )
}

const MobileNavLink = ({ to, href, children, onClick }) => {
  const Component = to ? Link : "a"
  const props = to ? { to } : { href }

  return (
    <Component
      {...props}
      onClick={onClick}
      className="block px-4 py-2.5 text-slate-700 hover:bg-blue-50 rounded-lg transition font-medium"
    >
      {children}
    </Component>
  )
}

export default Header