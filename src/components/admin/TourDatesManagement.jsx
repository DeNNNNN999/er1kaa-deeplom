import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react'

export default function TourDatesManagement({ tourId }) {
  const [dates, setDates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingDate, setEditingDate] = useState(null)
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    availableSeats: '',
    status: 'SCHEDULED'
  })

  useEffect(() => {
    if (tourId) {
      fetchDates()
    }
  }, [tourId])

  const fetchDates = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/tour-dates/tour/${tourId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setDates(data)
    } catch (err) {
      setError('Ошибка при загрузке дат')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const url = editingDate
        ? `http://localhost:5000/api/admin/tour-dates/${editingDate.id}`
        : 'http://localhost:5000/api/admin/tour-dates'
      
      const response = await fetch(url, {
        method: editingDate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          tourId
        })
      })

      if (!response.ok) throw new Error('Ошибка при сохранении даты')
      
      fetchDates()
      setShowForm(false)
      setEditingDate(null)
      setFormData({
        startDate: '',
        endDate: '',
        availableSeats: '',
        status: 'SCHEDULED'
      })
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (dateId) => {
    if (!confirm('Вы уверены, что хотите удалить эту дату?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/tour-dates/${dateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Ошибка при удалении даты')
      
      fetchDates()
    } catch (err) {
      alert(err.message)
    }
  }

  const startEdit = (date) => {
    setEditingDate(date)
    setFormData({
      startDate: new Date(date.startDate).toISOString().split('T')[0],
      endDate: new Date(date.endDate).toISOString().split('T')[0],
      availableSeats: date.availableSeats,
      status: date.status
    })
    setShowForm(true)
  }

  if (loading) return <div className="text-center">Загрузка...</div>
  if (error) return <div className="text-red-500 text-center">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Даты проведения
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Добавить дату
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
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Доступных мест
                </label>
                <input
                  type="number"
                  value={formData.availableSeats}
                  onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Статус
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  required
                >
                  <option value="SCHEDULED">Запланирован</option>
                  <option value="IN_PROGRESS">В процессе</option>
                  <option value="COMPLETED">Завершен</option>
                  <option value="CANCELLED">Отменен</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingDate(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingDate ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        {dates.map(date => (
          <motion.div
            key={date.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
          >
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">
                  {new Date(date.startDate).toLocaleDateString()} - {new Date(date.endDate).toLocaleDateString()}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Мест: {date.availableSeats}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    date.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                    date.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                    date.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {date.status === 'SCHEDULED' ? 'Запланирован' :
                     date.status === 'IN_PROGRESS' ? 'В процессе' :
                     date.status === 'COMPLETED' ? 'Завершен' : 'Отменен'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => startEdit(date)}
                className="text-blue-600 hover:text-blue-900"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(date.id)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}