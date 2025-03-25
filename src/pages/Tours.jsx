import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Users, Filter } from 'lucide-react'

export default function Tours() {
  const [tours, setTours] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    location: ''
  })

  useEffect(() => {
    fetchTours()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchTours = async () => {
    try {
      const queryParams = new URLSearchParams()
      if (filters.categoryId) queryParams.append('categoryId', filters.categoryId)
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice)
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice)
      if (filters.location) queryParams.append('location', filters.location)

      const response = await fetch('http://localhost:5000/api/tours')
      const data = await response.json()
      setTours(data)
    } catch (err) {
      setError('Ошибка при загрузке туров')
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async (tourId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tourId,
          participants: 1,
          bookingDate: new Date().toISOString()
        })
      })

      if (!response.ok) throw new Error('Failed to book tour')
      alert('Тур успешно забронирован!')
    } catch (err) {
      alert('Ошибка при бронировании тура')
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const applyFilters = (e) => {
    e.preventDefault()
    fetchTours()
  }

  if (loading) return <div className="text-center">Загрузка...</div>
  if (error) return <div className="text-red-500 text-center">{error}</div>

  return (
    <div className="space-y-8">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold text-gray-900 text-center"
      >
        Доступные туры
      </motion.h1>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-lg mb-8"
        onSubmit={applyFilters}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Категория
            </label>
            <select
              name="categoryId"
              value={filters.categoryId}
              onChange={handleFilterChange}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Все категории</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Мин. цена
            </label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Макс. цена
            </label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              min="0"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Применить фильтры
            </button>
          </div>
        </div>
      </motion.form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour, index) => (
          <motion.div
            key={tour.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            {tour.imageUrl && (
              <img
                src={tour.imageUrl}
                alt={tour.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">{tour.title}</h3>
              <p className="text-gray-600 line-clamp-2">{tour.description}</p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {tour.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {tour.duration} дней
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  до {tour.maxParticipants} человек
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <span className="text-2xl font-bold text-blue-600">
                  {tour.price} ₽
                </span>
                <Link
                  to={`/tours/${tour.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  Подробнее
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}