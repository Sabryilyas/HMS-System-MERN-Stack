"use client"

import { useState, useEffect } from "react"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"
import Input from "../../components/common/Input"
import Modal from "../../components/common/Modal"
import { useAuth } from "../../context/AuthContext"
import axios from "axios"

const ManageStaffPage = () => {
    const [staff, setStaff] = useState([])
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    // Modals
    const [selectedStaff, setSelectedStaff] = useState(null)
    const [isAssignModalOpen, setAssignModalOpen] = useState(false)
    const [isViewTasksModalOpen, setViewTasksModalOpen] = useState(false)

    // Forms
    const { user } = useAuth()
    const token = localStorage.getItem("token")

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        hotelId: "Colombo",
        taskType: "housekeeping"
    })

    // Task Form data
    const [taskData, setTaskData] = useState({
        description: "",
        type: "housekeeping",
        priority: "medium"
    })

    useEffect(() => {
        fetchStaff()
        fetchTasks()
    }, [])

    const fetchStaff = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } }
            const res = await axios.get("http://localhost:5000/api/admin/staff", config)
            setStaff(res.data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchTasks = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } }
            const res = await axios.get("http://localhost:5000/api/services", config)
            setTasks(res.data.data)
        } catch (err) {
            console.error("Error fetching tasks:", err)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } }
            await axios.post("http://localhost:5000/api/admin/staff", formData, config)
            setShowForm(false)
            fetchStaff()
            setFormData({
                name: "",
                email: "",
                password: "",
                phone: "",
                address: "",
                hotelId: "Colombo",
                taskType: "housekeeping"
            })
        } catch (err) {
            alert(err.response?.data?.message || "Error creating staff")
        }
    }

    // Task Assignment Logic
    const handleAssignClick = (staffMember) => {
        setSelectedStaff(staffMember)
        setTaskData({ description: "", type: staffMember.taskType || "other", priority: "medium" })
        setAssignModalOpen(true)
    }

    const handleTaskSubmit = async (e) => {
        e.preventDefault()
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } }
            await axios.post("http://localhost:5000/api/admin/staff/assign-task", {
                staffId: selectedStaff._id,
                ...taskData
            }, config)
            alert("Task Assigned Successfully!")
            setAssignModalOpen(false)
            fetchTasks() // Refresh tasks to show in count/view
        } catch (err) {
            alert("Failed to assign task")
        }
    }

    // View Tasks Logic
    const handleViewTasksClick = (staffMember) => {
        setSelectedStaff(staffMember)
        fetchTasks() // Refresh
        setViewTasksModalOpen(true)
    }

    // Derived state
    const staffTasks = selectedStaff ? tasks.filter(t => t.assignedTo?._id === selectedStaff._id || t.assignedTo === selectedStaff._id) : []

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Staff</h1>
                        <p className="text-gray-600 mt-1">Add staff and assign tasks manually</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Cancel" : "Add Staff"}
                    </Button>
                </div>

                {showForm && (
                    <Card className="mb-8 p-6 animate-fade-in-down">
                        <h2 className="text-xl font-bold mb-4">Add New Staff Member</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                            <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
                            <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
                            <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                            <div className="md:col-span-2">
                                <Input label="Address" name="address" value={formData.address} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Branch</label>
                                <select name="hotelId" value={formData.hotelId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="Colombo">Colombo</option>
                                    <option value="Kandy">Kandy</option>
                                    <option value="Jaffna">Jaffna</option>
                                    <option value="Vavuniya">Vavuniya</option>
                                    <option value="Galle">Galle</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
                                <select name="taskType" value={formData.taskType} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="housekeeping">Housekeeping</option>
                                    <option value="room_service">Room Service</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 mt-4">
                                <Button type="submit" className="w-full">Create Staff Account</Button>
                            </div>
                        </form>
                    </Card>
                )}

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role Info</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Workload</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {staff.map((s) => {
                                    const workload = tasks.filter(t => (t.assignedTo?._id === s._id || t.assignedTo === s._id) && t.status !== 'completed').length
                                    return (
                                        <tr key={s._id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{s.name}</div>
                                                        <div className="text-xs text-gray-500">{s.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs">
                                                    <span className="font-semibold text-gray-600">Branch:</span> {s.hotelId}
                                                </div>
                                                <div className="text-xs">
                                                    <span className="font-semibold text-gray-600">Type:</span> {s.taskType}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${workload > 0 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                                                    {workload} Active Tasks
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                                <Button size="sm" onClick={() => handleAssignClick(s)} className="bg-purple-600 hover:bg-purple-700">
                                                    + Assign Task
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleViewTasksClick(s)}>
                                                    View Tasks
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Assign Task Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fade-in-up">
                        <h3 className="text-xl font-bold mb-4">Assign Task to {selectedStaff?.name}</h3>
                        <form onSubmit={handleTaskSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24"
                                    value={taskData.description}
                                    onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                                    placeholder="What needs to be done?"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        value={taskData.priority}
                                        onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        value={taskData.type}
                                        onChange={(e) => setTaskData({ ...taskData, type: e.target.value })}
                                    >
                                        <option value="housekeeping">Housekeeping</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="room_service">Room Service</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Assign Task</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Tasks Modal */}
            {isViewTasksModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 animate-fade-in-up max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Tasks: {selectedStaff?.name}</h3>
                            <Button size="sm" variant="outline" onClick={() => setViewTasksModalOpen(false)}>Close</Button>
                        </div>

                        {staffTasks.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No tasks assigned.</p>
                        ) : (
                            <div className="space-y-4">
                                {staffTasks.map(task => (
                                    <div key={task._id} className="border p-4 rounded-lg flex justify-between items-start bg-gray-50">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>{task.priority}</span>
                                                <span className="text-xs font-mono text-gray-500">{new Date(task.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="font-medium text-gray-900">{task.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">Type: {task.type}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full mb-2 ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {task.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}

export default ManageStaffPage
