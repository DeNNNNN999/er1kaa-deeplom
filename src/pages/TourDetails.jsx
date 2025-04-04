import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  DollarSign, 
  CreditCard, 
  ChevronDown, 
  Camera, 
  Landmark, 
  Coffee, 
  Utensils, 
  Plane, 
  Map, 
  Globe, 
  Palmtree, 
  Sun, 
  Moon, 
  Cloud, 
  Umbrella,
  Check,
  CheckCircle
} from 'lucide-react'
import ReviewList from '../components/ReviewList'
import ReviewForm from '../components/ReviewForm'

export default function TourDetails() {
  const { id } = useParams()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [participants, setParticipants] = useState(1)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CARD')
  const [bookingId, setBookingId] = useState(null)
  const [activeTab, setActiveTab] = useState('description')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showSuccessBooking, setShowSuccessBooking] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [weatherIcons, setWeatherIcons] = useState([])
  const [showWeatherHint, setShowWeatherHint] = useState(false)
  const [isHoveringImage, setIsHoveringImage] = useState(false)
  const [userBookings, setUserBookings] = useState([])
  const [showTourCompletedMessage, setShowTourCompletedMessage] = useState(false)
  
  const mainRef = useRef(null)
  const imageRef = useRef(null)
  const bookingRef = useRef(null)

  useEffect(() => {
    fetchTourDetails()
    fetchUserBookings()
    
    // Создаем погодные иконки для анимаций
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        createWeatherIcon();
      }
    }, 3000);
    
    // Показываем подсказку о погоде через 4 секунды
    const weatherHintTimeout = setTimeout(() => {
      setShowWeatherHint(true);
      // Скрываем подсказку через 5 секунд
      const hideHintTimeout = setTimeout(() => {
        setShowWeatherHint(false);
      }, 5000);
      return () => clearTimeout(hideHintTimeout);
    }, 4000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(weatherHintTimeout);
    };
  }, [id])
  
  // Получаем бронирования пользователя для текущего тура
  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        return; // Пользователь не авторизован
      }
      
      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Ошибка при получении бронирований')
      }
      
      const data = await response.json()
      
      // Фильтруем только бронирования для текущего тура
      const tourBookings = data.filter(booking => booking.TourId === id)
      setUserBookings(tourBookings)
    } catch (error) {
      console.error('Ошибка при получении бронирований:', error)
    }
  }
  
  // Завершить тур
  const completeTour = async (bookingId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при завершении тура')
      }
      
      // Показываем сообщение об успехе
      setShowTourCompletedMessage(true)
      
      // Скрываем сообщение через 3 секунды
      setTimeout(() => {
        setShowTourCompletedMessage(false)
        // Обновляем список бронирований
        fetchUserBookings()
      }, 3000)
      
    } catch (error) {
      console.error('Ошибка при завершении тура:', error)
      alert(error.message)
    }
  }
  
  // Эффект отслеживания положения мыши для интерактивности
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (mainRef.current) {
        const rect = mainRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Создаем погодную иконку для анимации
  const createWeatherIcon = () => {
    if (!tour) return;
    
    const weatherIconComponents = [Sun, Moon, Cloud, Umbrella];
    const IconComponent = weatherIconComponents[Math.floor(Math.random() * weatherIconComponents.length)];
    
    const newIcon = {
      id: Date.now(),
      icon: IconComponent,
      x: Math.random() * 80 + 10,
      y: Math.random() * 30 + 5,
      size: Math.random() * 12 + 8,
      rotate: Math.random() * 360,
      duration: Math.random() * 2 + 3
    }
    
    setWeatherIcons(prev => [...prev, newIcon]);
    
    setTimeout(() => {
      setWeatherIcons(prev => prev.filter(icon => icon.id !== newIcon.id));
    }, newIcon.duration * 1000);
  }

  const fetchTourDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tours/${id}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.message)

      setTour(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    try {
      setShowPayment(false); // Сбрасываем предыдущее состояние
      
      // Анимируем кнопку бронирования
      if (bookingRef.current) {
        const button = bookingRef.current;
        gsap.to(button, {
          scale: 1.05, 
          duration: 0.2,
          yoyo: true,
          repeat: 1
        });
        
        // Создаем эффект частиц при нажатии
        createBookingParticles();
      }
      
      const token = localStorage.getItem('token')
      const bookingResponse = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tourId: id,
          participants,
          bookingDate: new Date().toISOString(),
        }),
      })

      const bookingData = await bookingResponse.json()

      if (!bookingResponse.ok) throw new Error(bookingData.message)

      setBookingId(bookingData.id)
      
      // Показываем анимацию успешного бронирования
      setShowSuccessBooking(true);
      
      // Скрываем анимацию через 2 секунды и показываем форму оплаты
      setTimeout(() => {
        setShowSuccessBooking(false);
        setShowPayment(true);
      }, 2000);
      
    } catch (err) {
      alert(err.message)
    }
  }
  
  // Создаем эффект частиц при бронировании
  const createBookingParticles = () => {
    if (!bookingRef.current) return;
    
    const particleCount = 20;
    const buttonRect = bookingRef.current.getBoundingClientRect();
    const container = document.createElement('div');
    container.className = 'absolute inset-0 overflow-hidden pointer-events-none z-50';
    mainRef.current.appendChild(container);
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 10 + 5;
      const color = `hsl(${Math.random() * 60 + 200}, 100%, 60%)`;
      
      particle.className = 'absolute rounded-full';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.boxShadow = `0 0 10px ${color}`;
      
      // Позиционируем частицы от центра кнопки
      const startX = buttonRect.left + buttonRect.width / 2 - mainRef.current.getBoundingClientRect().left;
      const startY = buttonRect.top + buttonRect.height / 2 - mainRef.current.getBoundingClientRect().top;
      
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 150 + 50;
      
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      
      particle.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 },
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0.1 },
          { 
            transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px))`,
            opacity: 0
          }
        ],
        {
          duration: Math.random() * 1000 + 800,
          easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
        }
      );
      
      container.appendChild(particle);
    }
    
    setTimeout(() => {
      mainRef.current.removeChild(container);
    }, 2000);
  };

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          paymentMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message)
      
      // Создаем эффект успешной оплаты
      const successAnimation = document.createElement('div');
      successAnimation.className = 'fixed inset-0 flex items-center justify-center z-[100]';
      successAnimation.innerHTML = `
        <div class="bg-green-500/20 backdrop-blur-md p-8 rounded-2xl flex flex-col items-center justify-center space-y-4">
          <div class="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div class="text-xl font-bold text-white">Оплата прошла успешно!</div>
        </div>
      `;
      
      document.body.appendChild(successAnimation);
      
      // Анимируем появление
      gsap.fromTo(successAnimation.firstElementChild, 
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
      
      // Удаляем анимацию через 2 секунды
      setTimeout(() => {
        gsap.to(successAnimation.firstElementChild, {
          scale: 0, 
          opacity: 0, 
          duration: 0.3,
          onComplete: () => {
            document.body.removeChild(successAnimation);
            setShowPayment(false);
          }
        });
      }, 2000);
      
    } catch (err) {
      alert(err.message)
    }
  }
  
  // Параллакс эффект для изображения
  const handleMouseMoveImage = (e) => {
    if (!imageRef.current) return;
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    
    gsap.to(imageRef.current, {
      transform: `scale(1.05) translate(${x * 15}px, ${y * 15}px)`,
      duration: 0.5
    });
  }
  
  const handleMouseLeaveImage = () => {
    if (!imageRef.current) return;
    
    gsap.to(imageRef.current, {
      transform: 'scale(1) translate(0, 0)',
      duration: 0.5
    });
  }
  
  // Получаем градиент подсветки для стеклянных элементов
  const getGlowGradient = () => {
    if (!mainRef.current) return '';
    
    const { width, height } = mainRef.current.getBoundingClientRect();
    const centerX = mousePosition.x / width * 100;
    const centerY = mousePosition.y / height * 100;
    
    return `radial-gradient(circle at ${centerX}% ${centerY}%, rgba(56, 189, 248, 0.3) 0%, rgba(59, 130, 246, 0.15) 20%, rgba(0, 0, 0, 0) 50%)`;
  }

  if (loading) return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-t-transparent border-blue-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Plane className="w-8 h-8 text-blue-500" />
        </div>
      </div>
    </div>
  )
  
  if (error) return (
    <div className="text-center py-10">
      <div className="inline-block p-6 bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/30">
        <div className="text-red-500 text-xl font-semibold">Ошибка при загрузке</div>
        <div className="mt-2 text-red-400">{error}</div>
      </div>
    </div>
  )
  
  if (!tour) return (
    <div className="text-center py-10">
      <div className="inline-block p-6 bg-gray-500/10 backdrop-blur-sm rounded-xl border border-gray-500/30">
        <div className="text-gray-500 text-xl font-semibold">Тур не найден</div>
        <div className="mt-2 text-gray-400">Попробуйте другой ID тура</div>
      </div>
    </div>
  )

  return (
    <div ref={mainRef} className="relative max-w-5xl mx-auto space-y-8 p-4 overflow-hidden">
      {/* Анимированные иконки погоды */}
      <AnimatePresence>
        {weatherIcons.map((icon) => {
          const IconComponent = icon.icon;
          return (
            <motion.div 
              key={icon.id}
              className="absolute pointer-events-none z-10 text-blue-200/60"
              initial={{ 
                opacity: 0, 
                x: `${icon.x}%`, 
                y: `${icon.y}%`,
                rotate: icon.rotate,
                scale: 0
              }}
              animate={{ 
                opacity: [0, 0.7, 0],
                y: [`${icon.y}%`, `${icon.y - 10}%`],
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
      
      {/* Временная подсказка о погоде */}
      <AnimatePresence>
        {showWeatherHint && (
          <motion.div 
            className="absolute top-5 right-5 bg-gradient-to-r from-blue-500/70 to-sky-400/70 backdrop-blur-md p-3 rounded-xl text-white text-xs max-w-[200px] z-30 shadow-lg"
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start space-x-2">
              <Sun className="flex-shrink-0 w-4 h-4 mt-0.5" />
              <p>В этом месте отличная погода большую часть года!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-white shadow-xl rounded-3xl transform-gpu"
        style={{
          backgroundImage: getGlowGradient(),
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
          boxShadow: '0 20px 50px -20px rgba(56, 189, 248, 0.3), 0 0 30px -10px rgba(14, 165, 233, 0.2), inset 0 0 1px 1px rgba(255, 255, 255, 0.4)'
        }}
      >
        {/* Блестящая рамка */}
        <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-sky-400/30 via-transparent to-blue-600/30 pointer-events-none"></div>
        
        {/* Линии стекла */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400/30 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent pointer-events-none"></div>
        
        {/* Блики на стекле */}
        <div className="absolute -top-[300px] -right-[300px] w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="absolute -bottom-[300px] -left-[300px] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[60px] pointer-events-none"></div>
        
        {/* Плавающие пузырьки */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={`bubble-${i}`}
              className="absolute rounded-full bg-white/20"
              initial={{
                x: Math.random() * 100 + "%",
                y: "100%",
                width: `${Math.random() * 15 + 5}px`,
                height: `${Math.random() * 15 + 5}px`,
              }}
              animate={{
                y: [
                  "100%", 
                  `${Math.random() * -20}%`
                ],
                opacity: [0, 0.4, 0]
              }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                delay: Math.random() * 20
              }}
            />
          ))}
        </div>

        {/* Контейнер для изображения с эффектом параллакса */}
        <div 
          className="relative w-full h-[400px] overflow-hidden rounded-t-3xl"
          onMouseMove={handleMouseMoveImage}
          onMouseEnter={() => setIsHoveringImage(true)}
          onMouseLeave={() => {
            setIsHoveringImage(false);
            handleMouseLeaveImage();
          }}
        >
          {/* Индикатор загрузки изображения */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="loader-spinner"></div>
            </div>
          )}
          
          {/* Эффект наведения на изображение */}
          <AnimatePresence>
            {isHoveringImage && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-8 z-10"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-medium">Потрясающий вид на {tour.location}</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Изображение с эффектом параллакса */}
          {tour.imageUrl && (
            <img 
              ref={imageRef}
              src={tour.imageUrl} 
              alt={tour.title} 
              className="object-cover w-full h-full transition-transform duration-300"
              onLoad={() => setImageLoaded(true)}
            />
          )}
        </div>

        <div className="relative p-8 space-y-6 z-10">
          {/* Заголовок и цена */}
          <div className="flex flex-col md:flex-row md:items-start justify-between space-y-4 md:space-y-0">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400"
            >
              {tour.title}
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center"
            >
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }} 
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  className="absolute inset-0 rounded-xl bg-blue-500/20 blur-lg"
                />
                <div className="relative px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500/30 to-sky-400/30 backdrop-blur-md text-3xl font-bold text-blue-600 flex items-center">
                  <DollarSign className="w-6 h-6 mr-1" />
                  {tour.price} ₽
                </div>
              </div>
            </motion.div>
          </div>

          {/* Параметры тура */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-sky-400/5 backdrop-blur-sm border border-blue-500/20"
            >
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className="mb-2 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"
              >
                <MapPin className="w-5 h-5 text-blue-600" />
              </motion.div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Место</div>
                <div className="font-medium text-blue-900">{tour.location}</div>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-sky-400/5 backdrop-blur-sm border border-blue-500/20"
            >
              <motion.div 
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                className="mb-2 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"
              >
                <Calendar className="w-5 h-5 text-blue-600" />
              </motion.div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Длительность</div>
                <div className="font-medium text-blue-900">{tour.duration} дней</div>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-sky-400/5 backdrop-blur-sm border border-blue-500/20"
            >
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className="mb-2 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"
              >
                <Users className="w-5 h-5 text-blue-600" />
              </motion.div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Группа</div>
                <div className="font-medium text-blue-900">до {tour.maxParticipants} чел.</div>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-sky-400/5 backdrop-blur-sm border border-blue-500/20"
            >
              <motion.div 
                animate={{ 
                  rotate: [0, 180],
                  background: [
                    "rgba(59, 130, 246, 0.2)", 
                    "rgba(245, 158, 11, 0.2)",
                    "rgba(59, 130, 246, 0.2)"
                  ]
                }}
                transition={{ 
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  background: { duration: 3, repeat: Infinity, repeatType: "reverse" }
                }}
                className="mb-2 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"
              >
                <Star className="w-5 h-5 text-blue-600" />
              </motion.div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Рейтинг</div>
                <div className="font-medium text-blue-900">4.5 (10 отзывов)</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Табы для контента */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="pt-4"
          >
            <div className="flex space-x-2 border-b border-gray-200 mb-6">
              <motion.button
                whileHover={{ y: -2 }}
                onClick={() => setActiveTab('description')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors relative ${
                  activeTab === 'description' 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-blue-500'
                }`}
              >
                Описание
                {activeTab === 'description' && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 -mb-[1px]" 
                  />
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ y: -2 }}
                onClick={() => setActiveTab('features')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors relative ${
                  activeTab === 'features' 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-blue-500'
                }`}
              >
                Особенности
                {activeTab === 'features' && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 -mb-[1px]" 
                  />
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ y: -2 }}
                onClick={() => setActiveTab('included')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors relative ${
                  activeTab === 'included' 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-blue-500'
                }`}
              >
                Включено
                {activeTab === 'included' && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 -mb-[1px]" 
                  />
                )}
              </motion.button>
            </div>
            
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="prose max-w-none"
                >
                  <p className="text-gray-700 leading-relaxed">{tour.description}</p>
                </motion.div>
              )}
              
              {activeTab === 'features' && (
                <motion.div
                  key="features"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-start p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-sky-400/5 border border-blue-500/10"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-4">
                        <Landmark className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-900">Достопримечательности</h3>
                        <p className="text-sm text-gray-600 mt-1">Посещение всех ключевых мест региона с профессиональным гидом</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-start p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-sky-400/5 border border-blue-500/10"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-4">
                        <Coffee className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-900">Комфортное проживание</h3>
                        <p className="text-sm text-gray-600 mt-1">Отели 4* с завтраками и всеми удобствами</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-start p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-sky-400/5 border border-blue-500/10"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-4">
                        <Utensils className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-900">Местная кухня</h3>
                        <p className="text-sm text-gray-600 mt-1">Дегустация традиционных блюд и напитков</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-start p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-sky-400/5 border border-blue-500/10"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-4">
                        <Map className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-900">Уникальные маршруты</h3>
                        <p className="text-sm text-gray-600 mt-1">Маршруты составлены с учетом самых интересных мест</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'included' && (
                <motion.div
                  key="included"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <ul className="space-y-3">
                    {[
                      "Проживание в отелях 4*",
                      "Завтраки в отеле",
                      "Трансфер из/в аэропорт",
                      "Экскурсии с русскоговорящим гидом",
                      "Входные билеты в музеи и достопримечательности",
                      "Страхование путешественников",
                      "Фотосессия в одной из локаций"
                    ].map((item, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center"
                      >
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, delay: index * 0.2, repeat: Infinity, repeatDelay: 5 }}
                          className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mr-3 flex-shrink-0"
                        >
                          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                        <span className="text-gray-700">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Форма бронирования */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="rounded-2xl overflow-hidden"
          >
            <div className="p-6 space-y-5 bg-gradient-to-br from-blue-500/20 to-sky-400/10 backdrop-blur-md border border-blue-500/20 rounded-2xl">
              <motion.h3 
                className="text-xl font-semibold text-blue-900"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                Забронировать тур
              </motion.h3>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <label className="block mb-2 text-sm font-medium text-gray-700">Количество участников</label>
                <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/70 backdrop-blur-sm border border-blue-500/30 rounded-xl overflow-hidden shadow-sm"
                  >
                    <input
                      type="number"
                      min="1"
                      max={tour.maxParticipants}
                      value={participants}
                      onChange={e => setParticipants(parseInt(e.target.value) || 1)}
                      className="w-full h-14 px-5 border-0 bg-transparent focus:ring-0 focus:outline-none text-blue-900 font-medium"
                    />
                    <div className="absolute inset-y-0 right-0 px-1 flex items-center pointer-events-none">
                      <div className="flex flex-col mr-2">
                        <button 
                          type="button"
                          onClick={() => participants < tour.maxParticipants && setParticipants(participants + 1)}
                          className="flex items-center justify-center w-6 h-6 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 pointer-events-auto"
                        >
                          <ChevronDown className="w-4 h-4 rotate-180" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => participants > 1 && setParticipants(participants - 1)}
                          className="flex items-center justify-center w-6 h-6 mt-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 pointer-events-auto"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                  
                  <div className="absolute top-1/2 -translate-y-1/2 left-5 text-gray-600 pointer-events-none">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
              >
                <div className="text-gray-700">
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.95 }}
                  >
                    Стоимость за человека: {tour.price} ₽
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className="text-xl font-semibold text-blue-600 mt-1"
                  >
                    Итого: {tour.price * participants} ₽
                  </motion.p>
                </div>
                
                <motion.button
                  ref={bookingRef}
                  onClick={handleBooking}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 10px 25px -5px rgba(56, 189, 248, 0.4)"
                  }}
                  whileTap={{ scale: 0.97 }}
                  className="relative overflow-hidden flex items-center justify-center px-6 py-3 text-white rounded-xl shadow-md"
                  style={{
                    background: "linear-gradient(to right, rgb(56, 189, 248), rgb(59, 130, 246))"
                  }}
                >
                  {/* Анимированная текстура воды для кнопки */}
                  <div className="absolute inset-0 opacity-30 overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDEwIGM1IDAgNSAtMTAgMTAgLTEwIHM1IDEwIDEwIDEwIHM1IC0xMCAxMCAtMTAgczUgMTAgMTAgMTAgczUgLTEwIDEwIC0xMCBzNSAxMCAxMCAxMCBzNSAtMTAgMTAgLTEwIHM1IDEwIDEwIDEwIHM1IC0xMCAxMCAtMTAgczUgMTAgMTAgMTApIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')]"
                      style={{
                        backgroundSize: '100px 20px',
                        animation: 'background-pan 20s linear infinite'
                      }}
                    />
                  </div>
                  
                  {/* Блик для эффекта стекла */}
                  <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/30 to-transparent"/>
                  
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span className="font-medium">Забронировать</span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Анимация успешного бронирования */}
          <AnimatePresence>
            {showSuccessBooking && (
              <motion.div 
                className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="bg-gradient-to-br from-blue-500/80 to-sky-400/80 backdrop-blur-md p-8 rounded-2xl flex flex-col items-center justify-center max-w-sm w-full mx-4"
                >
                  {/* Анимированный круг с иконкой */}
                  <div className="relative mb-6">
                    <motion.div
                      animate={{ 
                        boxShadow: [
                          '0 0 0 0 rgba(56, 189, 248, 0.7)',
                          '0 0 0 15px rgba(56, 189, 248, 0)',
                          '0 0 0 0 rgba(56, 189, 248, 0)'
                        ]
                      }}
                      transition={{ 
                        repeat: 3,
                        duration: 1
                      }}
                      className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-sky-400 flex items-center justify-center"
                    >
                      <Plane className="w-12 h-12 text-white" />
                    </motion.div>
                    
                    {/* Вращающиеся частицы вокруг */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={`particle-${i}`}
                        className="absolute w-3 h-3 rounded-full bg-blue-200"
                        initial={{
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                        animate={{
                          top: [
                            '50%',
                            `${50 + Math.sin(i * Math.PI / 4) * 150}%`
                          ],
                          left: [
                            '50%',
                            `${50 + Math.cos(i * Math.PI / 4) * 150}%`
                          ]
                        }}
                        transition={{
                          duration: 0.6,
                          ease: "easeOut"
                        }}
                        style={{
                          opacity: 0.7
                        }}
                      />
                    ))}
                  </div>
                  
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-white text-center"
                  >
                    Бронирование успешно!
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-2 text-center text-white/90"
                  >
                    Сейчас вы будете перенаправлены на страницу оплаты
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Форма оплаты */}
          <AnimatePresence>
            {showPayment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-sky-400/10 backdrop-blur-md border border-green-500/20"
              >
                <motion.h3 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 text-xl font-semibold text-green-900"
                >
                  Оплата бронирования
                </motion.h3>
                
                <div className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block mb-2 text-sm font-medium text-gray-700">Способ оплаты</label>
                    <div className="relative">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-white/70 backdrop-blur-sm border border-green-500/30 rounded-xl overflow-hidden shadow-sm"
                      >
                        <select
                          value={paymentMethod}
                          onChange={e => setPaymentMethod(e.target.value)}
                          className="w-full h-14 px-5 pl-12 border-0 bg-transparent focus:ring-0 focus:outline-none text-green-900 font-medium appearance-none"
                        >
                          <option value="CARD">Банковская карта</option>
                          <option value="CASH">Наличные</option>
                        </select>
                      </motion.div>
                      
                      <div className="absolute top-1/2 -translate-y-1/2 left-5 text-green-600 pointer-events-none">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      
                      <div className="absolute top-1/2 -translate-y-1/2 right-5 text-green-600 pointer-events-none">
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.button
                    onClick={handlePayment}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)"
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="relative overflow-hidden flex items-center justify-center w-full px-6 py-3 text-white rounded-xl shadow-md"
                    style={{
                      background: "linear-gradient(to right, rgb(16, 185, 129), rgb(5, 150, 105))"
                    }}
                  >
                    {/* Блик для эффекта стекла */}
                    <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/30 to-transparent"/>
                    
                    <div className="flex items-center justify-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      <span className="font-medium">Оплатить {tour.price * participants} ₽</span>
                    </div>
                    
                    {/* Анимированные частицы */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={`button-particle-${i}`}
                        className="absolute rounded-full bg-white"
                        initial={{
                          width: `${Math.random() * 4 + 1}px`,
                          height: `${Math.random() * 4 + 1}px`,
                          x: `${Math.random() * 100}%`,
                          y: `${Math.random() * 100}%`,
                          opacity: 0
                        }}
                        animate={{
                          y: [null, -30, -20],
                          opacity: [0, 0.7, 0],
                        }}
                        transition={{
                          duration: Math.random() * 1 + 1,
                          repeat: Infinity,
                          repeatDelay: Math.random() * 2,
                          delay: Math.random() * 2
                        }}
                      />
                    ))}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Бронирования пользователя и кнопка завершения тура */}
          {userBookings.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-sky-400/5 backdrop-blur-md border border-blue-500/20"
            >
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Ваши бронирования</h3>
              
              <div className="space-y-4">
                {userBookings.map(booking => (
                  <div 
                    key={booking.id}
                    className="p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-blue-200/50 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">
                            {booking.participants} {booking.participants > 1 ? 'человек' : 'человек'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center space-x-2">
                          <div className={
                            booking.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium'
                              : 'bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium'
                          }>
                            {booking.status === 'PENDING' && 'Ожидает оплаты'}
                            {booking.status === 'CONFIRMED' && 'Подтверждено'}
                            {booking.status === 'COMPLETED' && 'Завершено'}
                            {booking.status === 'CANCELLED' && 'Отменено'}
                          </div>
                          
                          <div className={
                            booking.paymentStatus === 'PAID' 
                              ? 'bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium'
                              : booking.paymentStatus === 'REFUNDED'
                                ? 'bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium'
                                : 'bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium'
                          }>
                            {booking.paymentStatus === 'UNPAID' && 'Не оплачено'}
                            {booking.paymentStatus === 'PAID' && 'Оплачено'}
                            {booking.paymentStatus === 'REFUNDED' && 'Возвращено'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Кнопка завершения тура */}
                      {booking.status === 'CONFIRMED' && booking.paymentStatus === 'PAID' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => completeTour(booking.id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center space-x-2 shadow-md"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>Завершить тур</span>
                        </motion.button>
                      )}
                      
                      {/* Уведомление о возможности оставить отзыв */}
                      {booking.status === 'COMPLETED' && (
                        <div className="text-green-600 font-medium flex items-center space-x-2">
                          <Check className="w-5 h-5" />
                          <span>Вы можете оставить отзыв</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Сообщение об успешном завершении тура */}
          <AnimatePresence>
            {showTourCompletedMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm"
              >
                <motion.div 
                  className="bg-white rounded-xl p-6 shadow-xl max-w-md"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Тур успешно завершен!</h3>
                    <p className="text-gray-600">Теперь вы можете оставить отзыв о вашем опыте путешествия.</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Отзывы */}
          <div className="mt-12">
            <ReviewList tourId={id} />
          </div>

          {/* Форма отзыва */}
          <div className="mt-8">
            <ReviewForm
              tourId={id}
              onReviewSubmitted={() => {
                // Обновляем список отзывов после добавления нового
                window.location.reload()
              }}
            />
          </div>
        </div>
      </motion.div>
      
      {/* CSS для дополнительных эффектов */}
      <style jsx="true">{`
        @keyframes background-pan {
          from {
            background-position: 0% 0%;
          }
          to {
            background-position: 300% 0%;
          }
        }
        
        .loader-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(56, 189, 248, 0.3);
          border-radius: 50%;
          border-top-color: rgb(56, 189, 248);
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
