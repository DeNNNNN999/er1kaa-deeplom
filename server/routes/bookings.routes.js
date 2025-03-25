import express from 'express';
import { Booking, Payment } from '../models/index.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Получить бронирования пользователя
router.get('/', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: ['Tour']
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении бронирований', error: error.message });
  }
});

// Отменить бронирование
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [Payment]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }

    // Проверяем, не оплачено ли бронирование
    if (booking.Payment) {
      return res.status(400).json({ message: 'Нельзя отменить оплаченное бронирование' });
    }

    await booking.destroy();
    res.json({ message: 'Бронирование успешно отменено' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при отмене бронирования', error: error.message });
  }
});

export default router;