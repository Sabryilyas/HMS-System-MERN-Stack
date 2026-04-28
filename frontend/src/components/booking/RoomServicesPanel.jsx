"use client"

import { useState, useEffect } from "react"
import Card from "../common/Card"
import Button from "../common/Button"
import api from "../../utils/api"
import { useSocket } from "../../context/SocketContext"

/**
 * RoomServicesPanel Component  
 * Allows checked-in guests to request room services with pricing
 */
const RoomServicesPanel = ({ bookingId, onServiceAdded }) => {
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(null)
    const [selectedService, setSelectedService] = useState(null)
    const [customNote, setCustomNote] = useState("")
    const [myRequests, setMyRequests] = useState([])
    const socket = useSocket()

    // Real-time updates for guest
    useEffect(() => {
        if (!socket) return

        socket.on('service_updated', (updatedRequest) => {
            setMyRequests(prev => prev.map(req => req._id === updatedRequest._id ? updatedRequest : req))
        })

        return () => {
            socket.off('service_updated')
        }
    }, [socket])

    // Available services with pricing
    const availableServices = [
        { type: "food", name: "Food & Dining", icon: "🍽️", price: 1500, description: "Order from our restaurant menu" },
        { type: "laundry", name: "Laundry Service", icon: "🧺", price: 800, description: "Wash and iron clothes" },
        { type: "cleaning", name: "Room Cleaning", icon: "🧹", price: 500, description: "Extra room cleaning service" },
        { type: "room_service", name: "Room Service", icon: "🛎️", price: 1000, description: "In-room dining service" },
        { type: "amenities", name: "Extra Amenities", icon: "🧴", price: 600, description: "Toiletries, towels, etc." },
        { type: "maintenance", name: "Maintenance", icon: "🔧", price: 0, description: "Report any room issues" },
    ]

    // Fetch user's service requests
    useEffect(() => {
        fetchMyRequests()
    }, [])

    const fetchMyRequests = async () => {
        try {
            const response = await api.get(`/services/my?bookingId=${bookingId}`)
            setMyRequests(response.data.data || [])
        } catch (error) {
            console.error("Failed to fetch service requests:", error)
        }
    }

    const handleRequestService = async (service) => {
        try {
            setSubmitting(service.type)

            const response = await api.post('/services', {
                type: service.type,
                description: customNote || service.description,
                price: service.price,
                priority: 'medium'
            })

            if (response.data.success) {
                alert(`${service.name} requested successfully! Price: ${service.price} LKR`)
                setCustomNote("")
                setSelectedService(null)
                fetchMyRequests()
                onServiceAdded?.()
            }
        } catch (error) {
            console.error("Failed to request service:", error)
            alert(error.response?.data?.message || "Failed to request service")
        } finally {
            setSubmitting(null)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800'
            case 'in_progress': return 'bg-blue-100 text-blue-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-yellow-100 text-yellow-800'
        }
    }

    return (
        <div className="space-y-8">
            {/* Available Services */}
            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span>🛎️</span> Request Room Services
                </h3>
                <p className="text-slate-600 text-sm mb-6">
                    Services will be charged to your final bill at checkout
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableServices.map((service) => (
                        <Card
                            key={service.type}
                            className={`p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${selectedService?.type === service.type
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-blue-300'
                                }`}
                            onClick={() => setSelectedService(selectedService?.type === service.type ? null : service)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-3xl">{service.icon}</span>
                                <span className="text-lg font-bold text-green-600">
                                    {service.price > 0 ? `${service.price.toLocaleString('en-US')} LKR` : 'Free'}
                                </span>
                            </div>
                            <h4 className="font-bold text-slate-900 mb-1">{service.name}</h4>
                            <p className="text-xs text-slate-600">{service.description}</p>

                            {selectedService?.type === service.type && (
                                <div className="mt-4 pt-4 border-t border-slate-200 animate-fade-in">
                                    <textarea
                                        value={customNote}
                                        onChange={(e) => setCustomNote(e.target.value)}
                                        placeholder="Add special instructions (optional)"
                                        className="w-full p-3 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={2}
                                    />
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleRequestService(service)
                                        }}
                                        disabled={submitting === service.type}
                                        className="w-full mt-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                    >
                                        {submitting === service.type ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="animate-spin">⟳</span> Requesting...
                                            </span>
                                        ) : (
                                            `Request ${service.name}`
                                        )}
                                    </Button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </div>

            {/* My Service Requests */}
            {myRequests.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span>📋</span> My Service Requests
                    </h3>

                    <div className="space-y-3">
                        {myRequests.map((request) => (
                            <Card key={request._id} className="p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">
                                            {availableServices.find(s => s.type === request.type)?.icon || '📦'}
                                        </span>
                                        <div>
                                            <p className="font-semibold text-slate-900 capitalize">
                                                {request.type.replace('_', ' ')}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(request.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">{(request.price || 0).toLocaleString('en-US')} LKR</p>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(request.status)}`}>
                                            {request.status?.toUpperCase().replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                                {request.description && (
                                    <p className="text-sm text-slate-600 mt-2 pl-10">{request.description}</p>
                                )}
                            </Card>
                        ))}
                    </div>

                    {/* Total Pending Charges */}
                    <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-700 font-medium">Total Service Charges (Pending)</span>
                            <span className="text-xl font-bold text-amber-600">
                                {myRequests
                                    .filter(r => r.status !== 'cancelled')
                                    .reduce((sum, r) => sum + (r.price || 0), 0)
                                    .toLocaleString('en-US')} LKR
                            </span>
                        </div>
                        <p className="text-xs text-amber-700 mt-1">These charges will be added to your final bill</p>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
        </div>
    )
}

export default RoomServicesPanel
