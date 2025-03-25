import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, User } from 'lucide-react'

export default function ReviewList({ tourId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchReviews()
  }, [tourId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/tour/${tourId}`)
      const data = await response.json()
      setReviews(data)
    } catch (err) {
      setError('Ошибка при загрузке отзывов')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-4">Загрузка отзывов...</div>
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-gray-900">
        Отзывы ({reviews.length})
      </h3>

      {reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Пока нет отзывов об этом туре
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 p-4 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">
                    {review.User.firstName} {review.User.lastName}
                  </span>
                </div>
                <div className="flex items-center">
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
              {review.comment && (
                <p className="mt-2 text-gray-600">{review.comment}</p>
              )}
              <div className="mt-2 text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}