import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  PercentCircle, 
  Sparkles, 
  Tag, 
  ChevronRight, 
  Gift, 
  Clock,
  ArrowDown,
  Check,
  Info,
  X,
  DollarSign,
  Star,
  Map,
  ArrowRight
} from 'lucide-react'

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState([])
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState(null)
  const [formData, setFormData] = useState({
    tourId: '',
    percentage: '',
    startDate: '',
    endDate: '',
    description: ''
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [successVisible, setSuccessVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeField, setActiveField] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState([])
  
  const formRef = useRef(null)
  const containerRef = useRef(null)

  // Эффект отслеживания положения мыши для интерактивности
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const formRect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - formRect.left;
        const y = e.clientY - formRect.top;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Эффект для создания декоративных частиц
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        createParticle();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const createParticle = () => {
    const newParticle = {
      id: Date.now(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 15 + 5,
      opacity: Math.random() * 0.3 + 0.2,
      duration: Math.random() * 5 + 3
    };
    
    setParticles(prev => [...prev, newParticle]);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, newParticle.duration * 1000);
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchDiscounts()
    fetchTours()
  }, [])

  // Метод для загрузки скидок
  const fetchDiscounts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/admin/discounts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке скидок')
      }
      
      const data = await response.json()
      setDiscounts(data)
    } catch (err) {
      setError('Ошибка при загрузке скидок: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Метод для загрузки туров
  const fetchTours = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tours')
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке туров')
      }
      
      const data = await response.json()
      setTours(data)
    } catch (err) {
      console.error('Ошибка при загрузке туров:', err)
    }
  }

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Эффект частиц при подтверждении
    createFormSubmitEffect()
    
    try {
      const token = localStorage.getItem('token')
      const url = editingDiscount
        ? `http://localhost:5000/api/admin/discounts/${editingDiscount.id}`
        : 'http://localhost:5000/api/admin/discounts'
      
      const response = await fetch(url, {
        method: editingDiscount ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка при сохранении скидки')
      }
      
      // Анимация успеха
      setSuccessMessage(editingDiscount ? 'Скидка успешно обновлена!' : 'Новая скидка успешно создана!')
      setSuccessVisible(true)
      
      setTimeout(() => {
        setSuccessVisible(false)
        setShowForm(false)
        setEditingDiscount(null)
        setFormData({
          tourId: '',
          percentage: '',
          startDate: '',
          endDate: '',
          description: ''
        })
        fetchDiscounts()
      }, 1500)
    } catch (err) {
      setError(err.message)
      
      // Анимация тряски при ошибке
      if (formRef.current) {
        formRef.current.classList.add('shake-animation')
        setTimeout(() => formRef.current.classList.remove('shake-animation'), 600)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Создание эффекта при отправке формы
  const createFormSubmitEffect = () => {
    if (!formRef.current) return;
    
    const particleCount = 30;
    const formRect = formRef.current.getBoundingClientRect();
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 10 + 5;
      const color = `hsl(${Math.random() * 40 + 200}, 100%, 60%)`;
      
      particle.className = 'absolute rounded-full';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.boxShadow = `0 0 10px ${color}`;
      particle.style.position = 'fixed';
      particle.style.zIndex = '9999';
      particle.style.pointerEvents = 'none';
      
      const submitButton = formRef.current.querySelector('button[type="submit"]');
      const buttonRect = submitButton.getBoundingClientRect();
      
      const startX = buttonRect.left + buttonRect.width / 2;
      const startY = buttonRect.top + buttonRect.height / 2;
      
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 150 + 50;
      
      document.body.appendChild(particle);
      
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
      
      setTimeout(() => {
        document.body.removeChild(particle);
      }, 2000);
    }
  };

  // Метод для удаления скидки
  const handleDelete = async (discountId) => {
    if (!confirm('Вы уверены, что хотите удалить эту скидку?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/discounts/${discountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка при удалении скидки')
      }
      
      // Анимация удаления
      setSuccessMessage('Скидка успешно удалена!')
      setSuccessVisible(true)
      
      setTimeout(() => {
        setSuccessVisible(false)
        fetchDiscounts()
      }, 1500)
    } catch (err) {
      setError(err.message)
    }
  }

  // Начать редактирование скидки
  const startEdit = (discount) => {
    setEditingDiscount(discount)
    setFormData({
      tourId: discount.tourId,
      percentage: discount.percentage,
      startDate: new Date(discount.startDate).toISOString().split('T')[0],
      endDate: new Date(discount.endDate).toISOString().split('T')[0],
      description: discount.description || ''
    })
    setShowForm(true)
    
    // Анимация скролла к форме
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Вычисляем градиент подсветки на основе положения мыши
  const getGlowGradient = () => {
    if (!containerRef.current) return '';
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    const centerX = mousePosition.x / width * 100;
    const centerY = mousePosition.y / height * 100;
    
    return `radial-gradient(circle at ${centerX}% ${centerY}%, rgba(56, 189, 248, 0.2) 0%, rgba(59, 130, 246, 0.1) 25%, rgba(0, 0, 0, 0) 50%)`;
  }

  const setFieldActive = (fieldName) => {
    setActiveField(fieldName)
  }

  // Рендеринг загрузки
  if (loading && discounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full mb-4"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-blue-600 font-medium"
        >
          Загрузка скидок...
        </motion.p>
      </div>
    )
  }

  // Рендеринг ошибки
  if (error) {
    return (
      <motion.div 
        className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Info className="w-6 h-6 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Произошла ошибка</h3>
            <p className="mt-2 text-red-700">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchDiscounts();
              }}
              className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="space-y-8 relative"
      style={{ backgroundImage: getGlowGradient() }}
    >
      {/* Плавающие частицы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-blue-400/30"
              initial={{ 
                opacity: 0, 
                x: `${particle.x}%`, 
                y: `${particle.y}%`,
                scale: 0
              }}
              animate={{ 
                opacity: particle.opacity,
                scale: 1,
                y: [`${particle.y}%`, `${particle.y - 15}%`]
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
      
      {/* Уведомление об успехе */}
      <AnimatePresence>
        {successVisible && (
          <motion.div 
            className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border-l-4 border-green-500 p-4 rounded-lg shadow-lg flex items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Check className="w-6 h-6 text-green-500 mr-3" />
            <span className="text-green-800">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3"
        >
          <div className="p-2 bg-gradient-to-br from-blue-500 to-sky-400 rounded-lg shadow-md">
            <PercentCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-500">
            Управление скидками
          </h2>
        </motion.div>
        
        <motion.button
          onClick={() => {
            setEditingDiscount(null);
            setFormData({
              tourId: '',
              percentage: '',
              startDate: '',
              endDate: '',
              description: ''
            });
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-lg shadow-md relative overflow-hidden group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Анимированный фон */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundSize: '100px 20px',
              animation: 'background-pan 20s linear infinite'
            }}
          />
          
          {/* Блик верхний */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent" />
          
          <Plus className="w-5 h-5 mr-2 relative z-10" />
          <span className="relative z-10">Добавить скидку</span>
          
          {/* Анимированная стрелка */}
          <motion.div
            className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </div>

      {/* Форма добавления/редактирования */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-xl"
          >
            {/* Стеклянный фон */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 to-white/70 backdrop-blur-sm rounded-xl z-0"></div>
            
            {/* Блестящая рамка */}
            <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-blue-400/30 via-transparent to-sky-400/30 pointer-events-none"></div>
            
            {/* Случайные блики */}
            <div className="absolute -top-60 -right-60 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-60 -left-60 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative p-6 z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-blue-800 flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-blue-600" />
                  {editingDiscount ? 'Редактирование скидки' : 'Создание новой скидки'}
                </h3>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowForm(false);
                    setEditingDiscount(null);
                  }}
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Поле выбора тура */}
                  <div>
                    <label 
                      className={`block text-sm font-medium mb-1 transition-colors ${
                        activeField === 'tourId' ? 'text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      Тур
                    </label>
                    <div 
                      className={`relative rounded-lg overflow-hidden transition-all ${
                        activeField === 'tourId' 
                          ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                          : 'ring-1 ring-gray-200 hover:ring-blue-200'
                      }`}
                    >
                      <select
                        value={formData.tourId}
                        onChange={(e) => setFormData({ ...formData, tourId: e.target.value })}
                        onFocus={() => setFieldActive('tourId')}
                        onBlur={() => setFieldActive(null)}
                        className="block w-full px-4 py-3 bg-white rounded-lg focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Выберите тур</option>
                        {tours.map(tour => (
                          <option key={tour.id} value={tour.id}>
                            {tour.title}
                          </option>
                        ))}
                      </select>
                      
                      {/* Иконка */}
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                        <motion.div
                          animate={{ y: activeField === 'tourId' ? [0, -4, 0] : 0 }}
                          transition={{ repeat: activeField === 'tourId' ? Infinity : 0, duration: 2 }}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Поле процент скидки */}
                  <div>
                    <label 
                      className={`block text-sm font-medium mb-1 transition-colors ${
                        activeField === 'percentage' ? 'text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      Процент скидки
                    </label>
                    <div 
                      className={`relative rounded-lg overflow-hidden transition-all ${
                        activeField === 'percentage' 
                          ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                          : 'ring-1 ring-gray-200 hover:ring-blue-200'
                      }`}
                    >
                      <input
                        type="number"
                        value={formData.percentage}
                        onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                        onFocus={() => setFieldActive('percentage')}
                        onBlur={() => setFieldActive(null)}
                        className="block w-full pl-10 pr-4 py-3 bg-white rounded-lg focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                        min="1"
                        max="100"
                        disabled={isSubmitting}
                      />
                      
                      {/* Иконка */}
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 pointer-events-none">
                        <motion.div
                          animate={{ 
                            rotate: activeField === 'percentage' ? [0, 360] : 0,
                            scale: activeField === 'percentage' ? [1, 1.2, 1] : 1
                          }}
                          transition={{ 
                            rotate: { repeat: activeField === 'percentage' ? Infinity : 0, duration: 2 },
                            scale: { repeat: activeField === 'percentage' ? Infinity : 0, duration: 1.5 }
                          }}
                        >
                          <PercentCircle className="w-5 h-5" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Поле дата начала */}
                  <div>
                    <label 
                      className={`block text-sm font-medium mb-1 transition-colors ${
                        activeField === 'startDate' ? 'text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      Дата начала
                    </label>
                    <div 
                      className={`relative rounded-lg overflow-hidden transition-all ${
                        activeField === 'startDate' 
                          ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                          : 'ring-1 ring-gray-200 hover:ring-blue-200'
                      }`}
                    >
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        onFocus={() => setFieldActive('startDate')}
                        onBlur={() => setFieldActive(null)}
                        className="block w-full pl-10 pr-4 py-3 bg-white rounded-lg focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                        disabled={isSubmitting}
                      />
                      
                      {/* Иконка */}
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 pointer-events-none">
                        <motion.div
                          animate={{ 
                            y: activeField === 'startDate' ? [0, -4, 0] : 0
                          }}
                          transition={{ 
                            repeat: activeField === 'startDate' ? Infinity : 0, 
                            duration: 1.5 
                          }}
                        >
                          <Calendar className="w-5 h-5" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Поле дата окончания */}
                  <div>
                    <label 
                      className={`block text-sm font-medium mb-1 transition-colors ${
                        activeField === 'endDate' ? 'text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      Дата окончания
                    </label>
                    <div 
                      className={`relative rounded-lg overflow-hidden transition-all ${
                        activeField === 'endDate' 
                          ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                          : 'ring-1 ring-gray-200 hover:ring-blue-200'
                      }`}
                    >
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        onFocus={() => setFieldActive('endDate')}
                        onBlur={() => setFieldActive(null)}
                        className="block w-full pl-10 pr-4 py-3 bg-white rounded-lg focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                        disabled={isSubmitting}
                      />
                      
                      {/* Иконка */}
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 pointer-events-none">
                        <motion.div
                          animate={{ 
                            y: activeField === 'endDate' ? [0, -4, 0] : 0
                          }}
                          transition={{ 
                            repeat: activeField === 'endDate' ? Infinity : 0, 
                            duration: 1.5 
                          }}
                        >
                          <Calendar className="w-5 h-5" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Поле описание */}
                  <div className="md:col-span-2">
                    <label 
                      className={`block text-sm font-medium mb-1 transition-colors ${
                        activeField === 'description' ? 'text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      Описание
                    </label>
                    <div 
                      className={`relative rounded-lg overflow-hidden transition-all ${
                        activeField === 'description' 
                          ? 'ring-2 ring-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                          : 'ring-1 ring-gray-200 hover:ring-blue-200'
                      }`}
                    >
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        onFocus={() => setFieldActive('description')}
                        onBlur={() => setFieldActive(null)}
                        rows="3"
                        className="block w-full pl-10 pr-4 py-3 bg-white rounded-lg focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Необязательное описание для скидки"
                        disabled={isSubmitting}
                      />
                      
                      {/* Иконка */}
                      <div className="absolute left-3 top-6 text-blue-500 pointer-events-none">
                        <motion.div
                          animate={{ 
                            rotate: activeField === 'description' ? [0, 10, 0, -10, 0] : 0
                          }}
                          transition={{ 
                            repeat: activeField === 'description' ? Infinity : 0, 
                            duration: 2
                          }}
                        >
                          <Gift className="w-5 h-5" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingDiscount(null)
                    }}
                    className="px-5 py-3 text-gray-700 bg-gray-100 rounded-lg flex items-center space-x-2"
                    whileHover={{ scale: 1.02, backgroundColor: '#f3f4f6' }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                    <span>Отмена</span>
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    className="px-5 py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-lg flex items-center space-x-2 relative overflow-hidden"
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                  >
                    {/* Анимированный блик */}
                    <div className="absolute inset-0">
                      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/20 to-transparent" />
                      <motion.div 
                        className="absolute inset-0 bg-white/10"
                        animate={{ 
                          x: [-100, 250],
                          opacity: [0, 0.1, 0.2, 0.1, 0]
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1.5,
                          ease: "easeInOut"
                        }}
                        style={{
                          clipPath: "polygon(0 0, 30% 0, 60% 100%, 0% 100%)"
                        }}
                      />
                    </div>
                    
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Обработка...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{editingDiscount ? 'Сохранить' : 'Создать'}</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Список скидок */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <AnimatePresence>
          {discounts.length === 0 && !loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-8 text-center"
            >
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Tag className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-medium text-blue-800 mb-2">Скидки не найдены</h3>
              <p className="text-blue-600 mb-6">Создайте первую скидку, чтобы привлечь больше клиентов</p>
              <motion.button
                onClick={() => {
                  setEditingDiscount(null);
                  setFormData({
                    tourId: '',
                    percentage: '',
                    startDate: '',
                    endDate: '',
                    description: ''
                  });
                  setShowForm(true);
                }}
                className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-lg shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5 mr-2" />
                <span>Добавить первую скидку</span>
              </motion.button>
            </motion.div>
          ) : (
            discounts.map((discount, index) => (
              <motion.div
                key={discount.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="relative overflow-hidden rounded-xl group hover:shadow-lg transition-shadow"
              >
                {/* Фон карточки */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50/70 rounded-xl z-0"></div>
                
                {/* Блестящая рамка */}
                <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-blue-400/20 via-transparent to-sky-400/20 pointer-events-none"></div>
                
                {/* Контент */}
                <div className="relative p-6 z-10">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 max-w-[calc(100%-60px)]">
                      {/* Название тура */}
                      <div className="flex items-center">
                        <motion.div
                          className="p-1.5 mr-2 rounded-lg bg-blue-100 text-blue-600"
                          whileHover={{ rotate: 10 }}
                        >
                          <Map className="w-4 h-4" />
                        </motion.div>
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {discount.Tour?.title || 'Неизвестный тур'}
                        </h3>
                      </div>
                      
                      {/* Процент скидки */}
                      <div className="flex items-center">
                        <motion.div
                          animate={{ rotate: [0, 5, 0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 5 }}
                          className="relative"
                        >
                          <div className="absolute -inset-1 rounded-full bg-green-200/50 blur-md"></div>
                          <p className="relative text-3xl font-bold text-green-600 flex items-center">
                            <DollarSign className="w-6 h-6 mr-0.5" /> 
                            <span>-{discount.percentage}%</span>
                          </p>
                        </motion.div>
                      </div>
                      
                      {/* Даты */}
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="flex items-center mr-3">
                          <Clock className="w-4 h-4 mr-1 text-blue-500" />
                          <span>С {new Date(discount.startDate).toLocaleDateString()}</span>
                        </div>
                        <ArrowRight className="w-3 h-3 mx-1 text-gray-400" />
                        <span>{new Date(discount.endDate).toLocaleDateString()}</span>
                      </div>
                      
                      {/* Описание */}
                      {discount.description && (
                        <motion.div 
                          className="mt-3 text-sm text-gray-600 border-t border-gray-100 pt-3"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex">
                            <Info className="w-4 h-4 mr-2 flex-shrink-0 text-blue-400" />
                            <p>{discount.description}</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Кнопки действий */}
                    <div className="flex flex-col space-y-2">
                      <motion.button
                        onClick={() => startEdit(discount)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(discount.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* Анимированные звездочки */}
                  <AnimatePresence>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <motion.div
                        key={`star-${discount.id}-${i}`}
                        className="absolute text-yellow-400 opacity-0 group-hover:opacity-100"
                        initial={{ 
                          right: 10 + i * 20, 
                          bottom: 10,
                          scale: 0
                        }}
                        animate={{ 
                          scale: [0, 1.2, 1],
                          y: [-10, -30],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ 
                          delay: i * 0.2,
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

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
      `}</style>
    </div>
  )
}