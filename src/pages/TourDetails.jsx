import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Users, Star, DollarSign, CreditCard } from 'lucide-react'
import ReviewList from '../components/ReviewList'
import ReviewForm from '../components/ReviewForm'

export default function TourDetails() {
  const { id } = useParams()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [participants, setParticipants] = useState(1)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CARD')
  const [bookingId, setBookingId] = useState(null)

  useEffect(() => {
    fetchTourDetails()
  }, [id])

  const fetchTourDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tours/${id}`)
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.message)
      
      setTour(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    try {
      const token = localStorage.getItem('token')
      const bookingResponse = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tourId: id,
          participants,
          bookingDate: new Date().toISOString()
        })
      })
      
      const bookingData = await bookingResponse.json()
      
      if (!bookingResponse.ok) throw new Error(bookingData.message)
      
      setBookingId(bookingData.id)
      setShowPayment(true)
    } catch (err) {
      alert(err.message)
    }
  }

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId,
          paymentMethod
        })
      })

      const data = await response.json()
      
      if (!response.ok) throw new Error(data.message)
      
      alert('Оплата прошла успешно!')
      setShowPayment(false)
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="text-center">Загрузка...</div>
  if (error) return <div className="text-red-500 text-center">{error}</div>
  if (!tour) return <div className="text-center">Тур не найден</div>

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {tour.imageUrl && (
          <img
            src={tour.imageUrl}
            alt={tour.title}
            className="w-full h-96 object-cover"
          />
        )}

        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <h1 className="text-4xl font-bold text-gray-900">{tour.title}</h1>
            <span className="text-3xl font-bold text-blue-600">{tour.price} ₽</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2" />
              {tour.location}
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              {tour.duration} дней
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-2" />
              до {tour.maxParticipants} человек
            </div>
            <div className="flex items-center text-gray-600">
              <Star className="w-5 h-5 mr-2" />
              4.5 (10 отзывов)
            </div>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900">Описание</h2>
            <p className="text-gray-600">{tour.description}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Забронировать тур</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Количество участников
              </label>
              <input
                type="number"
                min="1"
                max={tour.maxParticipants}
                value={participants}
                onChange={(e) => setParticipants(parseInt(e.target.value))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-gray-600">
                <p>Стоимость за человека: {tour.price} ₽</p>
                <p className="font-semibold">
                  Итого: {tour.price * participants} ₽
                </p>
              </div>
              <button
                onClick={handleBooking}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Забронировать
              </button>
            </div>
          </div>

          {showPayment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-gray-50 p-6 rounded-lg"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Оплата бронирования
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Способ оплаты
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="CARD">Банковская карта</option>
                    <option value="CASH">Наличные</option>
                  </select>
                </div>
                <button
                  onClick={handlePayment}
                  className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Оплатить {tour.price * participants} ₽
                </button>
              </div>
            </motion.div>
          )}

          <div className="mt-12">
            <ReviewList tourId={id} />
          </div>

          <div className="mt-8">
            <ReviewForm
              tourId={id}
              onReviewSubmitted={() => {
                // Обновляем список отзывов после добавления нового
                window.location.reload()
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}