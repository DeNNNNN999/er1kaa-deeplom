import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

export default function ReviewForm({ tourId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Пожалуйста, выберите рейтинг')
      return
    }

    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tourId,
          rating,
          comment
        })
      })

      const data = await response.json()
      
      if (!response.ok) throw new Error(data.message)
      
      setRating(0)
      setComment('')
      onReviewSubmitted()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-md space-y-4"
      onSubmit={handleSubmit}
    >
      <h3 className="text-xl font-semibold text-gray-900">
        Оставить отзыв
      </h3>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Рейтинг
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`w-6 h-6 ${
                  value <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-gray-700"
        >
          Комментарий
        </label>
        <textarea
          id="comment"
          rows="4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Поделитесь своими впечатлениями..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Отправка...' : 'Отправить отзыв'}
      </button>
    </motion.form>
  )
}