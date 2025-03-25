import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, User, Settings } from 'lucide-react'

export default function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-lg"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            TourGuide
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/tours"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Туры
            </Link>
            <Link
              to="/categories"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Категории
            </Link>
            <Link
              to="/bookings"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Мои бронирования
            </Link>
            {user?.role === 'MANAGER' && (
              <Link
                to="/manager"
                className="text-gray-600 hover:text-blue-600 transition-colors flex items-center"
              >
                <Settings className="w-5 h-5 mr-1" />
                Панель менеджера
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="text-gray-600 hover:text-blue-600 transition-colors flex items-center"
              >
                <Settings className="w-5 h-5 mr-1" />
                Админ панель
              </Link>
            )}
            
            <div className="flex items-center space-x-2 ml-4">
              <User className="w-5 h-5 text-gray-600" />
              <Link
                to="/profile"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                {user?.firstName}
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}