import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  LogOut, 
  User, 
  Map, 
  Tag, 
  Calendar, 
  Menu, 
  X, 
  ChevronDown, 
  Globe,
  Settings
} from 'lucide-react'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const navbarRef = useRef(null)

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Отслеживание позиции мыши для эффекта свечения
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (navbarRef.current) {
        const rect = navbarRef.current.getBoundingClientRect();
        setHoverPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Определяем активную вкладку на основе текущего пути
    const path = location.pathname
    if (path.includes('/tours')) setActiveTab('tours')
    else if (path.includes('/categories')) setActiveTab('categories')
    else if (path.includes('/bookings')) setActiveTab('bookings')
    else if (path.includes('/manager')) setActiveTab('manager')
    else if (path.includes('/admin')) setActiveTab('admin')
    else if (path.includes('/profile')) setActiveTab('profile')
    else setActiveTab(null)
    
    // Закрываем мобильное меню при переходе по ссылке
    setIsOpen(false)
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const isActive = (tab) => {
    return activeTab === tab
  }

  // Стили для градиентной подсветки при наведении мыши
  const getGlowStyle = () => {
    if (!navbarRef.current) return {};
    
    const { width, height } = navbarRef.current.getBoundingClientRect();
    const centerX = hoverPosition.x / width * 100;
    const centerY = hoverPosition.y / height * 100;
    
    return {
      background: `radial-gradient(circle at ${centerX}% ${centerY}%, rgba(56, 189, 248, 0.15) 0%, rgba(59, 130, 246, 0.05) 30%, transparent 70%)`
    };
  };

  return (
    <nav
      ref={navbarRef}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'backdrop-blur-lg bg-gradient-to-r from-slate-900/90 via-blue-900/90 to-slate-900/90 shadow-lg shadow-blue-500/10' 
          : 'backdrop-blur-md bg-gradient-to-r from-slate-900/80 via-blue-900/80 to-slate-900/80'
      }`}
      style={{ 
        borderBottom: '1px solid rgba(59, 130, 246, 0.2)'
      }}
    >
      {/* Эффект свечения при наведении курсора */}
      <div className="absolute inset-0 pointer-events-none" style={getGlowStyle()} />
      
      {/* Градиентная линия снизу */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div className="flex items-center group">
            <Link 
              to="/" 
              className="flex items-center"
              onClick={() => setActiveTab(null)}
            >
              <div className="relative mr-2 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg overflow-hidden transition-all duration-300 group-hover:shadow-blue-500/40">
                {/* Сияющий блик */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Вращающаяся рамка */}
                <div 
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                  style={{ 
                    background: 'conic-gradient(from 0deg, rgba(56, 189, 248, 0), rgba(56, 189, 248, 1), rgba(56, 189, 248, 0))',
                    animation: 'spin 4s linear infinite'
                  }} 
                />
                
                <Globe className="w-6 h-6 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="flex flex-col transition-all duration-300 group-hover:translate-x-1">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
                  TourGuide
                </span>
                <div className="h-px w-0 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-500" />
              </div>
            </Link>
          </div>

          {/* Десктопная навигация */}
          <div className="hidden md:block">
            <div className="relative flex items-center space-x-1">
              {/* Навигационные ссылки */}
              <NavLink 
                to="/tours" 
                icon={<Map className="w-4 h-4" />}
                active={isActive('tours')}
                dataTab="tours"
              >
                Туры
              </NavLink>
              
              <NavLink 
                to="/categories" 
                icon={<Tag className="w-4 h-4" />}
                active={isActive('categories')}
                dataTab="categories"
              >
                Категории
              </NavLink>
              
              <NavLink 
                to="/bookings" 
                icon={<Calendar className="w-4 h-4" />}
                active={isActive('bookings')}
                dataTab="bookings"
              >
                Мои бронирования
              </NavLink>
              
              {user?.role === 'MANAGER' && (
                <NavLink 
                  to="/manager" 
                  icon={<Settings className="w-4 h-4" />}
                  active={isActive('manager')}
                  dataTab="manager"
                >
                  Панель менеджера
                </NavLink>
              )}
              
              {user?.role === 'ADMIN' && (
                <NavLink 
                  to="/admin" 
                  icon={<Settings className="w-4 h-4" />}
                  active={isActive('admin')}
                  dataTab="admin"
                >
                  Админ панель
                </NavLink>
              )}
            </div>
          </div>
          
          {/* Профиль пользователя */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-1 cursor-pointer group"
              >
                <div className="relative user-avatar">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-medium overflow-hidden transition-all duration-300 group-hover:shadow-blue-500/40">
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transform group-hover:-translate-y-1/2 transition-all duration-300" />
                    <span className="relative z-10 text-lg">{user?.firstName?.[0] || <User className="w-5 h-5" />}</span>
                  </div>
                  
                  {/* Эффект пульсации */}
                  <div 
                    className="absolute -inset-0.5 rounded-full opacity-0 group-hover:opacity-70 transition-opacity duration-500"
                    style={{ 
                      background: 'conic-gradient(from 0deg, rgba(56, 189, 248, 0), rgba(56, 189, 248, 1), rgba(56, 189, 248, 0))',
                      animation: 'spin 4s linear infinite'
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-blue-100 hidden sm:inline-block group-hover:text-white transition-colors duration-300">
                  {user?.firstName || 'Пользователь'}
                </span>
                <ChevronDown className="w-4 h-4 text-blue-300 group-hover:text-blue-100 transition-colors duration-300" />
              </button>
              
              {/* Выпадающее меню профиля */}
              {profileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-slate-800/90 backdrop-blur-lg rounded-lg shadow-xl shadow-blue-900/20 border border-blue-500/20 overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-blue-500/20">
                    <p className="text-sm font-medium text-blue-100">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-blue-300/70">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-blue-200 hover:bg-blue-700/30 hover:text-white transition-colors duration-200"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>Мой профиль</span>
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors duration-200 border-t border-blue-500/20"
                    >
                      <div className="flex items-center">
                        <LogOut className="w-4 h-4 mr-2" />
                        <span>Выйти</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Кнопка мобильного меню */}
            <button
              className="md:hidden p-1.5 rounded-full bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 hover:text-blue-100 transition-colors duration-300 focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Мобильное меню */}
      {isOpen && (
        <div
          className="md:hidden bg-slate-800/90 backdrop-blur-lg border-t border-blue-500/20 shadow-lg"
        >
          <div className="container mx-auto px-4 py-3 space-y-1">
            <MobileNavLink 
              to="/tours" 
              icon={<Map className="w-5 h-5" />}
              active={isActive('tours')}
            >
              Туры
            </MobileNavLink>
            
            <MobileNavLink 
              to="/categories" 
              icon={<Tag className="w-5 h-5" />}
              active={isActive('categories')}
            >
              Категории
            </MobileNavLink>
            
            <MobileNavLink 
              to="/bookings" 
              icon={<Calendar className="w-5 h-5" />}
              active={isActive('bookings')}
            >
              Мои бронирования
            </MobileNavLink>
            
            {user?.role === 'MANAGER' && (
              <MobileNavLink 
                to="/manager" 
                icon={<Settings className="w-5 h-5" />}
                active={isActive('manager')}
              >
                Панель менеджера
              </MobileNavLink>
            )}
            
            {user?.role === 'ADMIN' && (
              <MobileNavLink 
                to="/admin" 
                icon={<Settings className="w-5 h-5" />}
                active={isActive('admin')}
              >
                Админ панель
              </MobileNavLink>
            )}
            
            <div className="border-t border-blue-500/20 my-2 pt-2">
              <MobileNavLink 
                to="/profile" 
                icon={<User className="w-5 h-5" />}
                active={isActive('profile')}
              >
                Профиль
              </MobileNavLink>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center py-2 px-4 space-x-3 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS для дополнительных эффектов */}
      <style jsx="true">{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </nav>
  )
}

// Компонент десктопной навигационной ссылки
function NavLink({ to, children, icon, active, dataTab }) {
  return (
    <Link
      to={to}
      data-tab={dataTab}
      className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center space-x-1 overflow-hidden group ${
        active 
          ? 'text-white shadow-lg shadow-blue-600/20' 
          : 'text-blue-200 hover:text-white'
      }`}
    >
      {/* Фон при активном состоянии или наведении */}
      {active ? (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-indigo-600/40 rounded-lg -z-10" />
      ) : (
        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 rounded-lg transition-colors duration-300 -z-10" />
      )}
      
      {/* Блик */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <span className={`transition-transform duration-300 ${active ? 'text-blue-100' : ''} ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      <span>{children}</span>
    </Link>
  )
}

// Компонент мобильной навигационной ссылки
function MobileNavLink({ to, children, icon, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center py-2 px-4 space-x-3 rounded-lg transition-colors duration-300 ${
        active 
          ? 'bg-blue-600/30 text-white' 
          : 'text-blue-200 hover:bg-blue-600/20 hover:text-white'
      }`}
    >
      <div>
        {icon}
      </div>
      <span>{children}</span>
    </Link>
  )
}
