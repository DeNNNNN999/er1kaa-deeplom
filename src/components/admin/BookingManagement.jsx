import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Check, 
  X, 
  AlertCircle
} from 'lucide-react'

export default function BookingManagement() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      // Определяем роль пользователя
      const user = JSON.parse(localStorage.getItem('user'))
      const apiUrl = user?.role === 'ADMIN' 
        ? 'http://localhost:5000/api/admin/bookings'
        : 'http://localhost:5000/api/manager/bookings'
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ошибка: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Проверка, что data - это массив
      if (!Array.isArray(data)) {
        console.error('Получены неверные данные:', data)
        throw new Error('API вернул неверный формат данных')
      }
      
      setBookings(data)
    } catch (err) {
      console.error('Ошибка при загрузке бронирований:', err)
      setError('Ошибка при загрузке бронирований: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      setUpdating(true)
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user'))
      const apiUrl = user?.role === 'ADMIN' 
        ? `http://localhost:5000/api/admin/bookings/${bookingId}/status`
        : `http://localhost:5000/api/manager/bookings/${bookingId}/status`
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Ошибка при обновлении статуса')
      }
      
      // Обновляем локальное состояние
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId ? { ...booking, status } : booking
        )
      )
    } catch (err) {
      console.error('Ошибка обновления статуса:', err)
      alert(err.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-3 text-indigo-600 font-medium">Загрузка бронирований...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Произошла ошибка</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchBookings}
                className="rounded bg-red-100 px-2 py-1.5 text-xs font-medium text-red-800 hover:bg-red-200"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Управление бронированиями
        </h2>
        <span className="text-gray-500 text-sm">
          Всего бронирований: {bookings.length}
        </span>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Нет бронирований</h3>
          <p className="mt-1 text-sm text-gray-500">Бронирования пока отсутствуют</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тур
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Клиент
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Участники
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map(booking => (
                <motion.tr
                  key={booking.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.Tour?.title || 'Без названия'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.User?.firstName || ''} {booking.User?.lastName || ''}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.User?.email || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'Не указана'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Users className="w-4 h-4 mr-2 text-gray-500" />
                      {booking.participants || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                      {booking.totalPrice?.toLocaleString() || 0} ₽
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status || 'Неизвестно'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={booking.status || ''}
                      onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      disabled={updating}
                    >
                      <option value="PENDING">Ожидает</option>
                      <option value="CONFIRMED">Подтверждено</option>
                      <option value="CANCELLED">Отменено</option>
                      <option value="COMPLETED">Завершено</option>
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}