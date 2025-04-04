/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Calendar,
  Users,
  Filter,
  Search,
  Star,
  Heart,
  ArrowRight,
  ChevronDown,
  Compass,
  Globe
} from 'lucide-react'

export default function Tours() {
  const [tours, setTours] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    location: ''
  })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  
  useEffect(() => {
    fetchTours()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchTours = async () => {
    try {
      const queryParams = new URLSearchParams()
      if (filters.categoryId) queryParams.append('categoryId', filters.categoryId)
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice)
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice)
      if (filters.location) queryParams.append('location', filters.location)

      const response = await fetch('http://localhost:5000/api/tours')
      const data = await response.json()
      setTours(data)
    } catch (err) {
      setError('Ошибка при загрузке туров')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCategoryClick = (id) => {
    setSelectedCategory(id)
    setFilters(prev => ({
      ...prev,
      categoryId: id
    }))
    setTimeout(() => {
      fetchTours()
    }, 300)
  }

  const applyFilters = (e) => {
    e.preventDefault()
    fetchTours()
  }

  const toggleFavorite = (tourId, e) => {
    if (e) e.stopPropagation()
    setFavorites(prev => {
      if (prev.includes(tourId)) {
        return prev.filter(id => id !== tourId)
      } else {
        return [...prev, tourId]
      }
    })
  }

  // Упрощенный рендеринг рейтинга
  const RatingStars = ({ rating }) => {
    if (!rating || isNaN(rating)) return <span>NaN</span>;
    
    const fullStars = Math.floor(rating);
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star 
            key={`star-filled-${i}`} 
            className="w-4 h-4" 
            fill="#FBBF24" 
            stroke="#FBBF24" 
          />
        );
      } else {
        stars.push(
          <Star 
            key={`star-empty-${i}`} 
            className="w-4 h-4" 
            fill="none" 
            stroke="#9CA3AF" 
          />
        );
      }
    }
    
    return (
      <div className="flex items-center">
        <div className="flex">{stars}</div>
        <span className="ml-1.5 text-sm font-medium text-gray-800">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  // Упрощенная карточка тура
  const TourCard = ({ tour }) => {
    const isFavorite = favorites.includes(tour.id);
    const rating = tour.id ? ((parseInt(tour.id) * 7) % 50) / 10 + 3 : 0;
    
    return (
      <div className="group bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {/* Изображение тура */}
        <div className="relative h-60 bg-gradient-to-r from-blue-400 to-indigo-500 overflow-hidden">
          {tour.imageUrl ? (
            <img
              src={tour.imageUrl}
              alt={tour.title || "Тур"}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <MapPin className="w-16 h-16 text-white" />
            </div>
          )}
          
          {/* Оверлей для градиента */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

          {/* Кнопка избранного */}
          <button
            className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-300 ${
              isFavorite 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                : 'bg-white/80 hover:bg-white shadow-lg'
            }`}
            onClick={(e) => toggleFavorite(tour.id, e)}
          >
            <Heart
              className="w-5 h-5"
              fill={isFavorite ? "white" : "none"}
            />
          </button>

          {/* Рейтинг */}
          <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <RatingStars rating={rating} />
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 transition-colors group-hover:text-blue-600">{tour.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{tour.description}</p>

          <div className="space-y-2.5 text-sm text-gray-500 mb-4">
            <div className="flex items-center transition-transform duration-200 hover:translate-x-1">
              <div className="flex items-center justify-center mr-3 bg-blue-100 rounded-full w-7 h-7">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-gray-700">{tour.location}</span>
            </div>

            <div className="flex items-center transition-transform duration-200 hover:translate-x-1">
              <div className="flex items-center justify-center mr-3 bg-blue-100 rounded-full w-7 h-7">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-gray-700">{tour.duration} дней</span>
            </div>

            <div className="flex items-center transition-transform duration-200 hover:translate-x-1">
              <div className="flex items-center justify-center mr-3 bg-blue-100 rounded-full w-7 h-7">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-gray-700">до {tour.maxParticipants} человек</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex flex-col group-hover:scale-105 transition-transform duration-300">
              <span className="text-xs text-gray-500">Цена за человека</span>
              <span className="text-2xl font-bold text-blue-600">
                {typeof tour.price === 'number' ? tour.price.toLocaleString() : tour.price} ₽
              </span>
            </div>

            <Link to={`/tours/${tour.id}`}>
              <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 flex items-center">
                <span>Подробнее</span>
                <ArrowRight size={16} className="ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // Простая карточка категории
  const CategoryCard = ({ category }) => {
    const isActive = selectedCategory === category.id;
    return (
      <div
        className={`cursor-pointer rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
          isActive ? 'bg-blue-100' : 'bg-white'
        }`}
        onClick={() => handleCategoryClick(category.id)}
      >
        <div className="h-2 bg-blue-500"></div>
        <div className="flex items-center gap-3 p-4">
          <div className="p-2 rounded-lg bg-blue-500 text-white">
            <Globe className="w-6 h-6" />
          </div>
          <span className="font-medium">{category.name}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pt-8 pb-16 sm:px-6 space-y-8">
        {/* Заголовок с легкой анимацией */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Путешествуйте с нами</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Откройте для себя лучшие туры со всего мира и планируйте свое следующее приключение!
          </p>
        </div>

        {/* Категории туров */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 mr-3 text-blue-600 bg-blue-100 rounded-lg">
                <Compass className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Категории туров</h2>
            </div>

            <button
              className="flex items-center text-blue-600 hover:text-blue-800 group"
              onClick={() => setSelectedCategory('')}
            >
              <span>Показать все</span>
              <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map(category => (
              <CategoryCard key={`category-${category.id}`} category={category} />
            ))}
          </div>
        </div>

        {/* Фильтры */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center justify-between w-full p-5 font-medium text-blue-700 bg-blue-50 transition-colors duration-300 hover:bg-blue-100"
          >
            <div className="flex items-center">
              <div className="p-2 mr-3 text-blue-600 bg-blue-100 rounded-lg">
                <Filter className="w-5 h-5" />
              </div>
              <span className="text-lg">Фильтры и поиск туров</span>
            </div>
            <div className="transition-transform duration-300" style={{ transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <ChevronDown className="w-6 h-6 text-blue-600" />
            </div>
          </button>

          {filtersOpen && (
            <div className="transition-transform duration-300 ease-in-out">
              <form onSubmit={applyFilters} className="grid grid-cols-1 gap-6 p-6 md:grid-cols-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Категория
                  </label>
                  <div className="relative">
                    <select
                      name="categoryId"
                      value={filters.categoryId}
                      onChange={handleFilterChange}
                      className="w-full py-3 pl-4 pr-10 border-gray-300 shadow-sm rounded-xl focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Все категории</option>
                      {categories.map(category => (
                        <option key={`filter-category-${category.id}`} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Мин. цена
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 font-medium text-gray-500 pointer-events-none">
                      ₽
                    </div>
                    <input
                      type="number"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      className="w-full py-3 pl-8 border-gray-300 shadow-sm rounded-xl focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      placeholder="От"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Макс. цена
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 font-medium text-gray-500 pointer-events-none">
                      ₽
                    </div>
                    <input
                      type="number"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      className="w-full py-3 pl-8 border-gray-300 shadow-sm rounded-xl focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      placeholder="До"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30"
                  >
                    <div className="flex items-center justify-center">
                      <Search className="w-5 h-5 mr-2" />
                      <span className="font-medium">Найти туры</span>
                    </div>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {error ? (
          <div className="p-8 text-center text-red-600 border border-red-200 shadow-sm bg-red-50 rounded-xl">
            <p className="mb-4 text-xl font-medium">{error}</p>
            <button
              onClick={fetchTours}
              className="px-6 py-3 mt-3 text-white transition-all duration-300 bg-red-600 rounded-lg hover:bg-red-700 hover:shadow-lg"
            >
              Попробовать снова
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 mr-3 text-blue-600 bg-blue-100 rounded-lg shadow-sm">
                  <Compass className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Доступно туров: {tours.length}
                </h2>
              </div>

              {favorites.length > 0 && (
                <div className="flex items-center px-4 py-2 text-red-600 rounded-full bg-red-50 shadow-sm">
                  <div className="mr-2">
                    <Heart className="w-5 h-5" fill="#EF4444" />
                  </div>
                  <span className="text-sm font-medium">
                    {favorites.length} {favorites.length === 1 ? 'тур в избранном' : 'тура в избранном'}
                  </span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tours.map((tour) => (
                  <TourCard key={`simple-tour-${tour.id}`} tour={tour} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
