"use client"

import { useState, useEffect } from "react"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"
import { useAuth } from "../../context/AuthContext"
import axios from "axios"

const StaffDashboard = () => {
    const { user } = useAuth()
    const token = localStorage.getItem("token")
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("all") // all, pending, in_progress, completed

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            }
            const res = await axios.get("http://localhost:5000/api/staff/tasks", config)
            setTasks(res.data.data)
        } catch (err) {
            console.error(err)
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id, newStatus) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            }
            await axios.put(`http://localhost:5000/api/staff/tasks/${id}`, { status: newStatus }, config)
            fetchTasks() // Refresh
        } catch (err) {
            alert("Error updating task")
        }
    }

    const filteredTasks = tasks.filter(t => {
        if (filter === "all") return t.status !== "completed" // focused view
        if (filter === "history") return t.status === "completed"
        return t.status === filter
    })

    // Group stats
    const pendingCount = tasks.filter(t => t.status === "pending").length
    const inProgressCount = tasks.filter(t => t.status === "in_progress").length
    const completedCount = tasks.filter(t => t.status === "completed").length

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {user?.name} ({user?.hotelId} - {user?.taskType})</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard label="Pending Tasks" value={pendingCount} color="bg-yellow-100 text-yellow-800" />
                    <StatCard label="In Progress" value={inProgressCount} color="bg-blue-100 text-blue-800" />
                    <StatCard label="Completed" value={completedCount} color="bg-green-100 text-green-800" />
                </div>

                {/* Task List */}
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Assigned Tasks</h2>
                        <div className="flex gap-2">
                            <FilterButton label="Active" active={filter === "all"} onClick={() => setFilter("all")} />
                            <FilterButton label="Pending" active={filter === "pending"} onClick={() => setFilter("pending")} />
                            <FilterButton label="In Progress" active={filter === "in_progress"} onClick={() => setFilter("in_progress")} />
                            <FilterButton label="History" active={filter === "history"} onClick={() => setFilter("history")} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-center py-8 text-gray-500">Loading tasks...</p>
                        ) : filteredTasks.length === 0 ? (
                            <p className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                                No tasks found for this filter.
                            </p>
                        ) : (
                            filteredTasks.map(task => (
                                <TaskItem key={task._id} task={task} onUpdate={updateStatus} />
                            ))
                        )}
                    </div>
                </Card>
            </div>

            <Footer />
        </div>
    )
}

function StatCard({ label, value, color }) {
    return (
        <div className={`p-6 rounded-xl shadow-sm ${color}`}>
            <p className="text-sm font-medium opacity-80">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
    )
}

function FilterButton({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${active ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
        >
            {label}
        </button>
    )
}

function TaskItem({ task, onUpdate }) {
    const priorityColors = {
        low: "bg-gray-100 text-gray-800",
        medium: "bg-blue-100 text-blue-800",
        high: "bg-orange-100 text-orange-800",
        urgent: "bg-red-100 text-red-800"
    }

    return (
        <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition bg-white">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${priorityColors[task.priority] || "bg-gray-100"}`}>
                            {task.priority || 'medium'}
                        </span>
                        <span className="text-sm text-gray-500">
                            Room: <span className="font-bold text-gray-900">{task.room?.name || "Unknown"}</span>
                        </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {(task.type || 'General').replace("_", " ").toUpperCase()}
                    </h3>
                    <p className="text-gray-600 mb-3">{task.description}</p>
                    <p className="text-xs text-gray-400">
                        Guest: {task.user?.name || "Guest"} • Requested: {new Date(task.createdAt).toLocaleString()}
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    {task.status === "pending" && (
                        <Button size="sm" onClick={() => onUpdate(task._id, "in_progress")}>
                            Start Task
                        </Button>
                    )}
                    {task.status === "in_progress" && (
                        <Button size="sm" onClick={() => onUpdate(task._id, "completed")} className="bg-green-600 hover:bg-green-700">
                            Mark Complete
                        </Button>
                    )}
                    <span className="text-xs font-medium text-center text-gray-500 uppercase tracking-wide">
                        {task.status.replace("_", " ")}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default StaffDashboard
