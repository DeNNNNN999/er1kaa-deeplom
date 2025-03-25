import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Users } from 'lucide-react'

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setBookings(data)
    } catch (err) {
      setError('Ошибка при загрузке бронирований')
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      
      setBookings(bookings.filter(booking => booking.id !== bookingId))
      alert('Бронирование успешно отменено')
    } catch (err) {
      alert(err.message)
    }
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
        Мои бронирования
      </motion.h1>

      <div className="space-y-4">
        {bookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {booking.Tour.title}
                </h3>
                <div className="mt-2 space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Статус: {booking.status}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {booking.participants} человек
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-blue-600">
                  {booking.totalPrice} ₽
                </span>
                {booking.status === 'PENDING' && !booking.Payment && (
                  <button
                    onClick={() => cancelBooking(booking.id)}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Отменить
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {bookings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 py-8"
          >
            У вас пока нет бронирований
          </motion.div>
        )}
      </div>
    </div>
  )
}