import express from 'express';
import { Category } from '../models/index.js';
import { authenticate, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Получить все категории
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении категорий', error: error.message });
  }
});

// Создать категорию (только MANAGER и ADMIN)
router.post('/', authenticate, checkRole(['MANAGER', 'ADMIN']), async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании категории', error: error.message });
  }
});

// Обновить категорию (только MANAGER и ADMIN)
router.put('/:id', authenticate, checkRole(['MANAGER', 'ADMIN']), async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }

    await category.update({ name, description });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении категории', error: error.message });
  }
});

// Удалить категорию (только ADMIN)
router.delete('/:id', authenticate, checkRole(['ADMIN']), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }

    await category.destroy();
    res.json({ message: 'Категория успешно удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении категории', error: error.message });
  }
});

export default router;