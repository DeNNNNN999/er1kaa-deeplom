import express from 'express';
import { TourDate, Tour } from '../../models/index.js';
import { authenticate, checkRole } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Middleware для проверки прав администратора
router.use(authenticate, checkRole(['ADMIN', 'MANAGER']));

// Получить все даты для тура
router.get('/tour/:tourId', async (req, res) => {
  try {
    const dates = await TourDate.findAll({
      where: { tourId: req.params.tourId },
      order: [['startDate', 'ASC']]
    });
    res.json(dates);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении дат', error: error.message });
  }
});

// Создать новую дату проведения тура
router.post('/', async (req, res) => {
  try {
    const tourDate = await TourDate.create(req.body);
    res.status(201).json(tourDate);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании даты', error: error.message });
  }
});

// Обновить дату проведения тура
router.put('/:id', async (req, res) => {
  try {
    const tourDate = await TourDate.findByPk(req.params.id);
    
    if (!tourDate) {
      return res.status(404).json({ message: 'Дата не найдена' });
    }

    await tourDate.update(req.body);
    res.json(tourDate);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении даты', error: error.message });
  }
});

// Удалить дату проведения тура
router.delete('/:id', async (req, res) => {
  try {
    const tourDate = await TourDate.findByPk(req.params.id);
    
    if (!tourDate) {
      return res.status(404).json({ message: 'Дата не найдена' });
    }

    await tourDate.destroy();
    res.json({ message: 'Дата успешно удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении даты', error: error.message });
  }
});

export default router;