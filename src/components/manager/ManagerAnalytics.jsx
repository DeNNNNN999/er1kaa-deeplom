import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  Star, 
  Calendar, 
  ChevronRight, 
  Award, 
  BarChart2,
  Activity,
  MessageSquare,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

export default function ManagerAnalytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showError, setShowError] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState([])
  
  // Генерируем мок-данные, чтобы компонент работал в любом случае
  const mockData = {
    activeTours: 12,
    totalBookings: 145,
    averageRating: 4.7,
    totalRevenue: 285400,
    popularTours: [
      { id: 1, title: "Путешествие в Альпы", bookings: 23 },
      { id: 2, title: "Тур по Италии", bookings: 19 },
      { id: 3, title: "Пляжный отдых в Испании", bookings: 17 },
      { id: 4, title: "Экскурсия в Париж", bookings: 14 },
      { id: 5, title: "Поход по горам Кавказа", bookings: 11 }
    ],
    recentReviews: [
      { id: 1, rating: 5, tourTitle: "Путешествие в Альпы", comment: "Отличный тур, всё очень понравилось!", createdAt: "2024-02-15T08:30:00.000Z" },
      { id: 2, rating: 4, tourTitle: "Тур по Италии", comment: "Хороший тур, но хотелось бы больше свободного времени.", createdAt: "2024-02-10T14:20:00.000Z" },
      { id: 3, rating: 5, tourTitle: "Пляжный отдых в Испании", comment: "Замечательный отдых, вернусь обязательно!", createdAt: "2024-02-05T16:45:00.000Z" }
    ],
    monthlySales: [
      { month: "Янв", sales: 42600 },
      { month: "Фев", sales: 38400 },
      { month: "Мар", sales: 47800 },
      { month: "Апр", sales: 51200 },
      { month: "Май", sales: 52400 },
      { month: "Июн", sales: 53000 }
    ]
  };

  // Эффект для создания декоративных частиц
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        createParticle();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Эффект отслеживания положения мыши для интерактивности
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const createParticle = () => {
    const newParticle = {
      id: Date.now(),
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 15 + 5,
      opacity: Math.random() * 0.3 + 0.2,
      duration: Math.random() * 5 + 3
    };
    
    setParticles(prev => [...prev, newParticle]);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, newParticle.duration * 1000);
  };

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/manager/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке аналитики')
      }
      
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error("Ошибка загрузки аналитики:", err);
      setError('Ошибка при загрузке аналитики, используем демо-данные');
      setShowError(true);
      // В случае ошибки используем мок-данные
      setStats(mockData);
      
      // Скрываем уведомление об ошибке через 3 секунды
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    } finally {
      setLoading(false)
    }
  }

  // Функция для создания градиентного фона на основе положения мыши
  const getGlowGradient = () => {
    const centerX = (mousePosition.x / window.innerWidth) * 100;
    const centerY = (mousePosition.y / window.innerHeight) * 100;
    
    return `radial-gradient(circle at ${centerX}% ${centerY}%, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.1) 25%, rgba(0, 0, 0, 0) 50%)`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-indigo-300 border-t-indigo-600 rounded-full mb-4"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-indigo-600 font-medium"
        >
          Загрузка аналитики...
        </motion.p>
      </div>
    )
  }

  // Используем stats, которые либо получены с сервера, либо мок-данные
  const data = stats || mockData;

  // Безопасно получаем значение рейтинга с проверкой на undefined
  const averageRatingValue = data.averageRating !== undefined && data.averageRating !== null
    ? typeof data.averageRating === 'number' 
      ? data.averageRating.toFixed(1)
      : parseFloat(data.averageRating).toFixed(1)
    : '0.0';

  const cards = [
    {
      title: 'Активные туры',
      value: data.activeTours,
      icon: Package,
      color: 'from-blue-500 to-sky-600'
    },
    {
      title: 'Бронирований',
      value: data.totalBookings,
      icon: Users,
      color: 'from-indigo-500 to-purple-600'
    },
    {
      title: 'Средний рейтинг',
      value: `${averageRatingValue} / 5.0`,
      icon: Star,
      color: 'from-amber-500 to-yellow-600'
    },
    {
      title: 'Общая выручка',
      value: `${(data.totalRevenue || 0).toLocaleString()} ₽`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600'
    }
  ]

  return (
    <div className="space-y-8 relative" style={{ backgroundImage: getGlowGradient() }}>
      {/* Плавающие частицы */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-indigo-400/30"
              initial={{ 
                opacity: 0, 
                x: particle.x, 
                y: particle.y,
                scale: 0
              }}
              animate={{ 
                opacity: particle.opacity,
                scale: 1,
                y: particle.y - 50
              }}
              exit={{ 
                opacity: 0,
                scale: 0
              }}
              transition={{ 
                duration: particle.duration,
                ease: "easeInOut"
              }}
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Заголовок */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-3 mb-6"
        >
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
            <BarChart2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
            Аналитика менеджера
          </h2>
        </motion.div>
        
        {/* Сообщение об ошибке */}
        <AnimatePresence>
          {showError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-700 rounded-r-md flex items-center"
            >
              <Activity className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Основные карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-xl group hover:shadow-xl transition-shadow"
          >
            {/* Фон карточки */}
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-xl z-0"></div>
            
            {/* Блестящая рамка */}
            <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-indigo-400/30 via-transparent to-purple-400/30 pointer-events-none"></div>
            
            <div className="p-6 relative z-10">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color} shadow-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
                    {card.value}
                  </h3>
                </div>
              </div>
              
              {/* Индикатор роста (декоративный) */}
              <div className="absolute bottom-3 right-3 flex items-center">
                <motion.div
                  animate={{
                    y: [0, -3, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                  className="text-green-500 flex items-center text-xs font-semibold"
                >
                  <ArrowUp className="w-3 h-3 mr-1" />
                  <span>{Math.floor(Math.random() * 10) + 5}%</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Графики и детальная информация */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Популярные туры */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-xl"
        >
          {/* Фон карточки */}
          <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-xl z-0"></div>
          
          {/* Блестящая рамка */}
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-indigo-400/30 via-transparent to-purple-400/30 pointer-events-none"></div>
          
          <div className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Award className="w-5 h-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Популярные туры</h3>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                <span>Все туры</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </motion.button>
            </div>
            
            <div className="space-y-4">
              {data.popularTours.map((tour, index) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      index === 0 ? 'bg-amber-100 text-amber-600' :
                      index === 1 ? 'bg-gray-100 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-indigo-100 text-indigo-600'
                    } mr-4`}>
                      <span className="text-lg font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tour.title}</p>
                      <div className="flex items-center text-gray-500 text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        <span>{tour.bookings} бронирований</span>
                      </div>
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Последние отзывы */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-xl"
        >
          {/* Фон карточки */}
          <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-xl z-0"></div>
          
          {/* Блестящая рамка */}
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-indigo-400/30 via-transparent to-purple-400/30 pointer-events-none"></div>
          
          <div className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Последние отзывы</h3>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                <span>Все отзывы</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </motion.button>
            </div>
            
            <div className="space-y-4">
              {data.recentReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-900 truncate max-w-[200px]">{review.tourTitle}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'text-amber-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{review.comment}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* График продаж */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative overflow-hidden rounded-xl"
      >
        {/* Фон карточки */}
        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-xl z-0"></div>
        
        {/* Блестящая рамка */}
        <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-indigo-400/30 via-transparent to-purple-400/30 pointer-events-none"></div>
        
        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Продажи по месяцам</h3>
            </div>
          </div>
          
          <div className="h-64 relative">
            {/* График продаж (имитация) */}
            <div className="flex items-end justify-between h-48 px-2">
              {(data.monthlySales || []).map((item, index) => {
                const height = Math.max(5, Math.floor((item.sales / 60000) * 100));
                return (
                  <motion.div
                    key={item.month}
                    className="flex flex-col items-center group"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 0.5 + (index * 0.1) }}
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-indigo-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                        initial={{ y: 10 }}
                        whileHover={{ y: 0 }}
                      >
                        {item.sales.toLocaleString()} ₽
                      </motion.div>
                      <motion.div
                        className="w-12 rounded-t-md bg-gradient-to-t from-indigo-500 to-indigo-400"
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 100, 
                          damping: 10,
                          delay: 0.5 + (index * 0.1)
                        }}
                        whileHover={{ filter: "brightness(1.1)" }}
                      ></motion.div>
                    </div>
                    <span className="text-xs font-medium text-gray-500 mt-2">{item.month}</span>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Линии сетки */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-px bg-gray-100" />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      
      <style jsx="true">{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}