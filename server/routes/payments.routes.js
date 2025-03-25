import express from 'express';
import { Payment, Booking } from '../models/index.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Получить платежи пользователя
router.get('/', authenticate, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{
        model: Booking,
        where: { userId: req.user.id },
        include: ['Tour']
      }]
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении платежей', error: error.message });
  }
});

// Создать платеж
router.post('/', authenticate, async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    // Проверяем бронирование
    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        userId: req.user.id,
        status: 'PENDING'
      }
    });

    if (!booking) {
      return res.status(404).json({ 
        message: 'Бронирование не найдено или уже оплачено' 
      });
    }

    // Создаем платеж
    const payment = await Payment.create({
      bookingId,
      amount: booking.totalPrice,
      paymentMethod,
      status: 'PENDING'
    });

    // В реальном приложении здесь была бы интеграция с платежной системой
    // Для демонстрации сразу помечаем как выполненный
    await payment.update({ status: 'COMPLETED' });
    await booking.update({ status: 'CONFIRMED' });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании платежа', error: error.message });
  }
});

export default router;