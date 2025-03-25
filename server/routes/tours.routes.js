import express from 'express';
import { Tour, Category } from '../models/index.js';
import { authenticate, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Получить все туры с фильтрацией
router.get('/', async (req, res) => {
  try {
    const { categoryId, minPrice, maxPrice, location } = req.query;
    const where = {};
    
    if (categoryId) where.categoryId = categoryId;
    if (location) where.location = location;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.$gte = minPrice;
      if (maxPrice) where.price.$lte = maxPrice;
    }

    const tours = await Tour.findAll({
      where,
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });
    
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении туров', error: error.message });
  }
});

// Получить тур по ID
router.get('/:id', async (req, res) => {
  try {
    const tour = await Tour.findByPk(req.params.id, {
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });
    
    if (!tour) {
      return res.status(404).json({ message: 'Тур не найден' });
    }
    
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении тура', error: error.message });
  }
});

// Создать тур (только MANAGER и ADMIN)
router.post('/', authenticate, checkRole(['MANAGER', 'ADMIN']), async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json(tour);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании тура', error: error.message });
  }
});

// Обновить тур (только MANAGER и ADMIN)
router.put('/:id', authenticate, checkRole(['MANAGER', 'ADMIN']), async (req, res) => {
  try {
    const tour = await Tour.findByPk(req.params.id);
    
    if (!tour) {
      return res.status(404).json({ message: 'Тур не найден' });
    }

    await tour.update(req.body);
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении тура', error: error.message });
  }
});

// Удалить тур (только ADMIN)
router.delete('/:id', authenticate, checkRole(['ADMIN']), async (req, res) => {
  try {
    const tour = await Tour.findByPk(req.params.id);
    
    if (!tour) {
      return res.status(404).json({ message: 'Тур не найден' });
    }

    await tour.destroy();
    res.json({ message: 'Тур успешно удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении тура', error: error.message });
  }
});

export default router;