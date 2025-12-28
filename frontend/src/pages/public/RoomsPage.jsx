"use client"

import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"
import ChromaGrid from "../../components/room/ChromaGrid"
import * as roomService from "../../services/roomService"

const RoomsPage = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: "",
    maxPrice: 600,
    minOccupancy: 1,
  })

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)
        const data = await roomService.getAllRooms(filters)
        setRooms(data)
      } catch (error) {
        console.error("Failed to fetch rooms:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [filters])

  const roomTypes = ["standard", "suite", "family", "penthouse"]

  // Helper functions for colors (must be before useMemo)
  const getBorderColor = (type) => {
    const colors = {
      standard: '#3B82F6',      // Blue
      suite: '#8B5CF6',         // Purple
      family: '#06B6D4',        // Cyan
      penthouse: '#6366F1'      // Indigo
    };
    return colors[type] || '#3B82F6';
  };

  const getGradient = (type) => {
    const gradients = {
      standard: 'linear-gradient(135deg, #1E3A8A 0%, #000000 100%)',     // Dark Blue to Black
      suite: 'linear-gradient(135deg, #6B21A8 0%, #000000 100%)',        // Purple to Black
      family: 'linear-gradient(135deg, #0E7490 0%, #000000 100%)',       // Cyan to Black
      penthouse: 'linear-gradient(135deg, #4338CA 0%, #000000 100%)'     // Indigo to Black
    };
    return gradients[type] || 'linear-gradient(135deg, #1E3A8A 0%, #000000 100%)';
  };

  // Transform rooms data for ChromaGrid
  const chromaItems = useMemo(() => {
    return rooms.map((room) => ({
      image: room.images?.[0] || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
      title: room.name,
      subtitle: `$${room.discountPrice || room.price}/night`,
      handle: `${room.maxOccupancy} guests • ${room.size} sqft`,
      location: room.type?.charAt(0).toUpperCase() + room.type?.slice(1),
      borderColor: getBorderColor(room.type),
      gradient: getGradient(room.type),
      url: `/rooms/${room._id || room.id}`
    }));
  }, [rooms]);


  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="mb-16 text-center opacity-0 animate-fade-in-up">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">Discover Our Rooms</h1>
          <p className="text-xl text-slate-600">Find the perfect accommodation for your stay</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 rounded-2xl border border-slate-200 backdrop-blur-sm bg-white/95 opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <h2 className="text-lg font-semibold mb-6 text-slate-900">Filter Rooms</h2>

              <div className="space-y-6">
                {/* Room Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Room Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-slate-900 text-sm"
                  >
                    <option value="">All Types</option>
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Max Price</label>
                    <span className="text-lg font-bold text-blue-600">${filters.maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="600"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        maxPrice: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>$50</span>
                    <span>$600</span>
                  </div>
                </div>

                {/* Occupancy */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Min Occupancy</label>
                  <select
                    value={filters.minOccupancy}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        minOccupancy: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-slate-900 text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setFilters({
                      type: "",
                      maxPrice: 600,
                      minOccupancy: 1,
                    })
                  }
                >
                  Reset Filters
                </Button>
              </div>
            </Card>
          </div>

          {/* Rooms Grid with ChromaGrid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading rooms...</p>
                </div>
              </div>
            ) : rooms.length === 0 ? (
              <Card className="p-12 text-center rounded-2xl border border-slate-200">
                <div className="text-5xl mb-4">🏨</div>
                <p className="text-slate-600 text-lg font-medium">No rooms found matching your filters</p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() =>
                    setFilters({
                      type: "",
                      maxPrice: 600,
                      minOccupancy: 1,
                    })
                  }
                >
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div style={{ minHeight: '800px', position: 'relative' }}>
                <ChromaGrid
                  items={chromaItems}
                  radius={300}
                  damping={0.45}
                  fadeOut={0.6}
                  ease="power3.out"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default RoomsPage