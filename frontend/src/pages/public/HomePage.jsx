import { Link } from "react-router-dom"
import { useState, useEffect, useMemo } from "react"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import Button from "../../components/common/Button"
import Card from "../../components/common/Card"
import ChromaGrid from "../../components/room/ChromaGrid"

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [hoveredFeature, setHoveredFeature] = useState(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const features = [
    {
      icon: "✨",
      title: "Luxury Rooms",
      description: "Premium accommodations with world-class amenities and breathtaking views",
    },
    {
      icon: "🏊",
      title: "Spa & Wellness",
      description: "Rejuvenate at our full-service spa and wellness center",
    },
    {
      icon: "🍽️",
      title: "Fine Dining",
      description: "Michelin-inspired cuisine from award-winning chefs",
    },
    {
      icon: "🚗",
      title: "Concierge Service",
      description: "24/7 personalized assistance for all your needs",
    },
    {
      icon: "🏋️",
      title: "Fitness Center",
      description: "State-of-the-art gym with personal trainers available",
    },
    {
      icon: "🎭",
      title: "Entertainment",
      description: "Live performances and cultural events nightly",
    },
  ]

  const rooms = [
    {
      id: 1,
      name: "Deluxe Suite",
      price: 25000,
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
      rating: 4.8,
      description: "Spacious suite with panoramic city views",
    },
    {
      id: 2,
      name: "Royal Penthouse",
      price: 65000,
      image: "https://images.unsplash.com/photo-1570129477492-45422b51d3d4?w=600&q=80",
      rating: 4.9,
      description: "Ultimate luxury with private terrace",
    },
    {
      id: 3,
      name: "Ocean View Room",
      price: 35000,
      image: "https://images.unsplash.com/photo-1578654377249-e3b30dcd1d2f?w=600&q=80",
      rating: 4.7,
      description: "Serene beachfront experience",
    },
    {
      id: 4,
      name: "Executive Suite",
      price: 45000,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
      rating: 4.8,
      description: "Perfect for business and leisure",
    },
  ]

  const testimonials = [
    {
      name: "Rajesh Kumar",
      title: "CEO, Tech Company",
      text: "Absolutely world-class service. Every detail was perfect. Would recommend to anyone!",
      rating: 5,
      image: "👨‍💼",
    },
    {
      name: "Priya Sharma",
      title: "Travel Blogger",
      text: "The luxury experience was unparalleled. This is what true hospitality means!",
      rating: 5,
      image: "👩‍🎨",
    },
    {
      name: "Ahmed Hassan",
      title: "Business Traveler",
      text: "Stayed 5 times. Never disappointed. The staff goes beyond expectations!",
      rating: 5,
      image: "👨‍💼",
    },
    {
      name: "Lisa Anderson",
      title: "Honeymoon Couple",
      text: "Made our honeymoon unforgettable. Romantic, luxurious, and stunning!",
      rating: 5,
      image: "👰",
    },
  ]

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Header />

      {/* Hero Section - ULTRA PREMIUM */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>

        {/* Hero Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=1200&q=80')",
            opacity: 0.15,
            transform: `translateY(${scrollY * 0.5}px)`
          }}
        ></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="opacity-0 animate-fade-in-up">
            <div className="mb-6 inline-block opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <span className="text-blue-300 text-sm font-semibold uppercase tracking-widest px-4 py-2 bg-blue-500/20 rounded-full border border-blue-400/50">
                ✨ Welcome to Luxury
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-cyan-300 animate-text-shimmer">Extraordinary</span> Stays
            </h1>

            <p className="text-lg md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed opacity-0 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              Experience world-class hospitality, breathtaking views, and unforgettable moments at HotelHub. Your luxury escape awaits.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center opacity-0 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <Link to="/rooms">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white shadow-2xl hover:shadow-blue-500/50 text-lg font-bold px-10"
                >
                  🚀 Explore Premium Rooms
                </Button>
              </Link>
              <button className="px-8 py-4 border-2 border-blue-300 text-blue-100 rounded-xl font-bold hover:bg-blue-300/10 transition text-lg hover:border-blue-200 flex items-center gap-2 group">
                <span className="group-hover:scale-125 transition">🎬</span>
                Watch Virtual Tour
              </button>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-0 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <svg className="w-8 h-8 text-blue-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Trust Badges - ANIMATED */}
      <section className="bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[
              { label: "Happy Guests", value: "50K+", delay: "100ms" },
              { label: "Guest Rating", value: "4.8★", delay: "200ms" },
              { label: "Years Excellence", value: "15+", delay: "300ms" },
              { label: "Award Winning", value: "🏆", delay: "400ms" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center opacity-0 animate-fade-in-up group cursor-pointer" style={{ animationDelay: stat.delay }}>
                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 group-hover:from-blue-700 group-hover:to-blue-800 transition mb-1 group-hover:scale-110 transform transition-transform">{stat.value}</p>
                <p className="text-sm text-slate-600 group-hover:text-slate-900 transition font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms with ChromaGrid - PREMIUM */}
      <section className="py-32 bg-gradient-to-b from-slate-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 opacity-0 animate-fade-in-up">
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest bg-blue-500/20 px-4 py-2 rounded-full inline-block mb-4 border border-blue-400/50">
              ⭐ FEATURED COLLECTION
            </span>
            <h2 className="text-6xl font-bold text-white mt-4">Our Most Luxurious Rooms</h2>
            <p className="text-2xl text-blue-200 mt-6">Handpicked suites offering unparalleled comfort and elegance</p>
          </div>

          <div style={{ minHeight: '500px', position: 'relative' }}>
            <ChromaGrid
              items={useMemo(() => rooms.map((room) => ({
                image: room.image,
                title: room.name,
                subtitle: `LKR ${room.price.toLocaleString()}/night`,
                handle: room.description,
                location: `★ ${room.rating}`,
                borderColor: room.id === 1 ? '#3B82F6' : room.id === 2 ? '#8B5CF6' : room.id === 3 ? '#06B6D4' : '#6366F1',
                gradient: room.id === 1 ? 'linear-gradient(135deg, #1E3A8A 0%, #000000 100%)' :
                  room.id === 2 ? 'linear-gradient(135deg, #6B21A8 0%, #000000 100%)' :
                    room.id === 3 ? 'linear-gradient(135deg, #0E7490 0%, #000000 100%)' :
                      'linear-gradient(135deg, #4338CA 0%, #000000 100%)',
                url: '/rooms'
              })), [rooms])}
              radius={350}
              damping={0.45}
              fadeOut={0.6}
              ease="power3.out"
            />
          </div>
        </div>
      </section>

      {/* Premium Features Grid - ANIMATED */}
      <section className="py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 opacity-0 animate-fade-in-up">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest bg-blue-100/50 px-4 py-2 rounded-full inline-block mb-4">
              🌟 WORLD-CLASS AMENITIES
            </span>
            <h2 className="text-6xl font-bold text-slate-900 mt-4">Experience Pure Luxury</h2>
            <p className="text-2xl text-slate-600 mt-6">Every detail crafted for your comfort and pleasure</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                className="p-8 text-center group opacity-0 animate-fade-in-up rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 cursor-pointer"
                style={{ animationDelay: `${(idx + 1) * 80}ms` }}
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`text-6xl mb-4 transition-all duration-500 transform ${hoveredFeature === idx ? 'scale-150 rotate-12' : 'scale-100'}`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed group-hover:text-slate-800 transition">{feature.description}</p>
                <div className="mt-4 h-1 w-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - PREMIUM */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 opacity-0 animate-fade-in-up">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest bg-blue-100/50 px-4 py-2 rounded-full inline-block mb-4">
              ⭐ GUEST REVIEWS
            </span>
            <h2 className="text-6xl font-bold text-slate-900 mt-4">Loved by Travelers</h2>
            <p className="text-2xl text-slate-600 mt-6">Real experiences from our valued guests</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card
                key={idx}
                className="p-8 opacity-0 animate-fade-in-up rounded-2xl border border-slate-200 hover:shadow-2xl hover:border-blue-300 transition-all duration-500 group cursor-pointer"
                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
              >
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg group-hover:animate-pulse">★</span>
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic leading-relaxed group-hover:text-slate-900 transition">"{testimonial.text}"</p>
                <div className="pt-6 border-t border-slate-200">
                  <p className="font-bold text-slate-900 group-hover:text-blue-600 transition">{testimonial.name}</p>
                  <p className="text-xs text-slate-500">{testimonial.title}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - PREMIUM WITH BETTER BUTTON */}
      <section className="py-32 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }}></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="opacity-0 animate-fade-in-up">
            <h2 className="text-6xl font-bold text-white mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              Ready for Your Dream Getaway?
            </h2>
            <p className="text-2xl text-blue-100 mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              Book your luxury escape today and experience hospitality like never before
            </p>
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <Link to="/rooms">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:via-amber-400 hover:to-yellow-500 text-slate-900 shadow-2xl hover:shadow-amber-500/50 text-lg font-bold px-12 hover:scale-105 transition-transform duration-300"
                >
                  🎉 Book Your Room Now →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[
              { icon: "🔒", label: "Secure Payments" },
              { icon: "✓", label: "100% Verified Reviews" },
              { icon: "📊", label: "24/7 Support" },
              { icon: "🌍", label: "Global Trusted Brand" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-600 group cursor-pointer opacity-0 animate-fade-in-up" style={{ animationDelay: `${(idx + 1) * 100}ms` }}>
                <span className="text-2xl group-hover:scale-125 transition-transform">{item.icon}</span>
                <span className="text-sm font-semibold group-hover:text-blue-600 transition">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        @keyframes text-shimmer {
          0% {
            background-position: 0% center;
          }
          50% {
            background-position: 100% center;
          }
          100% {
            background-position: 0% center;
          }
        }
        .animate-text-shimmer {
          background-size: 200% auto;
          animation: text-shimmer 3s linear infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default HomePage