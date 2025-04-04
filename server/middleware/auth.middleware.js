import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'Требуется авторизация' })
    }

    // Добавим логирование
    console.log('Проверка токена для запроса:', req.url)

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
      console.log('Токен декодирован, ID пользователя:', decoded.id)

      const user = await User.findByPk(decoded.id)

      if (!user) {
        console.error('Пользователь не найден:', decoded.id)
        return res.status(401).json({ message: 'Пользователь не найден' })
      }

      console.log('Пользователь найден:', user.id)
      req.user = user
      next()
    } catch (jwtError) {
      console.error('Ошибка проверки JWT:', jwtError)

      // Специальная обработка для истекшего токена
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Срок действия токена истек, пожалуйста, войдите снова',
          expired: true,
        })
      }

      return res.status(401).json({ message: 'Неверный токен' })
    }
  } catch (error) {
    console.error('Общая ошибка аутентификации:', error)
    res.status(500).json({ message: 'Ошибка аутентификации' })
  }
}

export const checkRole = roles => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Доступ запрещен' })
    }
    next()
  }
}
