import { Outlet } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { Sun, Moon, ChevronUp, Heart, Music, Sparkles } from 'lucide-react'

export default function MainLayout() {
  const [theme, setTheme] = useState('light') // 'light' или 'dark'
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState([])
  const [visibilityState, setVisibilityState] = useState('visible')
  const [interactiveElements, setInteractiveElements] = useState([
    { id: 1, x: 80, y: 15, size: 3, scale: 1, rotate: 0, color: 'rgba(59, 130, 246, 0.2)' },
    { id: 2, x: 20, y: 75, size: 5, scale: 1, rotate: 0, color: 'rgba(236, 72, 153, 0.2)' },
    { id: 3, x: 70, y: 60, size: 4, scale: 1, rotate: 0, color: 'rgba(16, 185, 129, 0.2)' },
    { id: 4, x: 30, y: 30, size: 6, scale: 1, rotate: 0, color: 'rgba(245, 158, 11, 0.2)' }
  ])
  
  const layoutRef = useRef(null)
  const audioRef = useRef(null)
  const particlesTimeoutRef = useRef(null)
  
  // Эффект для отслеживания видимости страницы
  useEffect(() => {
    const handleVisibilityChange = () => {
      setVisibilityState(document.visibilityState);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Эффект для создания интерактивных частиц при движении мыши
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (layoutRef.current) {
        const rect = layoutRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Обновляем позицию мыши
        setMousePosition({ x, y });
        
        // Перемещаем интерактивные элементы в зависимости от позиции мыши
        setInteractiveElements((prevElements) =>
          prevElements.map((element) => {
            // Вычисляем расстояние от мыши до элемента
            const centerX = rect.width * (element.x / 100);
            const centerY = rect.height * (element.y / 100);
            const distX = x - centerX;
            const distY = y - centerY;
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            // Чем ближе мышь, тем больше влияние
            const maxDistance = 300;
            const influence = Math.max(0, 1 - distance / maxDistance);
            
            // Перемещаем элемент от мыши
            const moveAwayFactor = 10 * influence;
            const newX = Math.max(0, Math.min(100, element.x - (distX / rect.width) * moveAwayFactor));
            const newY = Math.max(0, Math.min(100, element.y - (distY / rect.height) * moveAwayFactor));
            
            return {
              ...element,
              x: newX,
              y: newY,
              scale: 1 + influence * 0.3,
              rotate: element.rotate + influence * 10
            };
          })
        );
        
        // Случайно создаем частицы при движении мыши
        if (Math.random() < 0.1) {
          createParticle(x, y);
        }
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Эффект для отслеживания прокрутки страницы
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Эффект для создания фоновой музыки
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.2;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Функция создания частицы
  const createParticle = (x, y) => {
    const newParticle = {
      id: Date.now(),
      x,
      y,
      color: `hsla(${Math.random() * 360}, 80%, 60%, 0.6)`,
      size: Math.random() * 8 + 2,
      speedX: (Math.random() - 0.5) * 3,
      speedY: (Math.random() - 0.5) * 3 - 1, // Немного вверх для эффекта "подъема"
      lifetime: Math.random() * 1000 + 500
    };
    
    setParticles(prevParticles => [...prevParticles, newParticle]);
    
    // Удаляем частицу после истечения срока жизни
    clearTimeout(particlesTimeoutRef.current);
    particlesTimeoutRef.current = setTimeout(() => {
      setParticles(prevParticles => 
        prevParticles.filter(particle => particle.id !== newParticle.id)
      );
    }, newParticle.lifetime);
  };
  
  // Функция переключения темы
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Анимируем переход между темами
    if (layoutRef.current) {
      const overlay = document.createElement('div');
      overlay.className = 'theme-transition-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.zIndex = '9999';
      overlay.style.pointerEvents = 'none';
      overlay.style.background = newTheme === 'dark' ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 255, 255, 0)';
      
      document.body.appendChild(overlay);
      
      gsap.to(overlay, {
        backgroundColor: newTheme === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        duration: 0.5,
        onComplete: () => {
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
              document.body.removeChild(overlay);
            }
          });
        }
      });
    }
  };
  
  // Функция переключения музыки
  const toggleMusic = () => {
    if (audioRef.current) {
      if (musicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setMusicPlaying(!musicPlaying);
    }
  };
  
  // Функция прокрутки наверх
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Получаем градиент фона в зависимости от темы
  const getBackgroundGradient = () => {
    return theme === 'dark'
      ? 'linear-gradient(135deg, #1a1c2a 0%, #121826 100%)'
      : 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)';
  };
  
  // Получаем градиент свечения вокруг курсора
  const getCursorGlow = () => {
    if (!layoutRef.current) return '';
    
    const { width, height } = layoutRef.current.getBoundingClientRect();
    const centerX = mousePosition.x / width * 100;
    const centerY = mousePosition.y / height * 100;
    
    return theme === 'dark'
      ? `radial-gradient(circle at ${centerX}% ${centerY}%, rgba(59, 130, 246, 0.15) 0%, rgba(16, 185, 129, 0.05) 25%, rgba(0, 0, 0, 0) 50%)`
      : `radial-gradient(circle at ${centerX}% ${centerY}%, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.03) 25%, rgba(0, 0, 0, 0) 50%)`;
  };

  return (
    <div 
      ref={layoutRef}
      className={`min-h-screen relative ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}
      style={{ 
        background: getBackgroundGradient(),
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Анимированный фон с волнами */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Верхняя волна */}
        <svg 
          className="absolute top-0 left-0 w-full" 
          style={{ 
            transform: 'rotate(180deg) translateY(-1px)', 
            fill: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)' 
          }}
          viewBox="0 0 1440 320"
        >
          <motion.path 
            initial={{ d: "M0,224L48,213.3C96,203,192,181,288,154.7C384,128,480,96,576,117.3C672,139,768,213,864,213.3C960,213,1056,139,1152,122.7C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" }}
            animate={{ d: [
              "M0,224L48,213.3C96,203,192,181,288,154.7C384,128,480,96,576,117.3C672,139,768,213,864,213.3C960,213,1056,139,1152,122.7C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,160L48,170.7C96,181,192,203,288,213.3C384,224,480,224,576,202.7C672,181,768,139,864,128C960,117,1056,139,1152,160C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,128L48,149.3C96,171,192,213,288,224C384,235,480,213,576,186.7C672,160,768,128,864,128C960,128,1056,160,1152,170.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ] }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              repeatType: "mirror", 
              ease: "easeInOut" 
            }}
          />
        </svg>
        
        {/* Нижняя волна */}
        <svg 
          className="absolute bottom-0 left-0 w-full" 
          style={{ 
            fill: theme === 'dark' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.05)' 
          }}
          viewBox="0 0 1440 320"
        >
          <motion.path 
            initial={{ d: "M0,320L48,288C96,256,192,192,288,165.3C384,139,480,149,576,149.3C672,149,768,139,864,160C960,181,1056,235,1152,240C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" }}
            animate={{ d: [
              "M0,320L48,288C96,256,192,192,288,165.3C384,139,480,149,576,149.3C672,149,768,139,864,160C960,181,1056,235,1152,240C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,320L48,298.7C96,277,192,235,288,224C384,213,480,235,576,229.3C672,224,768,192,864,197.3C960,203,1056,245,1152,256C1248,267,1344,245,1392,234.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,320L48,304C96,288,192,256,288,240C384,224,480,224,576,213.3C672,203,768,181,864,192C960,203,1056,245,1152,261.3C1248,277,1344,267,1392,261.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ] }}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              repeatType: "mirror", 
              ease: "easeInOut" 
            }}
          />
        </svg>
        
        {/* Интерактивные элементы фона */}
        {interactiveElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute rounded-full opacity-70"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.size * 20}px`,
              height: `${element.size * 20}px`,
              backgroundColor: element.color,
              filter: 'blur(30px)',
              transform: `scale(${element.scale}) rotate(${element.rotate}deg)`,
              transition: 'transform 0.5s ease-out'
            }}
          />
        ))}
        
        {/* Частицы при движении мыши */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full pointer-events-none"
              initial={{ 
                left: particle.x, 
                top: particle.y,
                backgroundColor: particle.color,
                width: particle.size,
                height: particle.size,
                opacity: 1,
                scale: 0.5
              }}
              animate={{ 
                left: particle.x + particle.speedX * 40, 
                top: particle.y + particle.speedY * 40,
                opacity: 0,
                scale: 2,
                width: particle.size,
                height: particle.size
              }}
              transition={{ 
                duration: particle.lifetime / 1000,
                ease: "easeOut"
              }}
              exit={{ opacity: 0 }}
            />
          ))}
        </AnimatePresence>
        
        {/* Эффект свечения курсора */}
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{ 
            backgroundImage: getCursorGlow(),
            mixBlendMode: theme === 'dark' ? 'lighten' : 'multiply'
          }}
        />
      </div>
      
      <Navbar />
      
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 15 
        }}
        className="container mx-auto px-4 py-8 pt-24 relative z-10"
      >
        <Outlet />
      </motion.main>
      
      {/* Анимированный градиентный футер */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 mt-12 overflow-hidden"
      >
        <div className="relative">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 opacity-50"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)'
              }}
            />
            
            {/* Размытые круги */}
            <motion.div 
              className="absolute rounded-full"
              style={{
                top: '20%',
                left: '10%',
                width: '200px',
                height: '200px',
                backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                filter: 'blur(50px)'
              }}
              animate={{ 
                x: [0, 20, 0, -20, 0],
                y: [0, 15, 0, -15, 0],
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
            
            <motion.div 
              className="absolute rounded-full"
              style={{
                top: '50%',
                right: '20%',
                width: '150px',
                height: '150px',
                backgroundColor: theme === 'dark' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.05)',
                filter: 'blur(50px)'
              }}
              animate={{ 
                x: [0, -30, 0, 30, 0],
                y: [0, -20, 0, 20, 0],
              }}
              transition={{ 
                duration: 15, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
          </div>
          
          <div className="container mx-auto px-4 py-8 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block"
                  >
                    TourGuide
                  </motion.span>
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Ваш проводник в мире удивительных путешествий. Мы делаем ваш отдых незабываемым!
                </p>
                
                <div className="flex space-x-4 mt-4">
                  <motion.a 
                    href="#"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      theme === 'dark' 
                        ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' 
                        : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
                    }`}
                  >
                    <i className="fab fa-facebook-f"></i>
                  </motion.a>
                  
                  <motion.a 
                    href="#"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      theme === 'dark' 
                        ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' 
                        : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
                    }`}
                  >
                    <i className="fab fa-twitter"></i>
                  </motion.a>
                  
                  <motion.a 
                    href="#"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      theme === 'dark' 
                        ? 'bg-pink-500/20 text-pink-300 hover:bg-pink-500/30' 
                        : 'bg-pink-500/10 text-pink-600 hover:bg-pink-500/20'
                    }`}
                  >
                    <i className="fab fa-instagram"></i>
                  </motion.a>
                </div>
              </div>
              
              <div>
                <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Полезные ссылки
                </h3>
                <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>
                    <motion.a 
                      href="#" 
                      className="hover:underline flex items-center"
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-blue-500 mr-1">›</span> О нас
                    </motion.a>
                  </li>
                  <li>
                    <motion.a 
                      href="#" 
                      className="hover:underline flex items-center"
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-blue-500 mr-1">›</span> Контакты
                    </motion.a>
                  </li>
                  <li>
                    <motion.a 
                      href="#" 
                      className="hover:underline flex items-center"
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-blue-500 mr-1">›</span> Вакансии
                    </motion.a>
                  </li>
                  <li>
                    <motion.a 
                      href="#" 
                      className="hover:underline flex items-center"
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-blue-500 mr-1">›</span> Партнерская программа
                    </motion.a>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Контакты
                </h3>
                <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">📍</span> 
                    <span>г. Москва, ул. Туристическая, д. 1</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">📞</span> 
                    <span>+7 (123) 456-78-90</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">✉️</span> 
                    <span>info@tourguide.ru</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className={`mt-8 pt-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  © {new Date().getFullYear()} TourGuide. Все права защищены.
                </p>
                
                <div className="flex space-x-4 mt-4 md:mt-0">
                  <motion.a 
                    href="#"
                    whileHover={{ scale: 1.05 }}
                    className={`text-sm hover:underline ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    Политика конфиденциальности
                  </motion.a>
                  <motion.a 
                    href="#"
                    whileHover={{ scale: 1.05 }}
                    className={`text-sm hover:underline ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    Условия использования
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.footer>
      
      {/* Скрытая фоновая музыка */}
      <audio ref={audioRef} style={{ display: 'none' }}></audio>
      
      {/* Плавающие кнопки */}
      <div className="fixed bottom-5 right-5 z-40 space-y-3">
        {/* Плавающие декоративные звездочки */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute"
            style={{
              right: `${Math.random() * 60}px`,
              bottom: `${100 + Math.random() * 80}px`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              y: [0, -10, 0],
              rotate: [0, 180, 360],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 2 + i,
              repeat: Infinity,
              delay: i * 1.2
            }}
          >
            <Sparkles className={`w-3 h-3 ${theme === 'dark' ? 'text-yellow-300' : 'text-amber-500'}`} />
          </motion.div>
        ))}
        
        {/* Кнопка включения/выключения музыки */}
        <motion.button
          onClick={toggleMusic}
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            theme === 'dark'
              ? (musicPlaying ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300')
              : (musicPlaying ? 'bg-green-500 text-white' : 'bg-white text-gray-600')
          }`}
        >
          <Music className="w-5 h-5" />
          
          {/* Анимированные волны вокруг кнопки музыки */}
          {musicPlaying && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ 
                  border: '2px solid',
                  borderColor: theme === 'dark' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(22, 163, 74, 0.3)'
                }}
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ 
                  border: '2px solid',
                  borderColor: theme === 'dark' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(22, 163, 74, 0.2)'
                }}
                animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
              />
            </>
          )}
        </motion.button>
        
        {/* Кнопка переключения темы */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.1, rotate: -10 }}
          whileTap={{ scale: 0.9 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            theme === 'dark'
              ? 'bg-gray-700 text-amber-300'
              : 'bg-white text-indigo-600'
          }`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>
        
        {/* Кнопка скролла вверх */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              <ChevronUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
        
        {/* Кнопка "Нравится" с анимацией */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.8 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            theme === 'dark'
              ? 'bg-gray-700 text-red-400 hover:text-red-300'
              : 'bg-white text-red-500 hover:text-red-600'
          }`}
          onClick={() => {
            // Анимация сердечек при клике
            const hearts = Array(5).fill(0).map((_, i) => {
              const heart = document.createElement('div');
              heart.innerHTML = '❤️';
              heart.className = 'absolute text-2xl pointer-events-none';
              heart.style.left = `${Math.random() * 50 + 20}px`;
              heart.style.top = `${Math.random() * 50 + 20}px`;
              heart.style.zIndex = '9999';
              document.body.appendChild(heart);
              
              gsap.to(heart, {
                y: -100 - Math.random() * 50,
                x: (Math.random() - 0.5) * 50,
                opacity: 0,
                rotation: (Math.random() - 0.5) * 60,
                duration: 1.5,
                ease: 'power2.out',
                onComplete: () => {
                  document.body.removeChild(heart);
                }
              });
              
              return heart;
            });
          }}
        >
          <Heart className="w-5 h-5" />
        </motion.button>
      </div>
      
      {/* CSS для дополнительных эффектов */}
      <style jsx="true">{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        
        @keyframes wave {
          0% { transform: translateX(0); }
          50% { transform: translateX(-25%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}