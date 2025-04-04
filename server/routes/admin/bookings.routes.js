import express from 'express'
import { Booking, Tour, User } from '../../models/index.js'
import { authenticate, checkRole } from '../../middleware/auth.middleware.js'

const router = express.Router()

// Middleware для проверки прав администратора
router.use(authenticate, checkRole(['ADMIN']))

// Получить все бронирования
router.get('/', async (req, res) => {
  try {
    console.log('Запрос на получение бронирований для администратора')

    if (!Booking || !Tour || !User) {
      console.error('Ошибка: модели не импортированы корректно')
      return res.status(500).json({ message: 'Ошибка конфигурации сервера' })
    }

    const bookings = await Booking.findAll({
      include: [
        {
          model: Tour,
          attributes: ['id', 'title', 'price', 'imageUrl'],
        },
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email'],
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    console.log(`Найдено ${bookings.length} бронирований`)
    // Всегда возвращаем массив, даже если данных нет
    return res.json(bookings || [])
  } catch (error) {
    console.error('Ошибка в маршруте бронирований:', error)
    return res.status(500).json({
      message: 'Ошибка при получении бронирований',
      error: error.message,
    })
  }
})

// Обновить статус бронирования
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const booking = await Booking.findByPk(req.params.id)

    if (!booking) {
      return res.status(404).json({ message: 'Бронирование не найдено' })
    }

    await booking.update({ status })
    res.json(booking)
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении статуса', error: error.message })
  }
})

export default router