import express from 'express';
import { Review, User, Tour } from '../../models/index.js';
import { authenticate, checkRole } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Middleware для проверки прав менеджера
router.use(authenticate, checkRole(['MANAGER']));

// Получить все отзывы
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { 
          model: User,
          attributes: ['firstName', 'lastName']
        },
        {
          model: Tour,
          attributes: ['title']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении отзывов', error: error.message });
  }
});

// Модерация отзыва
router.put('/:id/moderate', async (req, res) => {
  try {
    const { approved } = req.body;
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Отзыв не найден' });
    }

    await review.update({
      moderated: true,
      approved
    });
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при модерации отзыва', error: error.message });
  }
});

export default router;