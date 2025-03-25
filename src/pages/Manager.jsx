import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Map, Calendar, Users, BarChart3, MessageSquare, DollarSign } from 'lucide-react'
import TourManagement from '../components/admin/TourManagement'
import BookingManagement from '../components/admin/BookingManagement'
import ReviewManagement from '../components/manager/ReviewManagement'
import ManagerAnalytics from '../components/manager/ManagerAnalytics'
import TourDatesManagement from '../components/admin/TourDatesManagement'
import PaymentManagement from '../components/manager/PaymentManagement'

export default function Manager() {
  const [activeTab, setActiveTab] = useState('tours')
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))

  if (user?.role !== 'MANAGER') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Доступ запрещен</h2>
        <p className="mt-2 text-gray-600">У вас нет прав для доступа к панели менеджера</p>
      </div>
    )
  }

  const tabs = [
    { id: 'tours', name: 'Туры', icon: Map },
    { id: 'dates', name: 'Даты туров', icon: Calendar },
    { id: 'bookings', name: 'Бронирования', icon: Users },
    { id: 'payments', name: 'Платежи', icon: DollarSign },
    { id: 'reviews', name: 'Отзывы', icon: MessageSquare },
    { id: 'analytics', name: 'Статистика', icon: BarChart3 }
  ]

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold text-gray-900 text-center"
      >
        Панель менеджера
      </motion.h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-6 py-4 text-sm font-medium
                  ${activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'tours' && <TourManagement />}
          {activeTab === 'dates' && <TourDatesManagement />}
          {activeTab === 'bookings' && <BookingManagement />}
          {activeTab === 'payments' && <PaymentManagement />}
          {activeTab === 'reviews' && <ReviewManagement />}
          {activeTab === 'analytics' && <ManagerAnalytics />}
        </div>
      </div>
    </div>
  )
}