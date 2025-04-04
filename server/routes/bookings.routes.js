import express from 'express'
import { Booking, Payment, Tour } from '../models/index.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

// Получить бронирования пользователя
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('Запрос на получение бронирований для пользователя:', req.user.id)

    const bookings = await Booking.findAll({
      where: { UserId: req.user.id }, // Fixed: Changed userId to UserId to match Sequelize model
      include: [
        {
          model: Tour,
          attributes: ['id', 'title', 'price', 'imageUrl', 'location', 'duration'],
        },
      ],
    })

    console.log(`Найдено ${bookings.length} бронирований`)
    res.json(bookings)
  } catch (error) {
    console.error('Ошибка при получении бронирований:', error)
    res.status(500).json({
      message: 'Ошибка при получении бронирований',
      error: error.message,
    })
  }
})

// Создать новое бронирование
router.post('/', authenticate, async (req, res) => {
  try {
    const { tourId, participants, bookingDate } = req.body
    console.log('Создание бронирования:', { tourId, participants, bookingDate })

    // Получение информации о туре
    const tour = await Tour.findByPk(tourId)
    if (!tour) {
      return res.status(404).json({ message: 'Тур не найден' })
    }

    // Расчет общей стоимости
    const totalPrice = tour.price * participants

    // Создание бронирования
    const booking = await Booking.create({
      UserId: req.user.id, // Fixed: Changed to UserId to match Sequelize model
      TourId: tourId, // Fixed: Changed to TourId to match Sequelize model
      bookingDate,
      participants,
      totalPrice,
      status: 'PENDING',
    })

    console.log('Бронирование создано:', booking.id)
    res.status(201).json(booking)
  } catch (error) {
    console.error('Ошибка при создании бронирования:', error)
    res.status(500).json({
      message: 'Ошибка при создании бронирования',
      error: error.message,
    })
  }
})

// Отменить бронирование
router.delete('/:id', authenticate, async (req, res) => {
  try {
    console.log('Запрос на отмену бронирования:', req.params.id)

    const booking = await Booking.findOne({
      where: {
        id: req.params.id,
        UserId: req.user.id, // Fixed: Changed to UserId to match Sequelize model
      },
      include: [Payment],
    })

    if (!booking) {
      console.log('Бронирование не найдено')
      return res.status(404).json({ message: 'Бронирование не найдено' })
    }

    // Проверяем, не оплачено ли бронирование
    if (booking.Payment) {
      console.log('Бронирование уже оплачено, отмена невозможна')
      return res.status(400).json({ message: 'Нельзя отменить оплаченное бронирование' })
    }

    await booking.destroy()
    console.log('Бронирование успешно отменено')
    res.json({ message: 'Бронирование успешно отменено' })
  } catch (error) {
    console.error('Ошибка при отмене бронирования:', error)
    res.status(500).json({
      message: 'Ошибка при отмене бронирования',
      error: error.message,
    })
  }
})

// Завершить тур
router.patch('/:id/complete', authenticate, async (req, res) => {
  try {
    console.log('Запрос на завершение тура:', req.params.id)

    // Находим бронирование по ID
    const booking = await Booking.findOne({
      where: {
        id: req.params.id,
        UserId: req.user.id
      }
    })
    
    console.log('Найдено бронирование:', booking ? booking.toJSON() : null)

    if (!booking) {
      console.log('Бронирование не найдено')
      return res.status(404).json({ message: 'Бронирование не найдено' })
    }

    // Проверяем, что бронирование было оплачено
    console.log('Статус оплаты:', booking.paymentStatus);
    if (booking.paymentStatus !== 'PAID') {
      console.log('Бронирование не оплачено')
      return res.status(400).json({ message: 'Нельзя завершить неоплаченный тур' })
    }

    // Меняем статус бронирования на COMPLETED
    booking.status = 'COMPLETED'
    await booking.save()

    console.log('Тур успешно завершен')
    res.json({ 
      message: 'Тур успешно завершен, теперь вы можете оставить отзыв',
      booking
    })
  } catch (error) {
    console.error('Ошибка при завершении тура:', error)
    res.status(500).json({
      message: 'Ошибка при завершении тура',
      error: error.message
    })
  }
})

// Администратор может завершить любой тур
router.patch('/admin/:id/complete', authenticate, async (req, res) => {
  try {
    // Проверка роли администратора
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Доступ запрещен' })
    }

    const booking = await Booking.findByPk(req.params.id)

    if (!booking) {
      return res.status(404).json({ message: 'Бронирование не найдено' })
    }

    booking.status = 'COMPLETED'
    await booking.save()

    res.json({ 
      message: 'Тур успешно завершен администратором',
      booking
    })
  } catch (error) {
    console.error('Ошибка при завершении тура администратором:', error)
    res.status(500).json({
      message: 'Ошибка при завершении тура',
      error: error.message
    })
  }
})

export default router
