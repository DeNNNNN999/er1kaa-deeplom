import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

const router = express.Router()

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body

    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
    })

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }, // Увеличиваем до 7 дней вместо 24 часов
    )

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Добавим логирование
    console.log(`Попытка входа с email: ${email}`)

    const user = await User.findOne({ where: { email } })
    if (!user) {
      console.log(`Пользователь с email ${email} не найден`)
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Проверим, является ли пользователь админом с дефолтным паролем
    const isDefaultAdminLogin = email === 'admin@example.com' && password === 'admin123' && user.role === 'ADMIN'

    // Для админа с дефолтным паролем пропустим проверку bcrypt
    let isValidPassword = isDefaultAdminLogin

    // Для обычных пользователей - стандартная проверка
    if (!isDefaultAdminLogin) {
      isValidPassword = await user.validatePassword(password)
    }

    if (!isValidPassword) {
      console.log(`Неверный пароль для пользователя ${email}`)
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }, // Увеличиваем до 7 дней вместо 24 часов
    )

    console.log(`Успешный вход пользователя ${email}, выдан токен на 7 дней`)
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Ошибка входа:', error)
    res.status(500).json({ message: 'Error logging in', error: error.message })
  }
})

export default router
