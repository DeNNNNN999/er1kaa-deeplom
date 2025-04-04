import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import {
  AlertCircle,
  Briefcase,
  CheckCircle,
  Eye,
  EyeOff,
  Globe,
  Key,
  Lock,
  Luggage,
  Mail,
  Map,
  Palmtree,
  Plane,
  RefreshCw,
  Save,
  Shield,
  User,
  UserCheck,
  UserCircle,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function Profile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeFormSection, setActiveFormSection] = useState('profile')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [activeField, setActiveField] = useState(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [animateSuccess, setAnimateSuccess] = useState(false)
  const [travelIcons, setTravelIcons] = useState([])
  const [profileStats, setProfileStats] = useState({
    bookings: Math.floor(Math.random() * 7) + 1,
    reviews: Math.floor(Math.random() * 5),
    wishlist: Math.floor(Math.random() * 10) + 2,
  })

  const containerRef = useRef(null)
  const profileFormRef = useRef(null)
  const passwordFormRef = useRef(null)
  const firstNameRef = useRef(null)
  const lastNameRef = useRef(null)
  const emailRef = useRef(null)
  const currentPasswordRef = useRef(null)
  const newPasswordRef = useRef(null)
  const confirmPasswordRef = useRef(null)

  // Эффект для создания и управления анимированными иконками
  useEffect(() => {
    // Создаем случайные туристические иконки для анимации
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        createTravelIcon()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Эффект отслеживания положения мыши для интерактивности
  useEffect(() => {
    const handleMouseMove = e => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setMousePosition({ x, y })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Создаем туристическую иконку для анимации
  const createTravelIcon = () => {
    const iconComponents = [Plane, Map, Globe, Luggage, Palmtree]
    const IconComponent = iconComponents[Math.floor(Math.random() * iconComponents.length)]

    const newIcon = {
      id: Date.now(),
      icon: IconComponent,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 14 + 8,
      rotate: Math.random() * 360,
      duration: Math.random() * 2 + 2,
    }

    setTravelIcons(prev => [...prev, newIcon])

    setTimeout(() => {
      setTravelIcons(prev => prev.filter(icon => icon.id !== newIcon.id))
    }, newIcon.duration * 1000)
  }

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const focusField = field => {
    if (field === 'firstName') firstNameRef.current.focus()
    if (field === 'lastName') lastNameRef.current.focus()
    if (field === 'email') emailRef.current.focus()
    if (field === 'currentPassword') currentPasswordRef.current.focus()
    if (field === 'newPassword') newPasswordRef.current.focus()
    if (field === 'confirmPassword') confirmPasswordRef.current.focus()

    setActiveField(field)
  }

  // Переключатели видимости паролей
  const toggleCurrentPasswordVisibility = () => setShowCurrentPassword(!showCurrentPassword)
  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword)
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword)

  const updateProfile = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Анимация нажатия кнопки
    if (profileFormRef.current) {
      const button = profileFormRef.current.querySelector('button[type="submit"]')
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      })

      // Создаем эффект частиц при нажатии
      createSubmitParticles(button)
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message)

      setUser(data)
      localStorage.setItem('user', JSON.stringify(data))
      setSuccess('Профиль успешно обновлен')
      setAnimateSuccess(true)

      // Сбрасываем анимацию успеха через 3 секунды
      setTimeout(() => {
        setAnimateSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err.message)

      // Анимируем форму при ошибке
      if (profileFormRef.current) {
        gsap.to(profileFormRef.current, {
          x: [0, -5, 5, -5, 5, 0],
          duration: 0.4,
          ease: 'power2.inOut',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async e => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    // Анимация нажатия кнопки
    if (passwordFormRef.current) {
      const button = passwordFormRef.current.querySelector('button[type="submit"]')
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      })

      // Создаем эффект частиц при нажатии
      createSubmitParticles(button)
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message)

      setSuccess('Пароль успешно изменен')
      setAnimateSuccess(true)

      // Сбрасываем анимацию успеха через 3 секунды
      setTimeout(() => {
        setAnimateSuccess(false)
      }, 3000)

      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
    } catch (err) {
      setError(err.message)

      // Анимируем форму при ошибке
      if (passwordFormRef.current) {
        gsap.to(passwordFormRef.current, {
          x: [0, -5, 5, -5, 5, 0],
          duration: 0.4,
          ease: 'power2.inOut',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // Создаем эффект частиц при отправке формы
  const createSubmitParticles = buttonElement => {
    if (!buttonElement || !containerRef.current) return

    const particleCount = 20
    const buttonRect = buttonElement.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()

    const container = document.createElement('div')
    container.className = 'absolute inset-0 z-50 overflow-hidden pointer-events-none'
    containerRef.current.appendChild(container)

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      const size = Math.random() * 8 + 3
      const color = `hsl(${Math.random() * 60 + 200}, 100%, 65%)`

      particle.className = 'absolute rounded-full'
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.backgroundColor = color
      particle.style.boxShadow = `0 0 6px ${color}`

      // Позиционируем частицы от центра кнопки относительно контейнера
      const startX = buttonRect.left + buttonRect.width / 2 - containerRect.left
      const startY = buttonRect.top + buttonRect.height / 2 - containerRect.top

      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * 100 + 30

      particle.style.left = `${startX}px`
      particle.style.top = `${startY}px`

      particle.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 },
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0.1 },
          {
            transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${
              Math.sin(angle) * distance
            }px))`,
            opacity: 0,
          },
        ],
        {
          duration: Math.random() * 800 + 500,
          easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        },
      )

      container.appendChild(particle)
    }

    setTimeout(() => {
      containerRef.current.removeChild(container)
    }, 1500)
  }

  // Получаем градиент подсветки на основе положения мыши
  const getGlowGradient = () => {
    if (!containerRef.current) return ''

    const { width, height } = containerRef.current.getBoundingClientRect()
    const centerX = (mousePosition.x / width) * 100
    const centerY = (mousePosition.y / height) * 100

    return `radial-gradient(circle at ${centerX}% ${centerY}%, rgba(56, 189, 248, 0.4) 0%, rgba(59, 130, 246, 0.2) 25%, rgba(0, 0, 0, 0) 50%)`
  }

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto py-8 px-4 relative min-h-[80vh]">
      {/* Анимированные иконки путешествий */}
      <AnimatePresence>
        {travelIcons.map(icon => {
          const IconComponent = icon.icon
          return (
            <motion.div
              key={icon.id}
              className="absolute z-10 pointer-events-none text-blue-200/60"
              initial={{
                opacity: 0,
                x: `${icon.x}%`,
                y: `${icon.y}%`,
                rotate: icon.rotate,
                scale: 0,
              }}
              animate={{
                opacity: [0, 0.7, 0],
                y: [`${icon.y}%`, `${icon.y - 15}%`],
                scale: [0, 1, 0.5],
              }}
              transition={{
                duration: icon.duration,
                ease: 'easeInOut',
              }}
              style={{
                width: `${icon.size}px`,
                height: `${icon.size}px`,
              }}>
              <IconComponent className="w-full h-full" />
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Заголовок с аватаром */}
      <div className="relative mb-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center">
          {/* Аватар пользователя */}
          <motion.div
            className="relative w-24 h-24 mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}>
            {/* Пульсирующий фон за аватаром */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400/30 to-blue-600/30 blur-lg"
            />

            {/* Вращающееся кольцо вокруг аватара */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(56, 189, 248, 0), rgba(56, 189, 248, 0.7), rgba(59, 130, 246, 0.7), rgba(56, 189, 248, 0))',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />

            {/* Центральный аватар */}
            <div className="absolute flex items-center justify-center rounded-full inset-2 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-md">
              <motion.div
                className="text-blue-500"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}>
                <UserCircle className="w-16 h-16" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
            {user.firstName} {user.lastName}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center mt-1 text-blue-500/70">
            <Mail className="w-4 h-4 mr-1.5" />
            <span>{user.email}</span>
          </motion.div>

          {/* Статистика профиля */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center mt-5 space-x-6">
            <motion.div className="flex flex-col items-center" whileHover={{ y: -3 }}>
              <div className="flex items-center justify-center w-10 h-10 mb-1 rounded-full bg-blue-500/10">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Бронирований</span>
              <span className="font-bold text-blue-700">{profileStats.bookings}</span>
            </motion.div>

            <motion.div className="flex flex-col items-center" whileHover={{ y: -3 }}>
              <div className="flex items-center justify-center w-10 h-10 mb-1 rounded-full bg-blue-500/10">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Отзывов</span>
              <span className="font-bold text-blue-700">{profileStats.reviews}</span>
            </motion.div>

            <motion.div className="flex flex-col items-center" whileHover={{ y: -3 }}>
              <div className="flex items-center justify-center w-10 h-10 mb-1 rounded-full bg-blue-500/10">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Избранное</span>
              <span className="font-bold text-blue-700">{profileStats.wishlist}</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Сообщения об ошибке и успехе */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center p-4 mb-6 text-red-600 border rounded-xl bg-red-500/20 backdrop-blur-sm border-red-500/30">
            <AlertCircle className="flex-shrink-0 w-5 h-5 mr-3" />
            {error}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setError('')}
              className="ml-auto">
              <X className="w-5 h-5 text-red-500" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center p-4 mb-6 text-green-600 border rounded-xl bg-green-500/20 backdrop-blur-sm border-green-500/30">
            <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3" />
            {success}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSuccess('')}
              className="ml-auto">
              <X className="w-5 h-5 text-green-500" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Анимация успешного сохранения */}
      <AnimatePresence>
        {animateSuccess && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="flex flex-col items-center justify-center w-full max-w-sm p-6 mx-4 bg-gradient-to-br from-green-500/80 to-blue-400/80 backdrop-blur-md rounded-2xl">
              {/* Анимированный круг с иконкой */}
              <div className="relative mb-4">
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(56, 189, 248, 0.7)',
                      '0 0 0 15px rgba(56, 189, 248, 0)',
                      '0 0 0 0 rgba(56, 189, 248, 0)',
                    ],
                  }}
                  transition={{
                    repeat: 3,
                    duration: 1,
                  }}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-blue-400">
                  <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>

                {/* Вращающиеся частицы вокруг */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={`particle-${i}`}
                    className="absolute w-2 h-2 bg-blue-200 rounded-full"
                    initial={{
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    animate={{
                      top: ['50%', `${50 + Math.sin((i * Math.PI) / 4) * 150}%`],
                      left: ['50%', `${50 + Math.cos((i * Math.PI) / 4) * 150}%`],
                    }}
                    transition={{
                      duration: 0.5,
                      ease: 'easeOut',
                    }}
                    style={{
                      opacity: 0.7,
                    }}
                  />
                ))}
              </div>

              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold text-center text-white">
                Успешно сохранено!
              </motion.h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Переключатель форм */}
      <div className="flex justify-center mb-8">
        <div className="flex p-1 border rounded-xl bg-blue-500/10 backdrop-blur-sm border-blue-500/20">
          <motion.button
            onClick={() => setActiveFormSection('profile')}
            className={`relative flex items-center px-4 py-2 rounded-lg ${
              activeFormSection === 'profile' ? 'text-white' : 'text-blue-600 hover:text-blue-500'
            }`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}>
            <UserCheck className="w-5 h-5 mr-2" />
            <span>Личные данные</span>

            {activeFormSection === 'profile' && (
              <motion.div
                layoutId="activeSectionBackground"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-blue-400 -z-10"
                initial={false}
                transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
              />
            )}
          </motion.button>

          <motion.button
            onClick={() => setActiveFormSection('password')}
            className={`relative flex items-center px-4 py-2 rounded-lg ${
              activeFormSection === 'password' ? 'text-white' : 'text-blue-600 hover:text-blue-500'
            }`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}>
            <Shield className="w-5 h-5 mr-2" />
            <span>Изменить пароль</span>

            {activeFormSection === 'password' && (
              <motion.div
                layoutId="activeSectionBackground"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-blue-400 -z-10"
                initial={false}
                transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
              />
            )}
          </motion.button>
        </div>
      </div>

      {/* Формы */}
      <AnimatePresence mode="wait">
        {activeFormSection === 'profile' ? (
          <motion.div
            key="profileForm"
            ref={profileFormRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl transform-gpu"
            style={{
              backgroundImage: getGlowGradient(),
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
              boxShadow:
                '0 20px 50px -20px rgba(56, 189, 248, 0.3), 0 0 30px -10px rgba(14, 165, 233, 0.2), inset 0 0 1px 1px rgba(255, 255, 255, 0.4)',
            }}>
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
                    x: Math.random() * 100 + '%',
                    y: '100%',
                    width: `${Math.random() * 15 + 5}px`,
                    height: `${Math.random() * 15 + 5}px`,
                  }}
                  animate={{
                    y: ['100%', `${Math.random() * -20}%`],
                    opacity: [0, 0.4, 0],
                  }}
                  transition={{
                    duration: Math.random() * 10 + 10,
                    repeat: Infinity,
                    delay: Math.random() * 20,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 p-8 space-y-6">
              <div className="flex items-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 8 }}
                  className="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-blue-500/10">
                  <User className="w-6 h-6 text-blue-600" />
                </motion.div>
                <h2 className="text-2xl font-semibold text-blue-900">Личные данные</h2>
              </div>

              <form onSubmit={updateProfile} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Поле Имя */}
                  <div>
                    <div
                      className={`glassmorphic-input relative group cursor-text rounded-xl overflow-hidden ${
                        activeField === 'firstName'
                          ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                          : 'hover:shadow-lg'
                      } transition-all duration-300`}
                      onClick={() => focusField('firstName')}>
                      {/* Белое стеклянное поле */}
                      <div className="absolute inset-0 z-0 border bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md border-white/50 rounded-xl"></div>

                      {/* Анимированное свечение при фокусе */}
                      {activeField === 'firstName' && (
                        <motion.div
                          className="absolute inset-0 z-0 bg-blue-400/20"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0.1, 0.3, 0.1],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                          }}
                        />
                      )}

                      <div className="relative z-10 h-14">
                        {/* Иконка */}
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <motion.div
                            animate={{
                              scale: activeField === 'firstName' ? [1, 1.2, 1] : 1,
                            }}
                            transition={{
                              repeat: activeField === 'firstName' ? Infinity : 0,
                              duration: 2,
                            }}>
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
                          }`}>
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
                          placeholder="Ваше имя"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Поле Фамилия */}
                  <div>
                    <div
                      className={`glassmorphic-input relative group cursor-text rounded-xl overflow-hidden ${
                        activeField === 'lastName'
                          ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                          : 'hover:shadow-lg'
                      } transition-all duration-300`}
                      onClick={() => focusField('lastName')}>
                      {/* Белое стеклянное поле */}
                      <div className="absolute inset-0 z-0 border bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md border-white/50 rounded-xl"></div>

                      {/* Анимированное свечение при фокусе */}
                      {activeField === 'lastName' && (
                        <motion.div
                          className="absolute inset-0 z-0 bg-blue-400/20"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0.1, 0.3, 0.1],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                          }}
                        />
                      )}

                      <div className="relative z-10 h-14">
                        {/* Иконка */}
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <motion.div
                            animate={{
                              scale: activeField === 'lastName' ? [1, 1.2, 1] : 1,
                            }}
                            transition={{
                              repeat: activeField === 'lastName' ? Infinity : 0,
                              duration: 2,
                            }}>
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
                          }`}>
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
                          placeholder="Ваша фамилия"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Поле Email */}
                <div>
                  <div
                    className={`glassmorphic-input relative group cursor-text rounded-xl overflow-hidden ${
                      activeField === 'email'
                        ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                        : 'hover:shadow-lg'
                    } transition-all duration-300`}
                    onClick={() => focusField('email')}>
                    {/* Белое стеклянное поле */}
                    <div className="absolute inset-0 z-0 border bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md border-white/50 rounded-xl"></div>

                    {/* Анимированное свечение при фокусе */}
                    {activeField === 'email' && (
                      <motion.div
                        className="absolute inset-0 z-0 bg-blue-400/20"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                        }}
                      />
                    )}

                    <div className="relative z-10 h-14">
                      {/* Иконка */}
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <motion.div
                          animate={{
                            scale: activeField === 'email' ? [1, 1.2, 1] : 1,
                          }}
                          transition={{
                            repeat: activeField === 'email' ? Infinity : 0,
                            duration: 2,
                          }}>
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
                        }`}>
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
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 10px 25px -5px rgba(56, 189, 248, 0.5)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex items-center justify-center w-full mt-6 overflow-hidden font-bold text-white h-14 rounded-xl"
                  style={{
                    background: 'linear-gradient(to right, rgb(56, 189, 248), rgb(59, 130, 246))',
                  }}>
                  {/* Анимированная текстура для кнопки */}
                  <div className="absolute inset-0 overflow-hidden opacity-30">
                    <div
                      className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDEwIGM1IDAgNSAtMTAgMTAgLTEwIHM1IDEwIDEwIDEwIHM1IC0xMCAxMCAtMTAgczUgMTAgMTAgMTAgczUgLTEwIDEwIC0xMCBzNSAxMCAxMCAxMCBzNSAtMTAgMTAgLTEwIHM1IDEwIDEwIDEwIHM1IC0xMCAxMCAtMTAgczUgMTAgMTAgMTApIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')]"
                      style={{
                        backgroundSize: '100px 20px',
                        animation: 'background-pan 20s linear infinite',
                      }}
                    />
                  </div>

                  {/* Блик для эффекта стекла */}
                  <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/20 to-transparent" />

                  {/* Контент кнопки */}
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loading"
                        className="flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}>
                        <div className="mr-2 loader-spinner"></div>
                        <span className="text-sm font-medium">Сохранение...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="button"
                        className="flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}>
                        <Save className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Сохранить изменения</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="passwordForm"
            ref={passwordFormRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl transform-gpu"
            style={{
              backgroundImage: getGlowGradient(),
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
              boxShadow:
                '0 20px 50px -20px rgba(56, 189, 248, 0.3), 0 0 30px -10px rgba(14, 165, 233, 0.2), inset 0 0 1px 1px rgba(255, 255, 255, 0.4)',
            }}>
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
                    x: Math.random() * 100 + '%',
                    y: '100%',
                    width: `${Math.random() * 15 + 5}px`,
                    height: `${Math.random() * 15 + 5}px`,
                  }}
                  animate={{
                    y: ['100%', `${Math.random() * -20}%`],
                    opacity: [0, 0.4, 0],
                  }}
                  transition={{
                    duration: Math.random() * 10 + 10,
                    repeat: Infinity,
                    delay: Math.random() * 20,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 p-8 space-y-6">
              <div className="flex items-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 8 }}
                  className="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-blue-500/10">
                  <Key className="w-6 h-6 text-blue-600" />
                </motion.div>
                <h2 className="text-2xl font-semibold text-blue-900">Изменить пароль</h2>
              </div>

              <form onSubmit={updatePassword} className="space-y-5">
                {/* Поле Текущий пароль */}
                <div>
                  <div
                    className={`glassmorphic-input relative group cursor-text rounded-xl overflow-hidden ${
                      activeField === 'currentPassword'
                        ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                        : 'hover:shadow-lg'
                    } transition-all duration-300`}
                    onClick={() => focusField('currentPassword')}>
                    {/* Белое стеклянное поле */}
                    <div className="absolute inset-0 z-0 border bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md border-white/50 rounded-xl"></div>

                    {/* Анимированное свечение при фокусе */}
                    {activeField === 'currentPassword' && (
                      <motion.div
                        className="absolute inset-0 z-0 bg-blue-400/20"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                        }}
                      />
                    )}

                    <div className="relative z-10 h-14">
                      {/* Иконка */}
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <motion.div
                          animate={{
                            scale: activeField === 'currentPassword' ? [1, 1.2, 1] : 1,
                          }}
                          transition={{
                            repeat: activeField === 'currentPassword' ? Infinity : 0,
                            duration: 2,
                          }}>
                          <Lock className="w-5 h-5 text-blue-500" />
                        </motion.div>
                      </div>

                      {/* Кнопка показа/скрытия пароля */}
                      <div className="absolute inset-y-0 right-0 z-20 flex items-center pr-3">
                        <motion.button
                          type="button"
                          onClick={toggleCurrentPasswordVisibility}
                          className="p-1 text-blue-500 rounded-full hover:text-blue-700 focus:outline-none hover:bg-blue-100/50"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}>
                          {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </motion.button>
                      </div>

                      {/* Лейбл */}
                      <label
                        htmlFor="currentPassword"
                        className={`absolute text-sm font-semibold pointer-events-none transition-all duration-200 ${
                          activeField === 'currentPassword' || formData.currentPassword
                            ? 'top-1 left-12 text-xs text-blue-600'
                            : 'top-4 left-12 text-gray-500'
                        }`}>
                        Текущий пароль
                      </label>

                      {/* Поле ввода */}
                      <input
                        ref={currentPasswordRef}
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        onFocus={() => setActiveField('currentPassword')}
                        onBlur={() => setActiveField(null)}
                        className={`h-full w-full pl-12 pr-12 pt-5 pb-1 bg-transparent text-blue-900 font-medium rounded-xl border-0 focus:ring-0 focus:outline-none z-10 ${
                          activeField === 'currentPassword' ? 'placeholder-blue-300' : 'placeholder-gray-400'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Поле Новый пароль */}
                <div>
                  <div
                    className={`glassmorphic-input relative group cursor-text rounded-xl overflow-hidden ${
                      activeField === 'newPassword'
                        ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                        : 'hover:shadow-lg'
                    } transition-all duration-300`}
                    onClick={() => focusField('newPassword')}>
                    {/* Белое стеклянное поле */}
                    <div className="absolute inset-0 z-0 border bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md border-white/50 rounded-xl"></div>

                    {/* Анимированное свечение при фокусе */}
                    {activeField === 'newPassword' && (
                      <motion.div
                        className="absolute inset-0 z-0 bg-blue-400/20"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                        }}
                      />
                    )}

                    <div className="relative z-10 h-14">
                      {/* Иконка */}
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <motion.div
                          animate={{
                            scale: activeField === 'newPassword' ? [1, 1.2, 1] : 1,
                          }}
                          transition={{
                            repeat: activeField === 'newPassword' ? Infinity : 0,
                            duration: 2,
                          }}>
                          <Lock className="w-5 h-5 text-blue-500" />
                        </motion.div>
                      </div>

                      {/* Кнопка показа/скрытия пароля */}
                      <div className="absolute inset-y-0 right-0 z-20 flex items-center pr-3">
                        <motion.button
                          type="button"
                          onClick={toggleNewPasswordVisibility}
                          className="p-1 text-blue-500 rounded-full hover:text-blue-700 focus:outline-none hover:bg-blue-100/50"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}>
                          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </motion.button>
                      </div>

                      {/* Лейбл */}
                      <label
                        htmlFor="newPassword"
                        className={`absolute text-sm font-semibold pointer-events-none transition-all duration-200 ${
                          activeField === 'newPassword' || formData.newPassword
                            ? 'top-1 left-12 text-xs text-blue-600'
                            : 'top-4 left-12 text-gray-500'
                        }`}>
                        Новый пароль
                      </label>

                      {/* Поле ввода */}
                      <input
                        ref={newPasswordRef}
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        onFocus={() => setActiveField('newPassword')}
                        onBlur={() => setActiveField(null)}
                        className={`h-full w-full pl-12 pr-12 pt-5 pb-1 bg-transparent text-blue-900 font-medium rounded-xl border-0 focus:ring-0 focus:outline-none z-10 ${
                          activeField === 'newPassword' ? 'placeholder-blue-300' : 'placeholder-gray-400'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Поле Подтверждение пароля */}
                <div>
                  <div
                    className={`glassmorphic-input relative group cursor-text rounded-xl overflow-hidden ${
                      activeField === 'confirmPassword'
                        ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                        : 'hover:shadow-lg'
                    } transition-all duration-300`}
                    onClick={() => focusField('confirmPassword')}>
                    {/* Белое стеклянное поле */}
                    <div className="absolute inset-0 z-0 border bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md border-white/50 rounded-xl"></div>

                    {/* Анимированное свечение при фокусе */}
                    {activeField === 'confirmPassword' && (
                      <motion.div
                        className="absolute inset-0 z-0 bg-blue-400/20"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                        }}
                      />
                    )}

                    <div className="relative z-10 h-14">
                      {/* Иконка */}
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <motion.div
                          animate={{
                            scale: activeField === 'confirmPassword' ? [1, 1.2, 1] : 1,
                          }}
                          transition={{
                            repeat: activeField === 'confirmPassword' ? Infinity : 0,
                            duration: 2,
                          }}>
                          <Lock className="w-5 h-5 text-blue-500" />
                        </motion.div>
                      </div>

                      {/* Кнопка показа/скрытия пароля */}
                      <div className="absolute inset-y-0 right-0 z-20 flex items-center pr-3">
                        <motion.button
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                          className="p-1 text-blue-500 rounded-full hover:text-blue-700 focus:outline-none hover:bg-blue-100/50"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}>
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </motion.button>
                      </div>

                      {/* Лейбл */}
                      <label
                        htmlFor="confirmPassword"
                        className={`absolute text-sm font-semibold pointer-events-none transition-all duration-200 ${
                          activeField === 'confirmPassword' || formData.confirmPassword
                            ? 'top-1 left-12 text-xs text-blue-600'
                            : 'top-4 left-12 text-gray-500'
                        }`}>
                        Подтверждение пароля
                      </label>

                      {/* Поле ввода */}
                      <input
                        ref={confirmPasswordRef}
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onFocus={() => setActiveField('confirmPassword')}
                        onBlur={() => setActiveField(null)}
                        className={`h-full w-full pl-12 pr-12 pt-5 pb-1 bg-transparent text-blue-900 font-medium rounded-xl border-0 focus:ring-0 focus:outline-none z-10 ${
                          activeField === 'confirmPassword' ? 'placeholder-blue-300' : 'placeholder-gray-400'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 10px 25px -5px rgba(56, 189, 248, 0.5)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex items-center justify-center w-full mt-6 overflow-hidden font-bold text-white h-14 rounded-xl"
                  style={{
                    background: 'linear-gradient(to right, rgb(56, 189, 248), rgb(59, 130, 246))',
                  }}>
                  {/* Анимированная текстура для кнопки */}
                  <div className="absolute inset-0 overflow-hidden opacity-30">
                    <div
                      className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDEwIGM1IDAgNSAtMTAgMTAgLTEwIHM1IDEwIDEwIDEwIHM1IC0xMCAxMCAtMTAgczUgMTAgMTAgMTAgczUgLTEwIDEwIC0xMCBzNSAxMCAxMCAxMCBzNSAtMTAgMTAgLTEwIHM1IDEwIDEwIDEwIHM1IC0xMCAxMCAtMTAgczUgMTAgMTAgMTApIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')]"
                      style={{
                        backgroundSize: '100px 20px',
                        animation: 'background-pan 20s linear infinite',
                      }}
                    />
                  </div>

                  {/* Блик для эффекта стекла */}
                  <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/20 to-transparent" />

                  {/* Контент кнопки */}
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loading"
                        className="flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}>
                        <div className="mr-2 loader-spinner"></div>
                        <span className="text-sm font-medium">Изменение...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="button"
                        className="flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}>
                        <RefreshCw className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Изменить пароль</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          to {
            transform: rotate(360deg);
          }
        }

        .glassmorphic-input {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
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
    </div>
  )
}

// Иконка для сердечка (wishlist)
function Heart(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )
}

// Иконка для звезды (review)
function Star(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
