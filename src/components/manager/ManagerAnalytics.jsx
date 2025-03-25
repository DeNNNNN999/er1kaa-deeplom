import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react'

export default function ManagerAnalytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/manager/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError('Ошибка при загрузке аналитики')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center">Загрузка...</div>
  if (error) return <div className="text-red-500 text-center">{error}</div>
  if (!stats) return null

  const cards = [
    {
      title: 'Активные туры',
      value: stats.activeTours,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Бронирований',
      value: stats.totalBookings,
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Средний рейтинг',
      value: `${stats.averageRating.toFixed(1)} / 5.0`,
      icon: TrendingUp,
      color: 'bg-yellow-500'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${card.color}`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {card.value}
                  </h3>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Популярные туры
          </h3>
          <div className="space-y-4">
            {stats.popularTours.map((tour, index) => (
              <div
                key={tour.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <span className="text-lg font-bold text-gray-400 mr-4">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{tour.title}</p>
                    <p className="text-sm text-gray-500">{tour.bookings} бронирований</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Последние отзывы
          </h3>
          <div className="space-y-4">
            {stats.recentReviews.map((review) => (
              <div key={review.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-900">{review.tourTitle}</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
                <p className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}