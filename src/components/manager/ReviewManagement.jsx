import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Check, X } from 'lucide-react'

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/manager/reviews', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setReviews(data)
    } catch (err) {
      setError('Ошибка при загрузке отзывов')
    } finally {
      setLoading(false)
    }
  }

  const handleModeration = async (reviewId, approved) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/manager/reviews/${reviewId}/moderate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved })
      })

      if (!response.ok) throw new Error('Ошибка при модерации отзыва')
      
      fetchReviews()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="text-center">Загрузка...</div>
  if (error) return <div className="text-red-500 text-center">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Модерация отзывов
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map(review => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {review.User.firstName} {review.User.lastName}
                  </span>
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
                <p className="text-sm text-gray-500 mt-1">
                  {review.Tour.title}
                </p>
                <p className="mt-2 text-gray-600">{review.comment}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              {!review.moderated && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleModeration(review.id, true)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                    title="Одобрить"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleModeration(review.id, false)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    title="Отклонить"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            {review.moderated && (
              <div className={`mt-2 text-sm ${
                review.approved ? 'text-green-600' : 'text-red-600'
              }`}>
                {review.approved ? 'Одобрен' : 'Отклонен'}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}