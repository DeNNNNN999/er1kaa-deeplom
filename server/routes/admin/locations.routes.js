import express from 'express';
import { Location } from '../../models/index.js';
import { authenticate, checkRole } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Middleware для проверки прав администратора
router.use(authenticate, checkRole(['ADMIN']));

// Получить все локации
router.get('/', async (req, res) => {
  try {
    const locations = await Location.findAll();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении локаций', error: error.message });
  }
});

// Создать локацию
router.post('/', async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании локации', error: error.message });
  }
});

// Обновить локацию
router.put('/:id', async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Локация не найдена' });
    }

    await location.update(req.body);
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении локации', error: error.message });
  }
});

// Удалить локацию
router.delete('/:id', async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Локация не найдена' });
    }

    await location.destroy();
    res.json({ message: 'Локация успешно удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении локации', error: error.message });
  }
});

export default router;