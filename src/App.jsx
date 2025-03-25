import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import { Navigate } from 'react-router-dom'
import './App.css'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={
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