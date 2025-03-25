import express from 'express';
import { Discount, Tour } from '../../models/index.js';
import { authenticate, checkRole } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Middleware для проверки прав администратора
router.use(authenticate, checkRole(['ADMIN']));

// Получить все скидки
router.get('/', async (req, res) => {
  try {
    const discounts = await Discount.findAll({
      include: [{ model: Tour, attributes: ['id', 'title'] }]
    });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении скидок', error: error.message });
  }
});

// Создать скидку
router.post('/', async (req, res) => {
  try {
    const discount = await Discount.create(req.body);
    res.status(201).json(discount);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании скидки', error: error.message });
  }
});

// Обновить скидку
router.put('/:id', async (req, res) => {
  try {
    const discount = await Discount.findByPk(req.params.id);
    
    if (!discount) {
      return res.status(404).json({ message: 'Скидка не найдена' });
    }

    await discount.update(req.body);
    res.json(discount);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении скидки', error: error.message });
  }
});

// Удалить скидку
router.delete('/:id', async (req, res) => {
  try {
    const discount = await Discount.findByPk(req.params.id);
    
    if (!discount) {
      return res.status(404).json({ message: 'Скидка не найдена' });
    }

    await discount.destroy();
    res.json({ message: 'Скидка успешно удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении скидки', error: error.message });
  }
});

export default router;