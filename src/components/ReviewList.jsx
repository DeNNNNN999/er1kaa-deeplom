import { useState, useEffect } from 'react'
import { Star, User, MessageCircle, ThumbsUp, Calendar, MoreHorizontal } from 'lucide-react'

export default function ReviewList({ tourId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedReview, setExpandedReview] = useState(null)

  useEffect(() => {
    if (tourId) {
      fetchReviews()
    }
  }, [tourId])

  const fetchReviews = async () => {
    if (!tourId) {
      setLoading(false)
      return;
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`http://localhost:5000/api/reviews/tour/${tourId}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Ошибка ответа сервера:', response.status, errorData)
        throw new Error(errorData.message || 'Ошибка при загрузке отзывов')
      }
      
      const data = await response.json()
      
      // Проверяем, что data - это массив
      if (Array.isArray(data)) {
        setReviews(data)
      } else {
        console.warn('Сервер вернул не массив:', data)
        setReviews([])
      }
    } catch (err) {
      console.error('Ошибка при загрузке отзывов:', err)
      setError('Ошибка при загрузке отзывов: ' + (err.message || 'Неизвестная ошибка'))
      setReviews([]) // Устанавливаем пустой массив в случае ошибки
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center py-10">
      <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
  
  if (error) return (
    <div className="text-center py-4">
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-gray-800">
          Отзывы ({reviews.length})
        </h3>
        
        {reviews.length > 0 && (
          <div className="flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm">
            <Star className="w-4 h-4 mr-1" />
            <span>4.5 в среднем</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="p-8 text-center rounded-lg bg-gray-50 border border-gray-200">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-blue-500" />
          </div>
          
          <p className="text-gray-500 font-medium">
            Пока нет отзывов об этом туре
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Станьте первым, кто оставит отзыв!
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-5 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900">
                      {review.User?.firstName || 'Гость'} {review.User?.lastName || ''}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {review.comment && (
                <div className="mt-3">
                  <div className="relative">
                    <p className={`text-gray-700 leading-relaxed ${expandedReview === review.id ? '' : 'line-clamp-2'}`}>
                      {review.comment}
                    </p>
                    
                    {review.comment.length > 150 && expandedReview !== review.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent"></div>
                    )}
                  </div>
                  
                  {review.comment.length > 150 && (
                    <button
                      onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
                      className="mt-2 text-sm text-blue-500 hover:text-blue-600 flex items-center"
                    >
                      <span>{expandedReview === review.id ? 'Свернуть' : 'Читать полностью'}</span>
                      <MoreHorizontal className="w-4 h-4 ml-1" />
                    </button>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-end mt-3">
                <button
                  className="flex items-center text-gray-500 hover:text-blue-500 text-sm"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  <span>Полезный отзыв</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}