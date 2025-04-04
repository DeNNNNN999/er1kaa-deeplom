import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, User, Lock, ArrowRight, Plane, Map, Compass, Ship, Umbrella, Luggage, SunMoon, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeField, setActiveField] = useState(null)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showTravelHint, setShowTravelHint] = useState(false)
  const [showSuccessIcon, setShowSuccessIcon] = useState(false)
  const [travelIcons, setTravelIcons] = useState([])
  const [lastInputTime, setLastInputTime] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const formRef = useRef(null)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)

  // Эффект для создания и управления анимированными иконками
  useEffect(() => {
    const now = Date.now()
    if (now - lastInputTime > 300 && (formData.email || formData.password)) {
      const newIcon = {
        id: now,
        icon: [Plane, Ship, Compass, Map, Umbrella, Luggage, SunMoon][Math.floor(Math.random() * 7)],
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        size: Math.random() * 14 + 8,
        rotate: Math.random() * 360,
        duration: Math.random() * 2 + 1.5
      }
      
      setTravelIcons(prev => [...prev, newIcon])
      setTimeout(() => {
        setTravelIcons(prev => prev.filter(icon => icon.id !== newIcon.id))
      }, newIcon.duration * 1000)
    }
  }, [formData, lastInputTime])

  // Отслеживаем ввод для анимаций
  useEffect(() => {
    setLastInputTime(Date.now())
  }, [formData.email, formData.password])

  // Эффект отслеживания положения мыши для интерактивности
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (formRef.current) {
        const formRect = formRef.current.getBoundingClientRect();
        const x = e.clientX - formRect.left;
        const y = e.clientY - formRect.top;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Показ подсказки о путешествиях
  useEffect(() => {
    const showHintTimeout = setTimeout(() => {
      setShowTravelHint(true);
      
      const hideHintTimeout = setTimeout(() => {
        setShowTravelHint(false);
      }, 4000);
      
      return () => clearTimeout(hideHintTimeout);
    }, 2000);
    
    return () => clearTimeout(showHintTimeout);
  }, []);

  useEffect(() => {
    // При монтировании компонента проверяем, был ли перенаправлен пользователь
    // из-за истечения срока действия токена
    const urlParams = new URLSearchParams(window.location.search)
    const tokenExpired = urlParams.get('tokenExpired')
    if (tokenExpired === 'true') {
      setError('Сессия истекла. Пожалуйста, войдите снова.')
    }
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Визуальный эффект при нажатии кнопки
    createWaterSplash();

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при входе')
      }

      // Анимация успешного входа перед редиректом
      setLoginSuccess(true)
      setShowSuccessIcon(true)
      
      setTimeout(() => {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/')
      }, 1800)
    } catch (err) {
      setError(err.message)
      // Анимация тряски при ошибке
      const form = document.querySelector('.form-glass')
      form.classList.add('shake-animation')
      setTimeout(() => form.classList.remove('shake-animation'), 600)
    } finally {
      setIsLoading(false)
    }
  }

  // Функция для создания анимации брызг воды
  const createWaterSplash = () => {
    const splashCount = 20;
    const splashContainer = document.createElement('div');
    splashContainer.className = 'absolute inset-0 overflow-hidden pointer-events-none z-50';
    formRef.current.appendChild(splashContainer);
    
    for (let i = 0; i < splashCount; i++) {
      const splash = document.createElement('div');
      splash.className = 'absolute rounded-full bg-blue-400 opacity-60';
      
      const size = Math.random() * 10 + 5;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      const duration = Math.random() * 0.8 + 0.6;
      
      splash.style.width = `${size}px`;
      splash.style.height = `${size}px`;
      splash.style.left = '50%';
      splash.style.top = '70%';
      splash.style.transform = 'translate(-50%, -50%)';
      
      splash.animate(
        [
          { transform: 'translate(-50%, -50%)', opacity: 0.6 },
          { 
            transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px))`,
            opacity: 0
          }
        ],
        {
          duration: duration * 1000,
          easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
        }
      );
      
      splashContainer.appendChild(splash);
    }
    
    setTimeout(() => {
      formRef.current.removeChild(splashContainer);
    }, 1500);
  };

  const focusField = (field) => {
    if (field === 'email') emailRef.current.focus()
    if (field === 'password') passwordRef.current.focus()
    setActiveField(field)
  }

  // Переключение видимости пароля
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }

  // Вычисляем градиент подсветки на основе положения мыши
  const getGlowGradient = () => {
    if (!formRef.current) return '';
    
    const { width, height } = formRef.current.getBoundingClientRect();
    const centerX = mousePosition.x / width * 100;
    const centerY = mousePosition.y / height * 100;
    
    return `radial-gradient(circle at ${centerX}% ${centerY}%, rgba(56, 189, 248, 0.4) 0%, rgba(59, 130, 246, 0.2) 25%, rgba(0, 0, 0, 0) 50%)`;
  }

  return (
    <motion.div 
      ref={formRef}
      className="form-glass relative backdrop-blur-2xl overflow-hidden rounded-3xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        backgroundImage: getGlowGradient(),
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(59, 130, 246, 0.2), rgba(79, 70, 229, 0.15))',
        boxShadow: '0 20px 70px -20px rgba(56, 189, 248, 0.4), 0 0 40px -10px rgba(14, 165, 233, 0.2), inset 0 0 1px 1px rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Плавающие пузырьки */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
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
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 20
            }}
          />
        ))}
      </div>

      {/* Блестящая рамка */}
      <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-sky-400/30 via-transparent to-blue-600/30 pointer-events-none"></div>
      
      {/* Блики на стекле */}
      <div className="absolute -top-[500px] -right-[500px] w-[800px] h-[800px] bg-sky-500/5 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute -bottom-[300px] -left-[300px] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>
      
      {/* Линии стекла */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400/30 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent pointer-events-none"></div>
      
      {/* Анимированные иконки путешествий */}
      <AnimatePresence>
        {travelIcons.map((icon) => {
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
      
      {/* Временная подсказка о путешествиях */}
      <AnimatePresence>
        {showTravelHint && (
          <motion.div 
            className="absolute top-5 right-5 bg-gradient-to-r from-blue-500/80 to-sky-400/80 backdrop-blur-md p-3 rounded-xl text-white text-xs max-w-[200px] z-30 shadow-lg"
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start space-x-2">
              <Plane className="flex-shrink-0 w-4 h-4 mt-0.5" />
              <p>Войдите в систему, чтобы увидеть лучшие туристические предложения!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Содержимое формы */}
      <div className="relative p-8 z-10 flex flex-col items-center">
        {/* Анимированный логотип */}
        <motion.div 
          className="relative w-20 h-20 mb-6"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        >
          {/* Пульсирующий фон за логотипом */}
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
            className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400/30 to-blue-600/30 blur-lg"
          />
          
          {/* Вращающееся кольцо вокруг логотипа */}
          <motion.div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, rgba(56, 189, 248, 0), rgba(56, 189, 248, 0.7), rgba(59, 130, 246, 0.7), rgba(56, 189, 248, 0))'
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Центральный логотип */}
          <div className="absolute inset-2 rounded-full backdrop-blur-md bg-white/10 flex items-center justify-center">
            <motion.div 
              className="text-blue-300"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0, -5, 0] 
              }}
              transition={{ 
                scale: { duration: 3, repeat: Infinity, repeatType: 'reverse' },
                rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Ship className="w-10 h-10" />
            </motion.div>
          </div>
        </motion.div>
        
        {/* Заголовок с анимацией */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.h1 
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 mb-1"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Добро пожаловать
          </motion.h1>
          <motion.p 
            className="text-blue-100/70 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Начните свое путешествие
          </motion.p>
        </motion.div>
        
        {/* Форма входа */}
        <div className="w-full space-y-5">
          {/* Сообщение об ошибке */}
          <AnimatePresence>
            {error && (
              <motion.div 
                className="flex items-center p-4 rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-100"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-5 h-5 mr-3 text-red-300 flex-shrink-0">⚠️</div>
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Анимация успешного входа */}
          <AnimatePresence>
            {loginSuccess && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center z-30 bg-gradient-to-r from-sky-500/30 to-blue-600/30 backdrop-blur-md rounded-3xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
                  className="flex flex-col items-center"
                >
                  {/* Анимированный круг с самолетом */}
                  <div className="relative mb-5">
                    <motion.div 
                      className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-sky-400 flex items-center justify-center"
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
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 1.5 }}
                      >
                        <Plane className="w-10 h-10 text-white" />
                      </motion.div>
                    </motion.div>
                    
                    {/* Вращающиеся частицы вокруг */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={`particle-${i}`}
                        className="absolute w-2 h-2 rounded-full bg-blue-200"
                        initial={{
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                        animate={{
                          top: [
                            '50%',
                            `${50 + Math.sin(i * Math.PI / 4) * 130}%`
                          ],
                          left: [
                            '50%',
                            `${50 + Math.cos(i * Math.PI / 4) * 130}%`
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
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold text-white"
                  >
                    Успешный вход!
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email поле - белое стекло */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="transform-gpu"
            >
              <div 
                className={`glassmorphic-input relative group cursor-text rounded-xl overflow-hidden ${
                  activeField === 'email' 
                    ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]' 
                    : 'hover:shadow-lg'
                } transition-all duration-300`}
                onClick={() => focusField('email')}
              >
                {/* Белое стеклянное поле */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md border border-white/50 rounded-xl z-0"></div>
                
                {/* Анимированное свечение при фокусе */}
                {activeField === 'email' && (
                  <motion.div 
                    className="absolute inset-0 bg-blue-400/20 z-0"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 2
                    }}
                  />
                )}
                
                <div className="relative h-14 z-10">
                  {/* Иконка */}
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <motion.div
                      animate={{ 
                        scale: activeField === 'email' ? [1, 1.2, 1] : 1
                      }}
                      transition={{ 
                        repeat: activeField === 'email' ? Infinity : 0,
                        duration: 2
                      }}
                    >
                      <User className="w-5 h-5 text-blue-500" />
                    </motion.div>
                  </div>
                  
                  {/* Лейбл */}
                  <label 
                    htmlFor="email"
                    className={`absolute text-sm font-semibold pointer-events-none transition-all duration-200 ${
                      activeField === 'email' || formData.email 
                      ? 'top-1 left-12 text-xs text-blue-600'  
                      : 'top-4 left-12 text-gray-500'
                    }`}
                  >
                    Email
                  </label>
                  
                  {/* Поле ввода */}
                  <input
                    ref={emailRef}
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setActiveField('email')}
                    onBlur={() => setActiveField(null)}
                    className={`h-full w-full pl-12 pr-4 pt-5 pb-1 bg-transparent text-blue-900 font-medium rounded-xl border-0 focus:ring-0 focus:outline-none z-10 ${
                      activeField === 'email' ? 'placeholder-blue-300' : 'placeholder-gray-400'
                    }`}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Password поле - белое стекло */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="transform-gpu"
            >
              <div 
                className={`glassmorphic-input relative group cursor-text rounded-xl overflow-hidden ${
                  activeField === 'password' 
                    ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]' 
                    : 'hover:shadow-lg'
                } transition-all duration-300`}
                onClick={() => focusField('password')}
              >
                {/* Белое стеклянное поле */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md border border-white/50 rounded-xl z-0"></div>
                
                {/* Анимированное свечение при фокусе */}
                {activeField === 'password' && (
                  <motion.div 
                    className="absolute inset-0 bg-blue-400/20 z-0"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 2
                    }}
                  />
                )}
                
                <div className="relative h-14 z-10">
                  {/* Иконка */}
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <motion.div
                      animate={{ 
                        scale: activeField === 'password' ? [1, 1.2, 1] : 1
                      }}
                      transition={{ 
                        repeat: activeField === 'password' ? Infinity : 0,
                        duration: 2
                      }}
                    >
                      <Lock className="w-5 h-5 text-blue-500" />
                    </motion.div>
                  </div>
                  
                  {/* Кнопка показа/скрытия пароля */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-20">
                    <motion.button 
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="text-blue-500 hover:text-blue-700 focus:outline-none p-1 rounded-full hover:bg-blue-100/50"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </motion.button>
                  </div>
                  
                  {/* Лейбл */}
                  <label 
                    htmlFor="password"
                    className={`absolute text-sm font-semibold pointer-events-none transition-all duration-200 ${
                      activeField === 'password' || formData.password 
                      ? 'top-1 left-12 text-xs text-blue-600'
                      : 'top-4 left-12 text-gray-500'
                    }`}
                  >
                    Пароль
                  </label>
                  
                  {/* Поле ввода */}
                  <input
                    ref={passwordRef}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setActiveField('password')}
                    onBlur={() => setActiveField(null)}
                    className={`h-full w-full pl-12 pr-12 pt-5 pb-1 bg-transparent text-blue-900 font-medium rounded-xl border-0 focus:ring-0 focus:outline-none z-10 ${
                      activeField === 'password' ? 'placeholder-blue-300' : 'placeholder-gray-400'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Кнопка входа */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-3"
            >
              <motion.button
                type="submit"
                disabled={isLoading || loginSuccess}
                className="relative w-full h-14 overflow-hidden rounded-xl text-white font-bold group flex items-center justify-center"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 25px -5px rgba(56, 189, 248, 0.5)"
                }}
                whileTap={{ scale: 0.98 }}
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
                <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/20 to-transparent"/>
                
                {/* Контент кнопки */}
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div 
                      key="loading" 
                      className="flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="loader-spinner mr-2"></div>
                      <span className="text-sm font-medium">Вход...</span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="button" 
                      className="flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-sm font-medium mr-2">Войти</span>
                      <motion.div 
                        animate={{ x: [0, 5, 0] }} 
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1.5,
                          repeatType: "reverse" 
                        }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </form>
          
          {/* Ссылка на регистрацию */}
          <motion.div 
            className="text-center pt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="text-blue-100/60 text-sm">Нет аккаунта? </span>
            <Link 
              to="/register" 
              className="text-sm text-sky-300 hover:text-sky-200 transition-colors relative group"
            >
              <span>Зарегистрироваться</span>
              <motion.div 
                className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-sky-400 to-blue-400 group-hover:w-full transition-all duration-300"
              />
              <motion.span 
                className="inline-block ml-1"
                animate={{ x: [0, 3, 0] }}
                transition={{ 
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 1.5
                }}
              >
                <ArrowRight className="w-3 h-3 inline" />
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* CSS для дополнительных эффектов */}
      <style jsx="true">{`
        @keyframes shake-animation {
          0% { transform: translateX(0); }
          10% { transform: translateX(-6px); }
          20% { transform: translateX(6px); }
          30% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          50% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          70% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
          90% { transform: translateX(-6px); }
          100% { transform: translateX(0); }
        }
        
        @keyframes background-pan {
          from {
            background-position: 0% 0%;
          }
          to {
            background-position: 300% 0%;
          }
        }
        
        .shake-animation {
          animation: shake-animation 0.6s ease-in-out;
        }
        
        .loader-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .glassmorphic-input {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1), 
                      inset 0 0 0 1px rgba(255, 255, 255, 0.5);
          transform: translateZ(0);
        }
        
        .glassmorphic-input::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 0.75rem;
          padding: 1px;
          background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>
    </motion.div>
  )
}
