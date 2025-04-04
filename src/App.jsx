import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './layouts/AuthLayout'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Manager from './pages/Manager'
import Tours from './pages/Tours'
import Categories from './pages/Categories'
import Bookings from './pages/Bookings'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import TourDetails from './pages/TourDetails'
import { useEffect } from 'react'
import './App.css'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')

  // Если токена нет, сразу перенаправляем на страницу входа
  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  // Функция для проверки валидности JWT токена
  const isTokenExpired = token => {
    if (!token) return true

    try {
      // Получаем данные из JWT (без проверки подписи)
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      )

      const { exp } = JSON.parse(jsonPayload)

      // Сравниваем время истечения токена с текущим временем
      return exp * 1000 < Date.now()
    } catch (e) {
      console.error('Ошибка при проверке токена:', e)
      return true
    }
  }

  // Проверяем токен при запуске приложения
  useEffect(() => {
    const token = localStorage.getItem('token')

    // Если токен истек, удаляем данные и перенаправляем на страницу входа
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Установим флаг в URL для отображения сообщения на странице входа
      window.location.href = '/login?tokenExpired=true'
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }>
          <Route path="/" element={<Navigate to="/tours" replace />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tours/:id" element={<TourDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/manager" element={<Manager />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
