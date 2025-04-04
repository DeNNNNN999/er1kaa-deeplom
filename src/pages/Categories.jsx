import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { 
  Layers, 
  Globe, 
  Map, 
  Compass, 
  Palmtree, 
  Sunrise, 
  Mountain, 
  Tent, 
  Ship, 
  Plane,
  Luggage, 
  Camera,
  Search
} from 'lucide-react'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [backgroundAnimating, setBackgroundAnimating] = useState(false)
  const [floatingIcons, setFloatingIcons] = useState([])
  
  const containerRef = useRef(null)
  const searchRef = useRef(null)
  
  // Используем эти иконки для категорий
  const categoryIcons = {
    "Пляжный отдых": Palmtree,
    "Горнолыжный": Mountain,
    "Экскурсионный": Camera,
    "Круизы": Ship,
    "Активный": Compass,
    "Экзотический": Sunrise,
    "Кемпинг": Tent,
    "Городской": Globe,
    "default": Luggage
  }
  
  // Создаем эффект для отслеживания движения мыши
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
  
  // Создаем плавающие иконки случайным образом
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        createFloatingIcon();
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Создаем плавающую иконку
  const createFloatingIcon = () => {
    const iconComponents = [Plane, Map, Globe, Luggage, Compass, Ship, Mountain];
    const IconComponent = iconComponents[Math.floor(Math.random() * iconComponents.length)];
    
    const newIcon = {
      id: Date.now(),
      icon: IconComponent,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 14 + 8,
      rotate: Math.random() * 360,
      duration: Math.random() * 2 + 2
    };
    
    setFloatingIcons(prev => [...prev, newIcon]);
    
    setTimeout(() => {
      setFloatingIcons(prev => prev.filter(icon => icon.id !== newIcon.id));
    }, newIcon.duration * 1000);
  };

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories')
      const data = await response.json()
      
      // Если у нас нет данных с сервера, создадим тестовые данные
      if (!data.length) {
        const demoCategories = [
          { 
            id: 1, 
            name: "Пляжный отдых", 
            description: "Белоснежные пляжи, лазурное море и райский отдых для любителей солнца и морских развлечений.",
            color: "from-blue-400 to-cyan-300"
          },
          { 
            id: 2, 
            name: "Горнолыжный", 
            description: "Заснеженные склоны, горячий глинтвейн и незабываемые спуски для любителей активного отдыха в горах.",
            color: "from-slate-300 to-blue-200"
          },
          { 
            id: 3, 
            name: "Экскурсионный", 
            description: "Погружение в историю, архитектуру и культуру уникальных мест по всему миру.",
            color: "from-amber-400 to-yellow-300"
          },
          { 
            id: 4, 
            name: "Круизы", 
            description: "Морские путешествия на лайнерах с посещением множества городов и островов в одном туре.",
            color: "from-blue-500 to-sky-400" 
          },
          { 
            id: 5, 
            name: "Активный", 
            description: "Походы, рафтинг, скалолазание и другие приключения для любителей адреналина.",
            color: "from-green-500 to-emerald-400"
          },
          { 
            id: 6, 
            name: "Экзотический", 
            description: "Уникальные направления для тех, кто хочет увидеть что-то совершенно новое и необычное.",
            color: "from-purple-500 to-pink-400"
          }
        ];
        setCategories(demoCategories);
      } else {
        setCategories(data);
      }
    } catch (err) {
      setError('Ошибка при загрузке категорий')
      
      // Создаем тестовые данные при ошибке
      const demoCategories = [
        { 
          id: 1, 
          name: "Пляжный отдых", 
          description: "Белоснежные пляжи, лазурное море и райский отдых для любителей солнца и морских развлечений.",
          color: "from-blue-400 to-cyan-300"
        },
        { 
          id: 2, 
          name: "Горнолыжный", 
          description: "Заснеженные склоны, горячий глинтвейн и незабываемые спуски для любителей активного отдыха в горах.",
          color: "from-slate-300 to-blue-200"
        },
        { 
          id: 3, 
          name: "Экскурсионный", 
          description: "Погружение в историю, архитектуру и культуру уникальных мест по всему миру.",
          color: "from-amber-400 to-yellow-300"
        },
        { 
          id: 4, 
          name: "Круизы", 
          description: "Морские путешествия на лайнерах с посещением множества городов и островов в одном туре.",
          color: "from-blue-500 to-sky-400" 
        },
        { 
          id: 5, 
          name: "Активный", 
          description: "Походы, рафтинг, скалолазание и другие приключения для любителей адреналина.",
          color: "from-green-500 to-emerald-400"
        },
        { 
          id: 6, 
          name: "Экзотический", 
          description: "Уникальные направления для тех, кто хочет увидеть что-то совершенно новое и необычное.",
          color: "from-purple-500 to-pink-400"
        }
      ];
      setCategories(demoCategories);
    } finally {
      setLoading(false)
    }
  }
  
  // Анимация фона при наведении на карточку
  const animateBackground = () => {
    if (!backgroundAnimating) {
      setBackgroundAnimating(true);
      
      setTimeout(() => {
        setBackgroundAnimating(false);
      }, 2000);
    }
  };
  
  // Отфильтрованные категории по поиску
  const filteredCategories = categories.filter(
    category => category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Получаем иконку для категории
  const getCategoryIcon = (categoryName) => {
    // Ищем иконку по имени категории, если нет - используем умолчание
    for (const [key, Icon] of Object.entries(categoryIcons)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return Icon;
      }
    }
    return categoryIcons.default;
  };
  
  // Получаем градиент подсветки на основе положения мыши
  const getGlowGradient = () => {
    if (!containerRef.current) return '';
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    const centerX = mousePosition.x / width * 100;
    const centerY = mousePosition.y / height * 100;
    
    return `radial-gradient(circle at ${centerX}% ${centerY}%, rgba(56, 189, 248, 0.1) 0%, rgba(59, 130, 246, 0.05) 25%, rgba(0, 0, 0, 0) 50%)`;
  };

  // Анимированный лоадер
  if (loading) return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-t-transparent border-blue-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Layers className="w-8 h-8 text-blue-500" />
        </div>
      </div>
    </div>
  );
  
  // Анимированное сообщение об ошибке
  if (error) return (
    <div className="text-center py-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-block p-6 bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/30"
      >
        <div className="text-red-500 text-xl font-semibold">{error}</div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchCategories}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          Попробовать снова
        </motion.button>
      </motion.div>
    </div>
  );

  return (
    <div 
      ref={containerRef} 
      className="relative min-h-[80vh] px-4 py-8 overflow-hidden"
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
      
      {/* Анимированный заголовок с подсветкой */}
      <div className="text-center mb-12 relative">
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
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-lg"
          />
          
          {/* Вращающееся кольцо */}
          <motion.div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, rgba(56, 189, 248, 0), rgba(56, 189, 248, 0.7), rgba(168, 85, 247, 0.7), rgba(56, 189, 248, 0))'
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
              <Layers className="w-12 h-12" />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
        >
          Категории туров
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-gray-600 max-w-2xl mx-auto"
        >
          Выберите категорию тура, которая вам интересна, и откройте для себя мир удивительных путешествий
        </motion.p>
      </div>
      
      {/* Поиск категорий */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-md mx-auto mb-10"
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
              placeholder="Поиск категорий..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full py-4 px-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900"
            />
          </div>
        </div>
        
        {/* Количество найденных категорий */}
        <AnimatePresence>
          {searchTerm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center mt-3 text-sm text-gray-600"
            >
              Найдено категорий: {filteredCategories.length}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Сетка категорий */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {filteredCategories.map((category, index) => {
          const IconComponent = getCategoryIcon(category.name);
          
          return (
            <motion.div
              key={category.id}
              layoutId={`category-${category.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              onClick={() => setSelectedCategory(category)}
              onMouseEnter={() => {
                animateBackground();
                createFloatingIcon();
              }}
              className="cursor-pointer relative overflow-hidden transform-gpu"
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Фон карточки */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color || 'from-blue-500/20 to-purple-500/20'} backdrop-blur-sm rounded-3xl z-0`}></div>
              
              {/* Блестящая рамка */}
              <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-white/50 via-transparent to-white/30 pointer-events-none"></div>
              
              {/* Случайные блики */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative p-6 z-10 flex flex-col h-full">
                {/* Иконка категории */}
                <div className="mb-4">
                  <motion.div 
                    className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                
                {/* Название и описание */}
                <h3 className="text-xl font-bold text-white mb-2 drop-shadow-md">
                  {category.name}
                </h3>
                <p className="text-white/80 text-sm">
                  {category.description}
                </p>
                
                {/* Кнопка "Подробнее" */}
                <div className="mt-auto pt-4">
                  <motion.div 
                    className="inline-flex items-center text-white/90 text-sm font-medium"
                    whileHover={{ x: 5 }}
                  >
                    <span>Подробнее</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 ml-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </div>
                
                {/* Плавающие пузырьки */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={`bubble-${category.id}-${i}`}
                      className="absolute rounded-full bg-white/10"
                      initial={{
                        x: Math.random() * 100 + "%",
                        y: "100%",
                        width: `${Math.random() * 8 + 3}px`,
                        height: `${Math.random() * 8 + 3}px`,
                      }}
                      animate={{
                        y: [
                          "100%", 
                          `${Math.random() * -20}%`
                        ],
                        opacity: [0, 0.4, 0]
                      }}
                      transition={{
                        duration: Math.random() * 5 + 5,
                        repeat: Infinity,
                        delay: Math.random() * 5
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Пустой результат поиска */}
      <AnimatePresence>
        {searchTerm && filteredCategories.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-12 text-center"
          >
            <div className="inline-block p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
              <div className="mb-4 w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Категории не найдены</h3>
              <p className="text-gray-600">Попробуйте изменить запрос поиска</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Сбросить поиск
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Модальное окно с деталями категории */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCategory(null)}
          >
            <motion.div
              layoutId={`category-${selectedCategory.id}`}
              className="max-w-lg w-full mx-auto relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Фон карточки */}
              <div className={`absolute inset-0 bg-gradient-to-br ${selectedCategory.color || 'from-blue-500 to-purple-500'} backdrop-blur-md rounded-3xl z-0`}></div>
              
              {/* Блестящая рамка */}
              <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-white/50 via-transparent to-white/30 pointer-events-none"></div>
              
              <div className="relative p-8 z-10">
                <div className="flex items-start justify-between mb-6">
                  {/* Иконка категории */}
                  <div className="flex items-center">
                    <motion.div 
                      className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4"
                      animate={{ rotate: [0, -5, 5, 0] }}
                      transition={{ 
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 5
                      }}
                    >
                      {(() => {
                      const IconComponent = getCategoryIcon(selectedCategory.name);
                      return <IconComponent className="w-10 h-10 text-white" />;
                    })()}
                    </motion.div>
                    
                    <h2 className="text-2xl font-bold text-white">
                      {selectedCategory.name}
                    </h2>
                  </div>
                  
                  {/* Кнопка закрытия */}
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedCategory(null)}
                    className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-white" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
                
                <p className="text-white/90 mb-6">
                  {selectedCategory.description}
                </p>
                
                {/* Популярные туры категории (условное содержимое) */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Популярные направления</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <motion.div 
                        key={item}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: item * 0.1 }}
                        className="rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                      >
                        <div className="p-3">
                          <div className="font-medium text-white">
                            {selectedCategory.name === "Пляжный отдых" ? "Бали" : 
                             selectedCategory.name === "Горнолыжный" ? "Альпы" : 
                             selectedCategory.name === "Экскурсионный" ? "Рим" : 
                             selectedCategory.name === "Круизы" ? "Карибы" : 
                             "Направление " + item}
                          </div>
                          <div className="text-white/70 text-sm">от 45 000 ₽</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-8 w-full py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-medium hover:bg-white/30 transition-colors"
                >
                  Смотреть все туры категории
                </motion.button>
                
                {/* Плавающие пузырьки */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                      key={`modal-bubble-${i}`}
                      className="absolute rounded-full bg-white/10"
                      initial={{
                        x: Math.random() * 100 + "%",
                        y: "100%",
                        width: `${Math.random() * 8 + 3}px`,
                        height: `${Math.random() * 8 + 3}px`,
                      }}
                      animate={{
                        y: [
                          "100%", 
                          `${Math.random() * -20}%`
                        ],
                        opacity: [0, 0.4, 0]
                      }}
                      transition={{
                        duration: Math.random() * 5 + 5,
                        repeat: Infinity,
                        delay: Math.random() * 5
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Анимированный фон */}
      <motion.div 
        className="fixed inset-0 -z-10 pointer-events-none"
        animate={
          backgroundAnimating 
            ? { 
                background: [
                  'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.03) 0%, rgba(0, 0, 0, 0) 70%)',
                  'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.06) 0%, rgba(0, 0, 0, 0) 70%)',
                  'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.03) 0%, rgba(0, 0, 0, 0) 70%)'
                ]
              } 
            : {}
        }
        transition={{ duration: 2 }}
      />
    </div>
  )
}