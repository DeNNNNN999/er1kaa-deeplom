import express from 'express';
import { Review, Booking } from '../models/index.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Получить отзывы для тура
router.get('/tour/:tourId', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { tourId: req.params.tourId },
      include: [{ 
        model: User,
        attributes: ['firstName', 'lastName']
      }]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении отзывов', error: error.message });
  }
});

// Создать отзыв
router.post('/', authenticate, async (req, res) => {
  try {
    const { tourId, rating, comment } = req.body;

    // Проверяем, есть ли завершенное бронирование
    const booking = await Booking.findOne({
      where: {
        userId: req.user.id,
        tourId,
        status: 'COMPLETED'
      }
    });

    if (!booking) {
      return res.status(403).json({ 
        message: 'Вы можете оставить отзыв только после завершения тура' 
      });
    }

    // Проверяем, не оставлял ли пользователь уже отзыв
    const existingReview = await Review.findOne({
      where: {
        userId: req.user.id,
        tourId
      }
    });

    if (existingReview) {
      return res.status(400).json({ 
        message: 'Вы уже оставили отзыв для этого тура' 
      });
    }

    const review = await Review.create({
      userId: req.user.id,
      tourId,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании отзыва', error: error.message });
  }
});

// Удалить свой отзыв
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const review = await Review.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!review) {
      return res.status(404).json({ message: 'Отзыв не найден' });
    }

    await review.destroy();
    res.json({ message: 'Отзыв успешно удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении отзыва', error: error.message });
  }
});

export default router;