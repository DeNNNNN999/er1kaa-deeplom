import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Package, DollarSign, Map, Calendar, Star } from 'lucide-react'

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Требуется авторизация')
        setLoading(false)
        return
      }

      console.log('Запрос аналитики...')
      const response = await fetch('http://localhost:5000/api/admin/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        let errorMessage = 'Ошибка сервера'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // Если ответ не в формате JSON
          const errorText = await response.text()
          console.error('Текст ошибки:', errorText)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Получены данные аналитики:', data)

      // Безопасно устанавливаем данные, гарантируя что у нас есть нужная структура
      setStats({
        totalRevenue: data.totalRevenue || 0,
        activeTours: data.activeTours || 0,
        newUsers: data.newUsers || 0,
        salesGrowth: data.salesGrowth || 0,
        popularTours: Array.isArray(data.popularTours) ? data.popularTours : [],
        categoryStats: Array.isArray(data.categoryStats) ? data.categoryStats : [],
        monthlySales: Array.isArray(data.monthlySales) ? data.monthlySales : [],
        countrySales: Array.isArray(data.countrySales) ? data.countrySales : [],
        tourRatings: Array.isArray(data.tourRatings) ? data.tourRatings : [],
      })
    } catch (err) {
      console.error('Ошибка при загрузке аналитики:', err)
      setError(err.message || 'Ошибка при загрузке аналитики')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center">Загрузка...</div>
  if (error) return <div className="text-center text-red-500">{error}</div>
  if (!stats) return null

  const cards = [
    {
      title: 'Общая выручка',
      value: `${stats.totalRevenue} ₽`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Активных туров',
      value: stats.activeTours,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Новых клиентов',
      value: stats.newUsers,
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Рост продаж',
      value: `${stats.salesGrowth}%`,
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="overflow-hidden bg-white rounded-lg shadow-lg"
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Продажи по месяцам */}
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
            <Calendar className="w-5 h-5 mr-2" />
            Продажи по месяцам
          </h3>
          <div className="space-y-4">
            {stats.monthlySales.map((month) => (
              <div key={month.month} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{month.month}</span>
                  <span className="font-medium text-gray-900">
                    {month.revenue} ₽
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${month.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Продажи по странам */}
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
            <Map className="w-5 h-5 mr-2" />
            Продажи по странам
          </h3>
          <div className="space-y-4">
            {stats.countrySales.map((country) => (
              <div key={country.country} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{country.country}</span>
                  <span className="font-medium text-gray-900">
                    {country.revenue} ₽
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-green-600 rounded-full"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Рейтинги туров */}
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
            <Star className="w-5 h-5 mr-2" />
            Рейтинги туров
          </h3>
          <div className="space-y-4">
            {stats.tourRatings.map((tour) => (
              <div key={tour.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{tour.title}</p>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < tour.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                      ({tour.reviewCount} отзывов)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Популярные туры
          </h3>
          <div className="space-y-4">
            {stats.popularTours.map((tour, index) => (
              <div
                key={tour.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <span className="mr-4 text-lg font-bold text-gray-400">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{tour.title}</p>
                    <p className="text-sm text-gray-500">{tour.bookings} бронирований</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {tour.revenue} ₽
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Продажи по категориям
          </h3>
          <div className="space-y-4">
            {stats.categoryStats.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{category.name}</span>
                  <span className="font-medium text-gray-900">
                    {category.revenue} ₽
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
