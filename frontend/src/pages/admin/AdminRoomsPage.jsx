"use client"

import { useState, useEffect } from "react"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"
import Input from "../../components/common/Input"
import * as roomService from "../../services/roomService"

const AdminRoomsPage = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "standard",
    price: "",
    discountPrice: "",
    maxOccupancy: "",
    size: "",
    description: "",
    amenities: "",
    images: "",
  })

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const data = await roomService.getAllRooms()
      setRooms(data)
    } catch (error) {
      console.error("Failed to fetch rooms:", error)
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const roomData = {
      ...formData,
      price: parseFloat(formData.price),
      discountPrice: parseFloat(formData.discountPrice),
      maxOccupancy: parseInt(formData.maxOccupancy),
      size: parseInt(formData.size),
      amenities: formData.amenities.split(",").map((a) => a.trim()).filter(a => a),
      images: formData.images.split(",").map((i) => i.trim()).filter(i => i),
      status: "available",
    }

    // Fallback image if none provided
    if (roomData.images.length === 0) {
      roomData.images = ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"];
    }

    try {
      if (editingId) {
        await roomService.updateRoom(editingId, roomData)
        alert("Room updated successfully!")
      } else {
        await roomService.createRoom(roomData)
        alert("Room created successfully!")
      }
      fetchRooms()
      setShowForm(false)
      setEditingId(null)
      resetForm()
    } catch (error) {
      console.error("Failed to save room:", error)
      alert("Failed to save room. Please try again.")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "standard",
      price: "",
      discountPrice: "",
      maxOccupancy: "",
      size: "",
      description: "",
      amenities: "",
      images: "",
    })
  }

  const handleEdit = (room) => {
    setFormData({
      name: room.name,
      type: room.type,
      price: room.price,
      discountPrice: room.discountPrice,
      maxOccupancy: room.maxOccupancy,
      size: room.size,
      description: room.description,
      amenities: room.amenities ? room.amenities.join(", ") : "",
      images: room.images ? room.images.join(", ") : "",
    })
    setEditingId(room._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) {
      return
    }

    try {
      await roomService.deleteRoom(id)
      alert("Room deleted successfully!")
      fetchRooms()
    } catch (error) {
      console.error("Failed to delete room:", error)
      alert("Failed to delete room. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Room Management</h1>
            <p className="text-gray-600 mt-2">Manage hotel rooms, pricing, and availability</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm)
              if (showForm) {
                setEditingId(null)
                resetForm()
              }
            }}
          >
            {showForm ? "Cancel" : "+ Add Room"}
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="p-8 mb-12 bg-white shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{editingId ? "Edit Room" : "Add New Room"}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Room Name" name="name" value={formData.name} onChange={handleChange} required />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="suite">Suite</option>
                    <option value="family">Family</option>
                    <option value="penthouse">Penthouse</option>
                  </select>
                </div>

                <Input
                  label="Regular Price ($)"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Discount Price ($)"
                  name="discountPrice"
                  type="number"
                  step="0.01"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Max Occupancy"
                  name="maxOccupancy"
                  type="number"
                  value={formData.maxOccupancy}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Room Size (sqft)"
                  name="size"
                  type="number"
                  value={formData.size}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter room description..."
                />
              </div>

              <Input
                label="Amenities (comma-separated)"
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                placeholder="WiFi, Air Conditioning, TV, Mini Bar"
                containerClassName="w-full"
              />

              <Input
                label="Image URLs (comma-separated)"
                name="images"
                value={formData.images}
                onChange={handleChange}
                placeholder="https://example.com/room1.jpg, https://example.com/room2.jpg"
                containerClassName="w-full"
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit">{editingId ? "Update Room" : "Create Room"}</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Rooms Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No rooms yet</h3>
            <p className="text-gray-600 mb-6">Create your first room to get started</p>
            <Button onClick={() => setShowForm(true)}>+ Add First Room</Button>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Name</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Type</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Price</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Discount</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Occupancy</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {room.images && room.images[0] && (
                          <img
                            src={room.images[0]}
                            alt={room.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <span className="text-gray-900 font-semibold">{room.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      <span className="line-through text-gray-400">${room.price}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-900 font-bold">${room.discountPrice}</td>
                    <td className="py-4 px-4 text-gray-600">{room.maxOccupancy} guests</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${room.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(room)}>
                        ✏️ Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(room._id)}>
                        🗑️ Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default AdminRoomsPage
