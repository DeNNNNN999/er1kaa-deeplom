import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { Star, Send, AlertCircle, CheckCircle, X } from 'lucide-react'

export default function ReviewForm({ tourId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [starsAnimating, setStarsAnimating] = useState(false)
  const [focusedTextarea, setFocusedTextarea] = useState(false)
  const [completedBooking, setCompletedBooking] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  
  const formRef = useRef(null)
  const textareaRef = useRef(null)
  const submitButtonRef = useRef(null)
  
  // Проверяем, авторизован ли пользователь и есть ли у него завершенные бронирования
  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    
    if (token) {
      fetchCompletedBookings(token)
    } else {
      setCheckingStatus(false)
    }
  }, [tourId])
  
  // Получаем завершенные бронирования
  const fetchCompletedBookings = async (token) => {
    try {
      if (!tourId) {
        setCheckingStatus(false)
        return
      }

      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Ошибка ответа сервера:', response.status, errorData)
        throw new Error(errorData.message || 'Ошибка при получении бронирований')
      }
      
      const data = await response.json()
      
      if (!Array.isArray(data)) {
        console.warn('Сервер вернул не массив:', data)
        setCompletedBooking(null)
        return
      }
      
      // Ищем завершенные бронирования для текущего тура
      const completed = data.find(booking => 
        booking && booking.TourId === tourId && 
        booking.status === 'COMPLETED'
      )
      
      setCompletedBooking(completed || null)
    } catch (error) {
      console.error('Ошибка при получении бронирований:', error)
      setError('Ошибка проверки бронирований: ' + (error.message || 'Неизвестная ошибка'))
    } finally {
      setCheckingStatus(false)
    }
  }
  
  // Эффект отслеживания положения мыши для интерактивности
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (formRef.current) {
        const rect = formRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Анимация звезд при выборе рейтинга
  useEffect(() => {
    if (rating > 0 && !starsAnimating) {
      setStarsAnimating(true);
      
      // Сбрасываем флаг анимации через 2 секунды
      setTimeout(() => {
        setStarsAnimating(false);
      }, 2000);
    }
  }, [rating]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Пожалуйста, выберите рейтинг')
      
      // Анимируем звезды при ошибке
      const stars = document.querySelectorAll('.rating-star');
      gsap.to(stars, {
        x: (i) => [0, (-2 + i), (2 - i), 0],
        duration: 0.4,
        ease: "elastic.out(1, 0.3)"
      });
      
      return
    }

    setError('')
    setLoading(true)
    
    // Анимация кнопки отправки
    if (submitButtonRef.current) {
      gsap.to(submitButtonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1
      });
      
      // Создаем эффект частиц при нажатии
      createSubmitParticles();
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Вы не авторизованы. Пожалуйста, войдите в систему')
      }

      if (!tourId) {
        throw new Error('Не указан ID тура')
      }

      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          TourId: tourId,
          rating,
          comment
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Ошибка ответа сервера:', response.status, errorData)
        throw new Error(errorData.message || 'Ошибка при создании отзыва')
      }

      const data = await response.json()
      
      // Показываем сообщение об успехе
      setShowSuccessMessage(true);
      
      // Сбрасываем форму и скрываем сообщение через 3 секунды
      setTimeout(() => {
        setRating(0)
        setComment('')
        setShowSuccessMessage(false)
        if (typeof onReviewSubmitted === 'function') {
          onReviewSubmitted()
        }
      }, 3000);
      
    } catch (err) {
      console.error('Ошибка при отправке отзыва:', err)
      setError(err.message || 'Неизвестная ошибка при отправке отзыва')
      
      // Анимируем форму при ошибке
      if (formRef.current) {
        gsap.to(formRef.current, {
          x: [0, -5, 5, -5, 5, 0],
          duration: 0.4,
          ease: "power2.inOut"
        });
      }
      
    } finally {
      setLoading(false)
    }
  }
  
  // Создаем эффект частиц при отправке формы
  const createSubmitParticles = () => {
    if (!submitButtonRef.current || !formRef.current) return;
    
    const particleCount = 20;
    const buttonRect = submitButtonRef.current.getBoundingClientRect();
    const formRect = formRef.current.getBoundingClientRect();
    
    const container = document.createElement('div');
    container.className = 'absolute inset-0 overflow-hidden pointer-events-none z-50';
    formRef.current.appendChild(container);
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 8 + 3;
      const color = `hsl(${Math.random() * 60 + 200}, 100%, 65%)`;
      
      particle.className = 'absolute rounded-full';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.boxShadow = `0 0 6px ${color}`;
      
      // Позиционируем частицы от центра кнопки относительно формы
      const startX = buttonRect.left + buttonRect.width / 2 - formRect.left;
      const startY = buttonRect.top + buttonRect.height / 2 - formRect.top;
      
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 30;
      
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
          duration: Math.random() * 800 + 500,
          easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
        }
      );
      
      container.appendChild(particle);
    }
    
    setTimeout(() => {
      formRef.current.removeChild(container);
    }, 1500);
  };
  
  // Получаем градиент подсветки для стеклянной формы
  const getGlowGradient = () => {
    if (!formRef.current) return '';
    
    const { width, height } = formRef.current.getBoundingClientRect();
    const centerX = mousePosition.x / width * 100;
    const centerY = mousePosition.y / height * 100;
    
    return `radial-gradient(circle at ${centerX}% ${centerY}%, rgba(56, 189, 248, 0.3) 0%, rgba(59, 130, 246, 0.15) 20%, rgba(0, 0, 0, 0) 50%)`;
  }

  return (
    <>
      {checkingStatus ? (
        <div className="flex justify-center items-center py-5">
          <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !isLoggedIn ? (
        <div className="p-6 rounded-xl bg-blue-50 text-blue-700 text-center">
          Войдите в систему, чтобы оставить отзыв
        </div>
      ) : !completedBooking ? (
        <div className="p-6 rounded-xl bg-amber-50 text-amber-700 text-center">
          Чтобы оставить отзыв, необходимо завершить тур
        </div>
      ) : (
        <motion.form
          ref={formRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl transform-gpu"
          onSubmit={handleSubmit}
          style={{
            backgroundImage: getGlowGradient(),
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
            boxShadow: '0 15px 40px -15px rgba(56, 189, 248, 0.3), 0 0 20px -5px rgba(14, 165, 233, 0.2), inset 0 0 1px 1px rgba(255, 255, 255, 0.4)'
          }}
        >
          {/* Блестящая рамка */}
          <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-sky-400/30 via-transparent to-blue-600/30 pointer-events-none"></div>
          
          {/* Линии стекла */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400/30 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent pointer-events-none"></div>
          
          {/* Блики на стекле */}
          <div className="absolute -top-[300px] -right-[300px] w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="absolute -bottom-[200px] -left-[200px] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[60px] pointer-events-none"></div>
          
          {/* Плавающие пузырьки */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={`bubble-${i}`}
                className="absolute rounded-full bg-white/20"
                initial={{
                  x: Math.random() * 100 + "%",
                  y: "100%",
                  width: `${Math.random() * 10 + 3}px`,
                  height: `${Math.random() * 10 + 3}px`,
                }}
                animate={{
                  y: [
                    "100%", 
                    `${Math.random() * -20}%`
                  ],
                  opacity: [0, 0.4, 0]
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  delay: Math.random() * 15
                }}
              />
            ))}
          </div>
          
          {/* Анимация успешной отправки отзыва */}
          <AnimatePresence>
            {showSuccessMessage && (
              <motion.div 
                className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="flex flex-col items-center"
                >
                  {/* Анимированный круг с галочкой */}
                  <motion.div 
                    className="relative w-20 h-20 mb-4"
                    animate={{ 
                      boxShadow: [
                        '0 0 0 0 rgba(56, 189, 248, 0.7)',
                        '0 0 0 20px rgba(56, 189, 248, 0)',
                        '0 0 0 0 rgba(56, 189, 248, 0)'
                      ]
                    }}
                    transition={{ 
                      repeat: 2,
                      duration: 1.5
                    }}
                  >
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-sky-400 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12, delay: 0.2 }}
                    >
                      <CheckCircle className="w-10 h-10 text-white" />
                    </motion.div>
                  </motion.div>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold text-blue-600"
                  >
                    Спасибо за отзыв!
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-600 text-center mt-2"
                  >
                    Ваш отзыв успешно отправлен
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-6 space-y-5 relative z-10">
            <motion.h3 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400"
            >
              Оставить отзыв
            </motion.h3>

            {/* Ошибка */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center p-3 rounded-xl bg-red-500/10 backdrop-blur-sm border border-red-500/30 text-red-600"
                >
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  {error}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setError('')}
                    className="ml-auto"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700">
                Рейтинг
              </label>
              <div className="flex space-x-2 py-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <motion.button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoveredRating(value)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none rating-star relative"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    animate={
                      starsAnimating && value <= rating 
                        ? { 
                            scale: [1, 1.5, 1],
                            rotate: [0, 15, -15, 0],
                            y: [0, -10, 0]
                          } 
                        : {}
                    }
                    transition={
                      starsAnimating ? { 
                        delay: (value - 1) * 0.1,
                        duration: 0.5
                      } : { duration: 0.2 }
                    }
                  >
                    <Star
                      className={`w-8 h-8 transition-colors duration-300 ${
                        value <= (hoveredRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                    
                    {/* Анимированное свечение при наведении */}
                    {value <= (hoveredRating || rating) && (
                      <motion.div 
                        className="absolute inset-0 rounded-full bg-yellow-400 -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        exit={{ opacity: 0 }}
                        layoutId={`star-glow-${value}`}
                        transition={{ duration: 0.3 }}
                        style={{ filter: 'blur(4px)' }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-700"
              >
                Комментарий
              </label>
              <div className="relative">
                <div 
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                    focusedTextarea 
                      ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]' 
                      : 'hover:shadow-lg'
                  }`}
                >
                  {/* Белое стеклянное поле */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md border border-white/50 rounded-xl z-0"></div>
                  
                  {/* Анимированное свечение при фокусе */}
                  {focusedTextarea && (
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
                  
                  <textarea
                    ref={textareaRef}
                    id="comment"
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onFocus={() => setFocusedTextarea(true)}
                    onBlur={() => setFocusedTextarea(false)}
                    className="w-full relative z-10 px-4 py-3 bg-transparent text-blue-900 rounded-xl border-0 focus:ring-0 focus:outline-none resize-none"
                    placeholder="Поделитесь своими впечатлениями..."
                  />
                </div>
                
                {/* Плавающие частицы при вводе текста */}
                {focusedTextarea && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: Math.min(comment.length % 15, 10) }).map((_, i) => (
                      <motion.div
                        key={`particle-input-${i}-${comment.length}`}
                        className="absolute w-1 h-1 rounded-full bg-blue-400"
                        initial={{ 
                          opacity: 0.7,
                          x: mousePosition.x, 
                          y: mousePosition.y,
                          scale: 0
                        }}
                        animate={{ 
                          opacity: 0,
                          scale: 1,
                          x: mousePosition.x + (Math.random() - 0.5) * 80,
                          y: mousePosition.y + (Math.random() - 0.5) * 80,
                        }}
                        transition={{ duration: 1 }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                ref={submitButtonRef}
                type="submit"
                disabled={loading}
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: "0 10px 25px -5px rgba(56, 189, 248, 0.4)"
                }}
                whileTap={{ scale: 0.97 }}
                className="relative w-full overflow-hidden flex items-center justify-center px-6 py-3 text-white rounded-xl shadow-md"
                style={{
                  background: "linear-gradient(to right, rgb(56, 189, 248), rgb(59, 130, 246))"
                }}
              >
                {/* Анимированная текстура для кнопки */}
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
                
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div 
                      key="loading" 
                      className="flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="loader-spinner mr-2"></div>
                      <span className="font-medium">Отправка...</span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="button" 
                      className="flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span className="font-medium mr-2">Отправить отзыв</span>
                      <motion.div 
                        animate={{ x: [0, 5, 0] }} 
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1.5
                        }}
                      >
                        <Send className="h-5 w-5" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Анимированные частицы */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={`button-particle-${i}`}
                    className="absolute rounded-full bg-white"
                    initial={{
                      width: `${Math.random() * 3 + 1}px`,
                      height: `${Math.random() * 3 + 1}px`,
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      opacity: 0
                    }}
                    animate={{
                      y: [null, -20, -10],
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
            </motion.div>
          </div>
          
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
              width: 20px;
              height: 20px;
              border: 2px solid rgba(255, 255, 255, 0.3);
              border-radius: 50%;
              border-top-color: white;
              animation: spin 0.8s linear infinite;
            }
            
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </motion.form>
      )}
    </>
  )
}