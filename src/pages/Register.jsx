import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserPlus, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle, 
  Plane, 
  Map, 
  MapPin, 
  Palmtree, 
  Ticket, 
  Globe, 
  Eye, 
  EyeOff 
} from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeField, setActiveField] = useState(null)
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [lastInputTime, setLastInputTime] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [destinations, setDestinations] = useState([])
  const [particlesCount, setParticlesCount] = useState(0)
  
  const formRef = useRef(null)
  const firstNameRef = useRef(null)
  const lastNameRef = useRef(null)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)

  // Туристические направления для анимации
  const availableDestinations = [
    { name: "Париж", icon: <Palmtree className="w-4 h-4" />, color: "rgb(239, 68, 68)" },
    { name: "Лондон", icon: <Globe className="w-4 h-4" />, color: "rgb(59, 130, 246)" },
    { name: "Токио", icon: <MapPin className="w-4 h-4" />, color: "rgb(16, 185, 129)" },
    { name: "Нью-Йорк", icon: <Map className="w-4 h-4" />, color: "rgb(245, 158, 11)" },
    { name: "Рим", icon: <Ticket className="w-4 h-4" />, color: "rgb(139, 92, 246)" },
    { name: "Барселона", icon: <Plane className="w-4 h-4" />, color: "rgb(236, 72, 153)" }
  ]

  // Создаем случайные "направления" для анимации
  useEffect(() => {
    const createDestination = () => {
      const dest = availableDestinations[Math.floor(Math.random() * availableDestinations.length)]
      const newDest = {
        ...dest,
        id: Date.now() + Math.random(),
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        scale: Math.random() * 0.4 + 0.8,
        opacity: Math.random() * 0.3 + 0.2,
        duration: Math.random() * 3 + 5
      }
      
      setDestinations(prev => [...prev, newDest])
      
      // Удаляем направление после анимации
      setTimeout(() => {
        setDestinations(prev => prev.filter(d => d.id !== newDest.id))
      }, newDest.duration * 1000)
    }
    
    // Создаем случайные направления время от времени
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        createDestination()
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  // Добавляем частицы при вводе в поля
  useEffect(() => {
    const now = Date.now()
    if (now - lastInputTime > 100) {
      setParticlesCount(prev => prev + 1)
    }
  }, [formData, lastInputTime])

  // Отслеживаем ввод для анимаций
  useEffect(() => {
    setLastInputTime(Date.now())
  }, [formData.email, formData.password, formData.firstName, formData.lastName])

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

    // Создаем эффект взрыва частиц при отправке формы
    createSubmitParticles()

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при регистрации')
      }

      // Анимация успешной регистрации
      setRegisterSuccess(true)
      
      setTimeout(() => {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/')
      }, 2000)
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

  // Создает эффект частиц при подтверждении формы
  const createSubmitParticles = () => {
    const particleCount = 30;
    const particleContainer = document.createElement('div');
    particleContainer.className = 'absolute inset-0 overflow-hidden pointer-events-none z-50';
    formRef.current.appendChild(particleContainer);
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 10 + 5;
      const color = `hsl(${Math.random() * 40 + 200}, 100%, 60%)`;
      
      particle.className = 'absolute rounded-full';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.boxShadow = `0 0 10px ${color}`;
      
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 150 + 50;
      const startX = formRef.current.clientWidth / 2;
      const startY = formRef.current.clientHeight / 2;
      
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
          duration: Math.random() * 1000 + 1000,
          easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
        }
      );
      
      particleContainer.appendChild(particle);
    }
    
    setTimeout(() => {
      formRef.current.removeChild(particleContainer);
    }, 2000);
  };

  const focusField = (field) => {
    if (field === 'firstName') firstNameRef.current.focus()
    if (field === 'lastName') lastNameRef.current.focus()
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
      
      {/* Анимированные городские названия */}
      <AnimatePresence>
        {destinations.map((destination) => (
          <motion.div 
            key={destination.id}
            className="absolute pointer-events-none z-10 flex items-center justify-center rounded-lg px-2 py-1"
            initial={{ 
              opacity: 0, 
              x: `${destination.x}%`, 
              y: `${destination.y}%`,
              scale: 0
            }}
            animate={{ 
              opacity: destination.opacity,
              scale: destination.scale,
              y: [`${destination.y}%`, `${destination.y - 15}%`]
            }}
            exit={{ 
              opacity: 0,
              scale: 0
            }}
            transition={{ 
              duration: destination.duration,
              ease: "easeInOut"
            }}
            style={{
              backgroundColor: `${destination.color}20`,
              boxShadow: `0 0 20px ${destination.color}10`,
              border: `1px solid ${destination.color}30`,
              backdropFilter: 'blur(4px)'
            }}
          >
            <span className="mr-1 text-xs font-medium" style={{ color: destination.color }}>{destination.name}</span>
            <span style={{ color: destination.color }}>{destination.icon}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Частицы ввода */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: particlesCount % 30 }).map((_, i) => (
          <motion.div
            key={`particle-input-${i}-${particlesCount - i}`}
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
              x: mousePosition.x + (Math.random() - 0.5) * 100,
              y: mousePosition.y + (Math.random() - 0.5) * 100,
            }}
            transition={{ duration: 1 }}
          />
        ))}
      </div>
      
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
              <UserPlus className="w-10 h-10" />
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
            Регистрация
          </motion.h1>
          <motion.p 
            className="text-blue-100/70 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Создайте аккаунт путешественника
          </motion.p>
        </motion.div>
        
        {/* Форма регистрации */}
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
          
          {/* Анимация успешной регистрации */}
          <AnimatePresence>
            {registerSuccess && (
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
                  {/* Анимированный круг с галочкой */}
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
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        <CheckCircle className="w-10 h-10 text-white" />
                      </motion.div>
                    </motion.div>
                    
                    {/* Вращающиеся частицы вокруг */}
                    {Array.from({ length: 12 }).map((_, i) => (
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
                            `${50 + Math.sin(i * Math.PI / 6) * 130}%`
                          ],
                          left: [
                            '50%',
                            `${50 + Math.cos(i * Math.PI / 6) * 130}%`
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
                    Регистрация успешна!
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Поле Имя */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="transform-gpu"
            >
              <div 
                className={`glassmorphic-input relative group cursor-text rounded-xl overflow-hidden ${
                  activeField === 'firstName' 
                    ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]' 
                    : 'hover:shadow-lg'
                } transition-all duration-300`}
                onClick={() => focusField('firstName')}
              >
                {/* Белое стеклянное поле */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md border border-white/50 rounded-xl z-0"></div>
                
                {/* Анимированное свечение при фокусе */}
                {activeField === 'firstName' && (
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
                        scale: activeField === 'firstName' ? [1, 1.2, 1] : 1
                      }}
                      transition={{ 
                        repeat: activeField === 'firstName' ? Infinity : 0,
                        duration: 2
                      }}
                    >
                      <User className="w-5 h-5 text-blue-500" />
                    </motion.div>
                  </div>
                  
                  {/* Лейбл */}
                  <label 
                    htmlFor="firstName"
                    className={`absolute text-sm font-semibold pointer-events-none transition-all duration-200 ${
                      activeField === 'firstName' || formData.firstName 
                      ? 'top-1 left-12 text-xs text-blue-600'  
                      : 'top-4 left-12 text-gray-500'
                    }`}
                  >
                    Имя
                  </label>
                  
                  {/* Поле ввода */}
                  <input
                    ref={firstNameRef}
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onFocus={() => setActiveField('firstName')}
                    onBlur={() => setActiveField(null)}
                    className={`h-full w-full pl-12 pr-4 pt-5 pb-1 bg-transparent text-blue-900 font-medium rounded-xl border-0 focus:ring-0 focus:outline-none z-10 ${
                      activeField === 'firstName' ? 'placeholder-blue-300' : 'placeholder-gray-400'
                    }`}
                    placeholder="Иван"
                    required
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Поле Фамилия */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="transform-gpu"
            >
              <div 
                className={`glassmorphic-input relative group cursor-text rounded-xl overflow-hidden ${
                  activeField === 'lastName' 
                    ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]' 
                    : 'hover:shadow-lg'
                } transition-all duration-300`}
                onClick={() => focusField('lastName')}
              >
                {/* Белое стеклянное поле */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md border border-white/50 rounded-xl z-0"></div>
                
                {/* Анимированное свечение при фокусе */}
                {activeField === 'lastName' && (
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
                        scale: activeField === 'lastName' ? [1, 1.2, 1] : 1
                      }}
                      transition={{ 
                        repeat: activeField === 'lastName' ? Infinity : 0,
                        duration: 2
                      }}
                    >
                      <User className="w-5 h-5 text-blue-500" />
                    </motion.div>
                  </div>
                  
                  {/* Лейбл */}
                  <label 
                    htmlFor="lastName"
                    className={`absolute text-sm font-semibold pointer-events-none transition-all duration-200 ${
                      activeField === 'lastName' || formData.lastName 
                      ? 'top-1 left-12 text-xs text-blue-600'  
                      : 'top-4 left-12 text-gray-500'
                    }`}
                  >
                    Фамилия
                  </label>
                  
                  {/* Поле ввода */}
                  <input
                    ref={lastNameRef}
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onFocus={() => setActiveField('lastName')}
                    onBlur={() => setActiveField(null)}
                    className={`h-full w-full pl-12 pr-4 pt-5 pb-1 bg-transparent text-blue-900 font-medium rounded-xl border-0 focus:ring-0 focus:outline-none z-10 ${
                      activeField === 'lastName' ? 'placeholder-blue-300' : 'placeholder-gray-400'
                    }`}
                    placeholder="Петров"
                    required
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Email поле - белое стекло */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
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
                      <Mail className="w-5 h-5 text-blue-500" />
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
              transition={{ delay: 0.6 }}
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
            
            {/* Кнопка регистрации */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="pt-3"
            >
              <motion.button
                type="submit"
                disabled={isLoading || registerSuccess}
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
                {/* Фон с частицами */}
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
                      <span className="text-sm font-medium">Регистрация...</span>
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
                      <span className="text-sm font-medium mr-2">Зарегистрироваться</span>
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
          
          {/* Ссылка на вход */}
          <motion.div 
            className="text-center pt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="text-blue-100/60 text-sm">Уже есть аккаунт? </span>
            <Link 
              to="/login" 
              className="text-sm text-sky-300 hover:text-sky-200 transition-colors relative group"
            >
              <span>Войти</span>
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
