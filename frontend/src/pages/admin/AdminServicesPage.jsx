"use client"

import { useState, useEffect } from "react"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import Button from "../../components/common/Button"
import Card from "../../components/common/Card"
import api from "../../utils/api"
import { useSocket } from "../../context/SocketContext"

const AdminServicesPage = () => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("all")
    const [updating, setUpdating] = useState(null)
    const socket = useSocket()

    useEffect(() => {
        fetchRequests()
    }, [])

    // Real-time updates
    useEffect(() => {
        if (!socket) return

        socket.on('service_created', (newRequest) => {
            setRequests(prev => [newRequest, ...prev])
        })

        socket.on('service_updated', (updatedRequest) => {
            setRequests(prev => prev.map(req => req._id === updatedRequest._id ? updatedRequest : req))
        })

        return () => {
            socket.off('service_created')
            socket.off('service_updated')
        }
    }, [socket])

    const fetchRequests = async () => {
        try {
            setLoading(true)
            const res = await api.get("/services")
            setRequests(res.data?.data || [])
        } catch (error) {
            console.error("Failed to fetch service requests:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (requestId, newStatus) => {
        try {
            setUpdating(requestId)
            const res = await api.put(`/services/${requestId}`, { status: newStatus })
            if (res.data?.success) {
                // Update local state
                setRequests((prev) =>
                    prev.map((req) => (req._id === requestId ? { ...req, status: newStatus } : req))
                )
            }
        } catch (error) {
            console.error("Failed to update status:", error)
            alert(error.response?.data?.message || "Failed to update status")
        } finally {
            setUpdating(null)
        }
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case "pending": return "bg-yellow-100 text-yellow-800"
            case "confirmed": return "bg-blue-100 text-blue-800"
            case "in_progress": return "bg-indigo-100 text-indigo-800"
            case "completed": return "bg-green-100 text-green-800"
            case "cancelled": return "bg-red-100 text-red-800"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    const filteredRequests = requests.filter((req) => {
        if (statusFilter === "all") return true
        return req.status === statusFilter
    })

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8 opacity-0 animate-fade-in-up">
                    <h1 className="text-3xl font-bold text-slate-900">Service Request Management</h1>
                    <p className="text-slate-600 mt-1">Process and manage guest requests for food, cleaning, and more.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                    {["all", "pending", "confirmed", "in_progress", "completed", "cancelled"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${statusFilter === status
                                ? "bg-slate-900 text-white shadow-lg scale-105"
                                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                                }`}
                        >
                            <span className="capitalize">{status.replace("_", " ")}</span>
                            <span className="ml-2 opacity-60">
                                ({status === "all" ? requests.length : requests.filter(r => r.status === status).length})
                            </span>
                        </button>
                    ))}
                </div>

                {/* Requests Table */}
                <Card className="rounded-2xl overflow-hidden shadow-xl border-none opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-900 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest">Guest & Room</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest">Service Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                            <p className="text-slate-500 font-medium">Fetching requests...</p>
                                        </td>
                                    </tr>
                                ) : filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-slate-500">
                                            <div className="text-4xl mb-4 text-slate-300">🛎️</div>
                                            <p className="text-lg font-bold text-slate-400">No service requests found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((req) => (
                                        <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xl">
                                                        👤
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{req.user?.name || "Unknown Guest"}</p>
                                                        <p className="text-xs font-bold text-blue-600">Room: {req.room?.name || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-xs font-bold uppercase text-slate-400 mb-1">{req.type?.replace("_", " ")}</p>
                                                    <p className="text-sm text-slate-700">{req.description}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{new Date(req.createdAt).toLocaleString()}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={req.price || 0}
                                                        onChange={async (e) => {
                                                            const newPrice = parseFloat(e.target.value) || 0;
                                                            // Optimistic update
                                                            setRequests(prev => prev.map(r => r._id === req._id ? { ...r, price: newPrice } : r));
                                                            // Backend update
                                                            try {
                                                                await api.put(`/services/${req._id}`, { price: newPrice });
                                                            } catch (err) {
                                                                console.error("Failed to update price:", err);
                                                            }
                                                        }}
                                                        className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                    <span className="text-[10px] uppercase font-bold text-slate-400">LKR</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${getStatusStyle(req.status)}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {req.status === "pending" && (
                                                        <Button
                                                            size="xs"
                                                            onClick={() => handleUpdateStatus(req._id, "confirmed")}
                                                            disabled={updating === req._id}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded-lg"
                                                        >
                                                            {updating === req._id ? "..." : "Confirm & Bill"}
                                                        </Button>
                                                    )}
                                                    {["confirmed", "pending"].includes(req.status) && (
                                                        <Button
                                                            size="xs"
                                                            onClick={() => handleUpdateStatus(req._id, "in_progress")}
                                                            disabled={updating === req._id}
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1 rounded-lg"
                                                        >
                                                            {updating === req._id ? "..." : "Start"}
                                                        </Button>
                                                    )}
                                                    {req.status === "in_progress" && (
                                                        <Button
                                                            size="xs"
                                                            onClick={() => handleUpdateStatus(req._id, "completed")}
                                                            disabled={updating === req._id}
                                                            className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 rounded-lg"
                                                        >
                                                            {updating === req._id ? "..." : "Complete"}
                                                        </Button>
                                                    )}
                                                    {!["completed", "cancelled"].includes(req.status) && (
                                                        <Button
                                                            size="xs"
                                                            onClick={() => handleUpdateStatus(req._id, "cancelled")}
                                                            disabled={updating === req._id}
                                                            className="bg-red-50 text-red-600 hover:bg-red-100 font-bold px-3 py-1 rounded-lg border border-red-200"
                                                        >
                                                            {updating === req._id ? "..." : "Cancel"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </main>

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

export default AdminServicesPage
