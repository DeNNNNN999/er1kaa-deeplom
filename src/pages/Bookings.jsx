import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  DollarSign, 
  Briefcase,
  Trash, 
  CheckCircle, 
  AlertCircle, 
  Plane, 
  Ship, 
  CreditCard, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Search,
  Hourglass,
  Loader
} from 'lucide-react'

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedBooking, setExpandedBooking] = useState(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [floatingIcons, setFloatingIcons] = useState([])
  
  const containerRef = useRef(null)
  const searchRef = useRef(null)
  
  // Эффект для создания и управления анимированными иконками
  useEffect(() => {
    // Создаем случайные туристические иконки для анимации
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
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
  
  // Создаем туристическую иконку для анимации
  const createFloatingIcon = () => {
    const iconComponents = [Plane, Ship, CreditCard, Briefcase];
    const IconComponent = iconComponents[Math.floor(Math.random() * iconComponents.length)];
    
    const newIcon = {
      id: Date.now(),
      icon: IconComponent,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 14 + 8,
      rotate: Math.random() * 360,
      duration: Math.random() * 2 + 2
    }
    
    setFloatingIcons(prev => [...prev, newIcon]);
    
    setTimeout(() => {
      setFloatingIcons(prev => prev.filter(icon => icon.id !== newIcon.id));
    }, newIcon.duration * 1000);
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Требуется авторизация')
      }

      console.log('Отправка запроса на получение бронирований...')
      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Логируем статус ответа для отладки
      console.log('Получен ответ со статусом:', response.status)

      // Если ответ не успешный, обрабатываем ошибку
      if (!response.ok) {
        // Пытаемся получить текст ошибки из ответа
        let errorText
        try {
          const errorData = await response.json()
          errorText = errorData.message || 'Неизвестная ошибка'
        } catch (e) {
          errorText = 'Ошибка сервера'
        }
        throw new Error(errorText)
      }

      // Получаем и обрабатываем данные
      const data = await response.json()
      console.log('Получены данные бронирований:', data)

      // Убедимся, что data - массив
      setBookings(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Ошибка при загрузке бронирований:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token')
      
      // Анимация начала процесса отмены
      if (containerRef.current) {
        // Находим карточку бронирования, которую отменяем
        const bookingCard = containerRef.current.querySelector(`[data-booking-id="${bookingId}"]`);
        if (bookingCard) {
          // Добавляем эффект тряски
          gsap.to(bookingCard, {
            x: [0, -5, 5, -5, 5, 0],
            duration: 0.4,
            ease: "power2.inOut"
          });
        }
      }
      
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      // Удаляем бронирование из списка
      setBookings(bookings.filter(booking => booking.id !== bookingId))
      
      // Закрываем диалог подтверждения
      setShowCancelConfirm(null)
      
      // Показываем сообщение об успешной отмене
      setSuccessMessage('Бронирование успешно отменено')
      setShowSuccess(true)
      
      // Скрываем сообщение через 3 секунды
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
      
    } catch (err) {
      alert(err.message)
    }
  }
  
  // Фильтруем бронирования по поисковому запросу
  const filteredBookings = bookings.filter(booking => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        booking.Tour.title.toLowerCase().includes(searchLower) ||
        booking.Tour.location?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })
  
  // Функция для получения цвета статуса
  const getStatusColor = (status) => {
    switch(status) {
      case 'CONFIRMED': return 'from-green-500 to-emerald-400';
      case 'PENDING': return 'from-yellow-500 to-amber-400';
      case 'COMPLETED': return 'from-blue-500 to-sky-400';
      case 'CANCELLED': return 'from-red-500 to-rose-400';
      default: return 'from-gray-500 to-slate-400';
    }
  }
  
  // Функция для получения текста статуса на русском языке
  const getStatusText = (status) => {
    switch(status) {
      case 'CONFIRMED': return 'Подтверждено';
      case 'PENDING': return 'В ожидании';
      case 'COMPLETED': return 'Завершено';
      case 'CANCELLED': return 'Отменено';
      default: return status;
    }
  }
  
  // Получаем градиент подсветки на основе положения мыши
  const getGlowGradient = () => {
    if (!containerRef.current) return '';
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    const centerX = mousePosition.x / width * 100;
    const centerY = mousePosition.y / height * 100;
    
    return `radial-gradient(circle at ${centerX}% ${centerY}%, rgba(56, 189, 248, 0.1) 0%, rgba(59, 130, 246, 0.05) 25%, rgba(0, 0, 0, 0) 50%)`;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[70vh]">
      <motion.div 
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Briefcase className="w-8 h-8 text-blue-500" />
        </div>
      </motion.div>
    </div>
  )
  
  if (error) return (
    <div className="text-center py-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-block p-6 bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/30"
      >
        <div className="flex items-center justify-center text-red-500 text-xl font-semibold mb-4">
          <AlertCircle className="w-6 h-6 mr-2" />
          {error}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchBookings}
          className="px-6 py-2 bg-red-500 text-white rounded-lg shadow-md"
        >
          Попробовать снова
        </motion.button>
      </motion.div>
    </div>
  )

  return (
    <div 
      ref={containerRef} 
      className="relative min-h-[80vh] px-4 py-8 overflow-hidden max-w-5xl mx-auto"
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
              className="absolute pointer-events-none z-10 text-blue-200/30"
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
      
      {/* Анимированный заголовок */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 8 }}
          className="w-20 h-20 mx-auto mb-6 relative"
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
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-lg"
          />
          
          {/* Вращающееся кольцо */}
          <motion.div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, rgba(56, 189, 248, 0), rgba(56, 189, 248, 0.7), rgba(99, 102, 241, 0.7), rgba(56, 189, 248, 0))'
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Центральная иконка */}
          <div className="absolute inset-2 rounded-full backdrop-blur-md bg-white/10 flex items-center justify-center">
            <motion.div 
              className="text-blue-500"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0, -5, 0] 
              }}
              transition={{ 
                scale: { duration: 3, repeat: Infinity, repeatType: 'reverse' },
                rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Briefcase className="w-10 h-10" />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
        >
          Мои бронирования
        </motion.h1>
      </div>
      
      {/* Поиск */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-md mx-auto mb-8"
      >
        <div 
          className={`relative rounded-full overflow-hidden transition-all duration-300 ${
            isSearchFocused 
              ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]' 
              : 'shadow-lg hover:shadow-xl'
          }`}
        >
          {/* Стеклянный фон для поиска */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-md border border-white/50 rounded-full z-0"></div>
          
          {/* Анимированное свечение при фокусе */}
          {isSearchFocused && (
            <motion.div 
              className="absolute inset-0 bg-blue-400/10 z-0"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 2
              }}
            />
          )}
          
          <div className="relative z-10 flex items-center">
            <div className="pl-5">
              <Search className="w-5 h-5 text-blue-500" />
            </div>
            <input
              ref={searchRef}
              type="text"
              placeholder="Поиск бронирований..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full py-3 px-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900"
            />
          </div>
        </div>
        
        {/* Количество найденных бронирований */}
        <AnimatePresence>
          {searchTerm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center mt-3 text-sm text-gray-600"
            >
              Найдено бронирований: {filteredBookings.length}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Сообщение об успешной операции */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 rounded-lg px-5 py-4 bg-green-500/90 backdrop-blur-sm text-white shadow-lg flex items-center"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Список бронирований */}
      <div className="space-y-6 relative z-10">
        {filteredBookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            data-booking-id={booking.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            whileHover={{ y: -5 }}
            className="relative overflow-hidden transform-gpu"
          >
            {/* Стеклянный фон карточки */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl z-0"></div>
            
            {/* Блестящая рамка */}
            <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-blue-400/30 via-transparent to-indigo-500/30 pointer-events-none"></div>
            
            {/* Индикатор статуса */}
            <div className={`absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b ${getStatusColor(booking.status)}`}></div>
            
            <div className="relative p-6 z-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {booking.Tour.title}
                  </h3>
                  
                  <div className="flex flex-wrap items-center text-sm text-gray-500 mb-3">
                    {booking.Tour.location && (
                      <div className="flex items-center mr-4 mb-1">
                        <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                        {booking.Tour.location}
                      </div>
                    )}
                    <div className="flex items-center mr-4 mb-1">
                      <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center mr-4 mb-1">
                      <Users className="w-4 h-4 mr-1 text-blue-500" />
                      {booking.participants} {booking.participants === 1 ? 'человек' : 'человека'}
                    </div>
                  </div>
                  
                  {/* Статус бронирования */}
                  <div className="flex items-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(booking.status)} text-white`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {getStatusText(booking.status)}
                    </div>
                    
                    {booking.Payment && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-400 text-white ml-2">
                        <CreditCard className="w-3 h-3 mr-1" />
                        Оплачено
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end mt-4 md:mt-0">
                  <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
                    {booking.totalPrice} ₽
                  </div>
                  
                  {/* Кнопка отмены для PENDING бронирований без оплаты */}
                  {booking.status === 'PENDING' && !booking.Payment && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowCancelConfirm(booking.id)}
                      className="flex items-center px-4 py-2 mt-3 text-white transition-colors bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-md"
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      <span>Отменить</span>
                    </motion.button>
                  )}
                </div>
              </div>
              
              {/* Кнопка "Подробнее" */}
              <div className="mt-4 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                  className="flex items-center text-blue-600 font-medium"
                >
                  {expandedBooking === booking.id ? (
                    <>
                      <span>Скрыть детали</span>
                      <ChevronUp className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      <span>Подробнее</span>
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </>
                  )}
                </motion.button>
              </div>
              
              {/* Дополнительная информация */}
              <AnimatePresence>
                {expandedBooking === booking.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-gray-200/50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Детали тура</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                            <span>Длительность: {booking.Tour.duration || 'Не указано'} дней</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2 text-blue-500" />
                            <span>Цена за человека: {booking.Tour.price || 'Не указано'} ₽</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Детали бронирования</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-blue-500" />
                            <span>Дата бронирования: {new Date(booking.bookingDate).toLocaleString()}</span>
                          </div>
                          {booking.Payment ? (
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
                              <span>Способ оплаты: {booking.Payment.paymentMethod === 'CARD' ? 'Банковская карта' : booking.Payment.paymentMethod}</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Hourglass className="w-4 h-4 mr-2 text-blue-500" />
                              <span>Статус оплаты: Не оплачено</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Диалог подтверждения отмены */}
              <AnimatePresence>
                {showCancelConfirm === booking.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-2xl z-20"
                  >
                    <div className="p-6 text-center">
                      <div className="mb-4 w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Подтвердите отмену</h3>
                      <p className="text-gray-600 mb-6">Вы уверены, что хотите отменить бронирование "{booking.Tour.title}"?</p>
                      <div className="flex space-x-4 justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowCancelConfirm(null)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                        >
                          Отмена
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => cancelBooking(booking.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md"
                        >
                          Подтвердить
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Случайные блики */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-400/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </motion.div>
        ))}

        {/* Пустой список */}
        {filteredBookings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden transform-gpu text-center py-16"
          >
            {/* Стеклянный фон */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl z-0"></div>
            
            {/* Блестящая рамка */}
            <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-blue-400/30 via-transparent to-indigo-500/30 pointer-events-none"></div>
            
            <div className="relative z-10">
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0, -5, 0] 
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "mirror"
                }}
                className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4"
              >
                <Briefcase className="w-8 h-8 text-blue-500/60" />
              </motion.div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? "Бронирования не найдены" : "У вас пока нет бронирований"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm 
                  ? "Попробуйте изменить параметры поиска или сбросить фильтры" 
                  : "Выберите интересующий вас тур и забронируйте его, чтобы он появился в этом списке"
                }
              </p>
              
              {searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchTerm('')}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md"
                >
                  Сбросить поиск
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}