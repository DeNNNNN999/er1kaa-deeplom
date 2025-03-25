import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react'

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState([])
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState(null)
  const [formData, setFormData] = useState({
    tourId: '',
    percentage: '',
    startDate: '',
    endDate: '',
    description: ''
  })

  useEffect(() => {
    fetchDiscounts()
    fetchTours()
  }, [])

  const fetchDiscounts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/admin/discounts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setDiscounts(data)
    } catch (err) {
      setError('Ошибка при загрузке скидок')
    } finally {
      setLoading(false)
    }
  }

  const fetchTours = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tours')
      const data = await response.json()
      setTours(data)
    } catch (err) {
      console.error('Ошибка при загрузке туров:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const url = editingDiscount
        ? `http://localhost:5000/api/admin/discounts/${editingDiscount.id}`
        : 'http://localhost:5000/api/admin/discounts'
      
      const response = await fetch(url, {
        method: editingDiscount ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Ошибка при сохранении скидки')
      
      fetchDiscounts()
      setShowForm(false)
      setEditingDiscount(null)
      setFormData({
        tourId: '',
        percentage: '',
        startDate: '',
        endDate: '',
        description: ''
      })
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (discountId) => {
    if (!confirm('Вы уверены, что хотите удалить эту скидку?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/discounts/${discountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Ошибка при удалении скидки')
      
      fetchDiscounts()
    } catch (err) {
      alert(err.message)
    }
  }

  const startEdit = (discount) => {
    setEditingDiscount(discount)
    setFormData({
      tourId: discount.tourId,
      percentage: discount.percentage,
      startDate: new Date(discount.startDate).toISOString().split('T')[0],
      endDate: new Date(discount.endDate).toISOString().split('T')[0],
      description: discount.description || ''
    })
    setShowForm(true)
  }

  if (loading) return <div className="text-center">Загрузка...</div>
  if (error) return <div className="text-red-500 text-center">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Управление скидками
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Добавить скидку
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Тур
                </label>
                <select
                  value={formData.tourId}
                  onChange={(e) => setFormData({ ...formData, tourId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  required
                >
                  <option value="">Выберите тур</option>
                  {tours.map(tour => (
                    <option key={tour.id} value={tour.id}>
                      {tour.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Процент скидки
                </label>
                <input
                  type="number"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  required
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Дата начала
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Дата окончания
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingDiscount(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingDiscount ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {discounts.map(discount => (
          <motion.div
            key={discount.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {discount.Tour.title}
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  -{discount.percentage}%
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(discount.startDate).toLocaleDateString()} - {new Date(discount.endDate).toLocaleDateString()}
                </div>
                {discount.description && (
                  <p className="text-sm text-gray-600">
                    {discount.description}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => startEdit(discount)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(discount.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}