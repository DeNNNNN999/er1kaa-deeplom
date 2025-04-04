import express from 'express';
import { Tour, Booking, Review } from '../../models/index.js';
import { sequelize } from '../../config/database.js';
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
    const averageRating = ratings[0].dataValues.averageRating || 0;

    // Расчет общей выручки
    const bookings = await Booking.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalRevenue']
      ]
    });
    const totalRevenue = bookings[0].dataValues.totalRevenue || 0;

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

    // Преобразование данных популярных туров
    const formattedPopularTours = popularTours.map(tour => {
      const { id, title, dataValues } = tour;
      return {
        id,
        title,
        bookings: parseInt(dataValues.bookings || 0)
      };
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

    // Преобразование данных последних отзывов
    const formattedRecentReviews = recentReviews.map(review => {
      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        tourTitle: review.Tour ? review.Tour.title : 'Неизвестный тур'
      };
    });

    // Продажи по месяцам
    const monthlySales = await Booking.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'sales']
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().getFullYear(), 0, 1) // С начала текущего года
        }
      },
      group: [sequelize.fn('MONTH', sequelize.col('createdAt'))],
      order: [[sequelize.fn('MONTH', sequelize.col('createdAt')), 'ASC']]
    });

    // Преобразование чисел месяцев в названия
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const formattedMonthlySales = monthlySales.map(item => {
      const monthNumber = parseInt(item.dataValues.month) - 1; // -1 потому что массив начинается с 0
      return {
        month: monthNames[monthNumber],
        sales: parseFloat(item.dataValues.sales || 0)
      };
    });

    res.json({
      activeTours,
      totalBookings,
      averageRating,
      totalRevenue,
      popularTours: formattedPopularTours,
      recentReviews: formattedRecentReviews,
      monthlySales: formattedMonthlySales
    });
  } catch (error) {
    console.error('Ошибка аналитики:', error);
    res.status(500).json({ message: 'Ошибка при получении аналитики', error: error.message });
  }
});

export default router;