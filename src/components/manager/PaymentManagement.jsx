import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Check, X, CreditCard } from 'lucide-react'

export default function PaymentManagement() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/manager/payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setPayments(data)
    } catch (err) {
      setError('Ошибка при загрузке платежей')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentStatus = async (paymentId, status) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/manager/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Ошибка при обработке платежа')
      
      fetchPayments()
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
          Управление платежами
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
                Метод оплаты
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
            {payments.map(payment => (
              <motion.tr
                key={payment.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {payment.Booking.Tour.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {payment.Booking.id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {payment.Booking.User.firstName} {payment.Booking.User.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {payment.Booking.User.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm font-medium text-gray-900">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {payment.amount}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {payment.paymentMethod}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {payment.status === 'PENDING' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePaymentStatus(payment.id, 'COMPLETED')}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Подтвердить"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handlePaymentStatus(payment.id, 'FAILED')}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Отклонить"
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