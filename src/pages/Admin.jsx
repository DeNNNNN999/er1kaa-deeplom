import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { 
  Users, 
  Map, 
  Package, 
  BarChart3, 
  DollarSign, 
  Globe, 
  RefreshCw, 
  Calendar, 
  Shield, 
  User, 
  Settings, 
  AlertTriangle, 
  ChevronRight, 
  Lock
} from 'lucide-react'
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [floatingIcons, setFloatingIcons] = useState([])
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  
  const containerRef = useRef(null)
  
  // Эффект для создания и управления анимированными иконками
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        createFloatingIcon();
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Эффект отслеживания положения мыши для интерактивности
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Создаем плавающую иконку для анимации
  const createFloatingIcon = () => {
    const iconComponents = [Users, Map, Package, BarChart3, DollarSign, Globe, RefreshCw];
    const IconComponent = iconComponents[Math.floor(Math.random() * iconComponents.length)];
    
    const newIcon = {
      id: Date.now(),
      icon: IconComponent,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 12 + 8,
      rotate: Math.random() * 360,
      duration: Math.random() * 2 + 2
    }
    
    setFloatingIcons(prev => [...prev, newIcon]);
    
    setTimeout(() => {
      setFloatingIcons(prev => prev.filter(icon => icon.id !== newIcon.id));
    }, newIcon.duration * 1000);
  }
  
  // Получаем градиент подсветки на основе положения мыши
  const getGlowGradient = () => {
    if (!containerRef.current) return '';
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    const centerX = mousePosition.x / width * 100;
    const centerY = mousePosition.y / height * 100;
    
    return `radial-gradient(circle at ${centerX}% ${centerY}%, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.05) 25%, rgba(0, 0, 0, 0) 50%)`;
  };
  
  // Показать уведомление
  const showNotificationMessage = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const tabs = [
    { id: 'users', name: 'Пользователи', icon: Users, color: 'from-pink-500 to-rose-600' },
    { id: 'tours', name: 'Туры', icon: Map, color: 'from-blue-500 to-indigo-600' },
    { id: 'categories', name: 'Категории', icon: Package, color: 'from-amber-500 to-orange-600' },
    { id: 'analytics', name: 'Аналитика', icon: BarChart3, color: 'from-teal-500 to-green-600' },
    { id: 'discounts', name: 'Скидки', icon: DollarSign, color: 'from-purple-500 to-fuchsia-600' },
    { id: 'locations', name: 'Локации', icon: Globe, color: 'from-cyan-500 to-sky-600' },
    { id: 'refunds', name: 'Возвраты', icon: RefreshCw, color: 'from-red-500 to-rose-600' },
    { id: 'bookings', name: 'Бронирования', icon: Calendar, color: 'from-lime-500 to-green-600' }
  ]
  
  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="relative overflow-hidden max-w-md mx-auto px-8 py-12 rounded-2xl text-center"
        >
          {/* Стеклянный фон */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10 backdrop-blur-sm rounded-2xl z-0"></div>
          
          {/* Блестящая рамка */}
          <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-red-400/30 via-transparent to-rose-500/30 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="mb-6 w-20 h-20 rounded-full bg-red-100 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-red-600 mb-3">Доступ запрещен</h2>
            <p className="text-gray-600">У вас нет прав для доступа к панели администратора</p>
            
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center mt-6 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg shadow-md"
            >
              <span>Вернуться на главную</span>
              <ChevronRight className="ml-2 w-4 h-4" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[80vh] px-4 py-8 max-w-6xl mx-auto"
      style={{
        backgroundImage: getGlowGradient(),
      }}
    >
      {/* Плавающие иконки */}
      <AnimatePresence>
        {floatingIcons.map((icon) => {
          const IconComponent = icon.icon;
          return (
            <motion.div 
              key={icon.id}
              className="absolute pointer-events-none z-10 text-pink-200/30"
              initial={{ 
                opacity: 0, 
                x: `${icon.x}%`, 
                y: `${icon.y}%`,
                rotate: icon.rotate,
                scale: 0
              }}
              animate={{ 
                opacity: [0, 0.7, 0],
                y: [`${icon.y}%`, `${icon.y - 15}%`],
                scale: [0, 1, 0.5]
              }}
              transition={{ 
                duration: icon.duration,
                ease: "easeInOut"
              }}
              style={{
                width: `${icon.size}px`,
                height: `${icon.size}px`
              }}
            >
              <IconComponent className="w-full h-full" />
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {/* Уведомление */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 rounded-lg px-5 py-4 bg-pink-500/90 backdrop-blur-sm text-white shadow-lg flex items-center"
          >
            <Shield className="w-5 h-5 mr-2" />
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Заголовок с логотипом */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 8 }}
          className="w-24 h-24 mx-auto mb-6 relative"
        >
          {/* Пульсирующий фон */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400/20 to-rose-500/20 blur-lg"
          />
          
          {/* Вращающееся кольцо */}
          <motion.div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, rgba(236, 72, 153, 0), rgba(236, 72, 153, 0.7), rgba(219, 39, 119, 0.7), rgba(236, 72, 153, 0))'
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Центральная иконка */}
          <div className="absolute inset-2 rounded-full backdrop-blur-md bg-white/10 flex items-center justify-center">
            <motion.div 
              className="text-pink-500"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0, -5, 0] 
              }}
              transition={{ 
                scale: { duration: 3, repeat: Infinity, repeatType: 'reverse' },
                rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Lock className="w-12 h-12" />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600 mb-3"
        >
          Панель администратора
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center text-gray-600"
        >
          <User className="w-4 h-4 mr-1.5" />
          <span>Добро пожаловать, {user.firstName} {user.lastName}</span>
        </motion.div>
      </div>
      
      {/* Панель с табами */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-2xl mb-8"
      >
        {/* Стеклянный фон */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl z-0"></div>
        
        {/* Блестящая рамка */}
        <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-pink-400/30 via-transparent to-rose-500/30 pointer-events-none"></div>
        
        <div className="relative z-10 py-2 px-2 flex flex-wrap justify-center md:justify-start gap-2">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (index * 0.05) }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative rounded-xl px-4 py-3 flex items-center ${
                activeTab === tab.id ? 'text-white' : 'text-gray-700 hover:text-pink-600'
              }`}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabBackground"
                  className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl shadow-md -z-10`}
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <tab.icon className="w-5 h-5 mr-2" />
              <span className="font-medium">{tab.name}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
      
      {/* Основное содержимое */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative overflow-hidden rounded-2xl min-h-[500px]"
      >
        {/* Стеклянный фон */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl z-0"></div>
        
        {/* Блестящая рамка */}
        <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-pink-400/30 via-transparent to-rose-500/30 pointer-events-none"></div>
        
        {/* Случайные блики */}
        <div className="absolute -top-60 -right-60 w-96 h-96 bg-pink-400/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-60 -left-60 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative p-6 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'tours' && <TourManagement />}
              {activeTab === 'categories' && <CategoryManagement />}
              {activeTab === 'analytics' && <Analytics />}
              {activeTab === 'discounts' && <DiscountManagement />}
              {activeTab === 'locations' && <LocationManagement />}
              {activeTab === 'refunds' && <RefundManagement />}
              {activeTab === 'bookings' && <BookingManagement />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Нижняя панель */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 flex items-center justify-between text-sm text-gray-500"
      >
        <div className="flex items-center">
          <Shield className="w-4 h-4 mr-1.5 text-pink-500" />
          <span>Режим администратора</span>
        </div>
        
        <div className="flex items-center">
          <Settings className="w-4 h-4 mr-1.5 text-pink-500" />
          <span>Туристический сервис</span>
        </div>
      </motion.div>
    </div>
  )
}