import express from 'express';
import { Tour, Booking, Review } from '../../models/index.js';
import { authenticate, checkRole } from '../../middleware/auth.middleware.js';
import { Op } from 'sequelize';

const router = express.Router();

// Middleware для проверки прав менеджера
router.use(authenticate, checkRole(['MANAGER']));

// Получить аналитику для менеджера
router.get('/', async (req, res) => {
  try {
    // Активные туры
    const activeTours = await Tour.count();

    // Общее количество бронирований
    const totalBookings = await Booking.count();

    // Средний рейтинг
    const ratings = await Review.findAll({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
      ]
    });
    const averageRating = ratings[0].get('averageRating') || 0;

    // Популярные туры
    const popularTours = await Tour.findAll({
      include: [{
        model: Booking,
        attributes: []
      }],
      attributes: [
        'id',
        'title',
        [sequelize.fn('COUNT', sequelize.col('Bookings.id')), 'bookings']
      ],
      group: ['Tour.id'],
      order: [[sequelize.literal('bookings'), 'DESC']],
      limit: 5
    });

    // Последние отзывы
    const recentReviews = await Review.findAll({
      include: [{
        model: Tour,
        attributes: ['title']
      }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      activeTours,
      totalBookings,
      averageRating,
      popularTours,
      recentReviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении аналитики', error: error.message });
  }
});

export default router;