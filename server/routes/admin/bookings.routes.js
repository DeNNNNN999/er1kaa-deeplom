import express from 'express';
import { Booking, User, Tour } from '../../models/index.js';
import { authenticate, checkRole } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Middleware для проверки прав администратора
router.use(authenticate, checkRole(['ADMIN']));

// Получить все бронирования
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { 
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Tour,
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении бронирований', error: error.message });
  }
});

// Обновить статус бронирования
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }

    await booking.update({ status });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении статуса', error: error.message });
  }
});

export default router;