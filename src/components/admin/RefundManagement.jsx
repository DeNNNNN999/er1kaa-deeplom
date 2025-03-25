import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Check, X, DollarSign } from 'lucide-react'

export default function RefundManagement() {
  const [refunds, setRefunds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRefunds()
  }, [])

  const fetchRefunds = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/admin/refunds', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setRefunds(data)
    } catch (err) {
      setError('Ошибка при загрузке возвратов')
    } finally {
      setLoading(false)
    }
  }

  const handleRefund = async (refundId, status) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/refunds/${refundId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Ошибка при обработке возврата')
      
      fetchRefunds()
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
          Управление возвратами
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Бронирование
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Клиент
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сумма
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Причина
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
            {refunds.map(refund => (
              <motion.tr
                key={refund.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {refund.booking.tour.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {refund.booking.id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {refund.booking.user.firstName} {refund.booking.user.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {refund.booking.user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {refund.amount} ₽
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {refund.reason}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    refund.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : refund.status === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {refund.status === 'PENDING' ? 'Ожидает' :
                     refund.status === 'APPROVED' ? 'Одобрен' : 'Отклонен'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {refund.status === 'PENDING' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRefund(refund.id, 'APPROVED')}
                        className="text-green-600 hover:text-green-900"
                        title="Одобрить возврат"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRefund(refund.id, 'REJECTED')}
                        className="text-red-600 hover:text-red-900"
                        title="Отклонить возврат"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}