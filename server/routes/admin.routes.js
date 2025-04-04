import express from 'express'
import { User, Tour, Booking, Category, Payment } from '../models/index.js'
import { authenticate, checkRole } from '../middleware/auth.middleware.js'
import { Op, QueryTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const router = express.Router()

// Middleware для проверки прав администратора
router.use(authenticate, checkRole(['ADMIN']))

// Получить всех пользователей
router.get('/users', async (req, res) => {
  try {
    // Добавим логирование для отладки
    console.log('Запрос на получение всех пользователей')

    // Проверим модель User
    if (!User) {
      console.error('Модель User не определена')
      return res.status(500).json({ message: 'Ошибка конфигурации сервера' })
    }

    // Проверим структуру таблицы Users
    try {
      const columns = await sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'Users'`,
        { type: QueryTypes.SELECT },
      )
      console.log(
        'Структура таблицы Users:',
        columns.map(c => c.column_name),
      )

      // Проверяем наличие колонки blocked
      const hasBlockedColumn = columns.some(c => c.column_name === 'blocked')

      if (!hasBlockedColumn) {
        console.log('Колонка blocked отсутствует в таблице. Используем безопасный запрос.')
        // Если колонки нет, используем запрос без неё
        const users = await User.findAll({
          attributes: ['id', 'email', 'firstName', 'lastName', 'role'],
        })

        // Добавляем поле blocked со значением по умолчанию
        const usersWithBlocked = users.map(user => ({
          ...user.toJSON(),
          blocked: false,
        }))

        return res.json(usersWithBlocked)
      }
    } catch (e) {
      console.error('Ошибка при проверке структуры таблицы:', e)
    }

    // Выполняем стандартный запрос с обработкой ошибок
    try {
      const users = await User.findAll({
        attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'blocked'],
      })
      console.log(`Найдено ${users.length} пользователей`)
      return res.json(users)
    } catch (dbError) {
      console.error('Ошибка запроса к БД:', dbError)

      // Если ошибка связана с отсутствием колонки blocked
      if (dbError.parent && dbError.parent.code === '42703' && dbError.parent.sql.includes('blocked')) {
        console.log('Обнаружена ошибка с колонкой blocked, пробуем запрос без неё')

        const users = await User.findAll({
          attributes: ['id', 'email', 'firstName', 'lastName', 'role'],
        })

        // Добавляем поле blocked со значением по умолчанию
        const usersWithBlocked = users.map(user => ({
          ...user.toJSON(),
          blocked: false,
        }))

        return res.json(usersWithBlocked)
      }

      // Если другая ошибка, возвращаем её
      return res.status(500).json({
        message: 'Ошибка при получении пользователей',
        error: dbError.message,
      })
    }
  } catch (error) {
    console.error('Необработанная ошибка в маршруте users:', error)
    res.status(500).json({
      message: 'Ошибка при получении пользователей',
      error: error.message,
    })
  }
})

// Создать нового пользователя (менеджера)
router.post('/users', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body

    // Проверяем, что создаваемый пользователь - менеджер
    if (role !== 'MANAGER') {
      return res.status(400).json({ message: 'Можно создавать только менеджеров' })
    }

    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' })
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role,
    })

    res.status(201).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    })
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании пользователя', error: error.message })
  }
})

// Обновить роль пользователя
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body
    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    await user.update({ role })
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении роли', error: error.message })
  }
})

// Заблокировать/разблокировать пользователя
router.put('/users/:id/block', async (req, res) => {
  try {
    const { blocked } = req.body
    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    // Проверка наличия колонки blocked
    try {
      const columns = await sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'Users' AND column_name = 'blocked'`,
        { type: QueryTypes.SELECT },
      )

      if (columns.length === 0) {
        return res.status(400).json({
          message: 'Функция блокировки пользователей временно недоступна. Требуется обновление базы данных.',
        })
      }
    } catch (e) {
      console.error('Ошибка при проверке наличия колонки blocked:', e)
    }

    await user.update({ blocked })
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при блокировке/разблокировке', error: error.message })
  }
})

// Получить аналитику
router.get('/analytics', async (req, res) => {
  try {
    console.log('Запрос на получение аналитики')

    // Проверяем, что все модели правильно импортированы
    if (!Payment || !Tour || !Booking || !Category || !User || !sequelize) {
      console.error('Не все модели импортированы корректно')
      return res.status(500).json({ message: 'Ошибка инициализации моделей' })
    }

    // Получаем общую выручку
    const totalRevenueResult = await Payment.sum('amount', {
      where: { status: 'COMPLETED' },
    })
    const totalRevenue = totalRevenueResult || 0
    console.log('Общая выручка:', totalRevenue)

    // Количество активных туров
    const activeTours = await Tour.count()
    console.log('Активные туры:', activeTours)

    // Новые пользователи за последний месяц
    const newUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    })
    console.log('Новые пользователи:', newUsers)

    // Подготовка данных продаж по месяцам - пустой массив, если данных нет
    let monthlySales = []

    // Подготовка данных продаж по странам - пустой массив, если данных нет
    let countrySales = []

    // Подготовка рейтингов туров - пустой массив, если данных нет
    let tourRatings = []

    // Получаем популярные туры
    let popularTours = []
    try {
      // Сначала получим просто список туров
      const tours = await Tour.findAll({
        attributes: ['id', 'title'],
        limit: 5,
      })

      // Преобразуем в ожидаемый формат
      popularTours = tours.map(tour => ({
        id: tour.id,
        title: tour.title,
        bookings: 0, // Пока просто заглушка
        revenue: 0, // Пока просто заглушка
      }))

      console.log('Популярные туры получены:', popularTours.length)
    } catch (tourError) {
      console.error('Ошибка при получении популярных туров:', tourError)
      popularTours = [] // Гарантируем, что это будет массив
    }

    // Получаем статистику по категориям
    let categoryStats = []
    try {
      const categories = await Category.findAll({
        attributes: ['id', 'name'],
      })

      // Преобразуем в ожидаемый формат
      categoryStats = categories.map(category => ({
        id: category.id,
        name: category.name,
        revenue: 0, // Пока заглушка
        percentage: 0, // Пока заглушка
      }))

      console.log('Категории получены:', categoryStats.length)
    } catch (categoryError) {
      console.error('Ошибка при получении категорий:', categoryError)
      categoryStats = [] // Гарантируем, что это будет массив
    }

    // Рост продаж (заглушка или вычисляем логически)
    const salesGrowth = 0 // Пока заглушка

    // Формируем итоговый объект аналитики
    const analytics = {
      totalRevenue,
      activeTours,
      newUsers,
      salesGrowth,
      popularTours,
      categoryStats,
      monthlySales,
      countrySales,
      tourRatings,
    }

    console.log('Данные аналитики подготовлены')
    res.json(analytics)
  } catch (error) {
    console.error('Общая ошибка получения аналитики:', error)
    res.status(500).json({
      message: 'Ошибка при получении аналитики',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    })
  }
})

export default router
