import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Map, Package, BarChart3, DollarSign, Globe, RefreshCw, Calendar } from 'lucide-react'
import UserManagement from '../components/admin/UserManagement'
import TourManagement from '../components/admin/TourManagement'
import CategoryManagement from '../components/admin/CategoryManagement'
import Analytics from '../components/admin/Analytics'
import DiscountManagement from '../components/admin/DiscountManagement'
import LocationManagement from '../components/admin/LocationManagement'
import RefundManagement from '../components/admin/RefundManagement'
import BookingManagement from '../components/admin/BookingManagement'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users')
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Доступ запрещен</h2>
        <p className="mt-2 text-gray-600">У вас нет прав для доступа к панели администратора</p>
      </div>
    )
  }

  const tabs = [
    { id: 'users', name: 'Пользователи', icon: Users },
    { id: 'tours', name: 'Туры', icon: Map },
    { id: 'categories', name: 'Категории', icon: Package },
    { id: 'analytics', name: 'Аналитика', icon: BarChart3 },
    { id: 'discounts', name: 'Скидки', icon: DollarSign },
    { id: 'locations', name: 'Локации', icon: Globe },
    { id: 'refunds', name: 'Возвраты', icon: RefreshCw },
    { id: 'bookings', name: 'Бронирования', icon: Calendar }
  ]

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold text-gray-900 text-center"
      >
        Панель администратора
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
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'tours' && <TourManagement />}
          {activeTab === 'categories' && <CategoryManagement />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'discounts' && <DiscountManagement />}
          {activeTab === 'locations' && <LocationManagement />}
          {activeTab === 'refunds' && <RefundManagement />}
          {activeTab === 'bookings' && <BookingManagement />}
        </div>
      </div>
    </div>
  )
}