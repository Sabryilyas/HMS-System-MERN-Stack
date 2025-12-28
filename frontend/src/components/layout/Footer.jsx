import { Link } from "react-router-dom"
import { useState } from "react"

const Footer = () => {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setTimeout(() => {
        setEmail("")
        setSubscribed(false)
      }, 3000)
    }
  }

  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-300 mt-16 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">HotelHub</span>
                  <p className="text-xs text-blue-300">Premium Luxury Stays</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Your trusted platform for discovering world-class luxury accommodations. Experience hospitality like never before with HotelHub.
              </p>
              
              {/* Newsletter */}
              <form onSubmit={handleSubscribe} className="space-y-2">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">Subscribe for Deals</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition"
                  >
                    ✓
                  </button>
                </div>
                {subscribed && (
                  <p className="text-xs text-green-400 font-semibold animate-pulse">✓ Thanks! Check your email.</p>
                )}
              </form>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="text-blue-400">→</span> Quick Links
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/" className="text-slate-400 hover:text-blue-400 transition font-medium">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/rooms" className="text-slate-400 hover:text-blue-400 transition font-medium">
                    Browse Rooms
                  </Link>
                </li>
                <li>
                  <a href="#about" className="text-slate-400 hover:text-blue-400 transition font-medium">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-slate-400 hover:text-blue-400 transition font-medium">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="text-green-400">🆘</span> Support
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="tel:+1234567890" className="text-slate-400 hover:text-green-400 transition font-medium">
                    📱 Call: +1 (234) 567-890
                  </a>
                </li>
                <li>
                  <a href="mailto:support@hotelhub.com" className="text-slate-400 hover:text-blue-400 transition font-medium">
                    ✉️ support@hotelhub.com
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/1234567890" className="text-slate-400 hover:text-green-400 transition font-medium">
                    💬 WhatsApp Chat
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-blue-400 transition font-medium">
                    💬 Live Chat (24/7)
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="text-yellow-400">⚖️</span> Legal
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-slate-400 hover:text-blue-400 transition font-medium">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-blue-400 transition font-medium">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-blue-400 transition font-medium">
                    Cancellation Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-blue-400 transition font-medium">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Social & Trust */}
          <div className="border-t border-slate-800 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Social Links */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Follow Us</p>
                <div className="flex gap-4">
                  {[
                    { icon: "f", label: "Facebook" },
                    { icon: "𝕏", label: "Twitter" },
                    { icon: "📷", label: "Instagram" },
                    { icon: "💼", label: "LinkedIn" },
                  ].map((social, idx) => (
                    <a
                      key={idx}
                      href="#"
                      className="w-10 h-10 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition group"
                      title={social.label}
                    >
                      <span className="text-white group-hover:scale-125 transition-transform">{social.icon}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">🏆 Certified & Trusted</p>
                <div className="flex gap-4 flex-wrap">
                  {["🔒 Secure", "⭐ 4.8★", "✓ Verified", "🌍 Global"].map((badge, idx) => (
                    <span key={idx} className="text-xs bg-slate-800/50 border border-slate-700 px-3 py-1.5 rounded-full text-slate-300 font-medium">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center text-xs text-slate-500 border-t border-slate-800 pt-8">
              <p>&copy; 2025 HotelHub. All rights reserved. | Designed with ❤️ for luxury travelers</p>
              <p className="mt-2">🌍 Operating in 150+ countries | 🏨 50,000+ properties | ⭐ 4.8/5 rating</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
