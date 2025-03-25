import express from 'express';
import { Refund, Booking, User, Tour } from '../../models/index.js';
import { authenticate, checkRole } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Middleware для проверки прав администратора
router.use(authenticate, checkRole(['ADMIN']));

// Получить все возвраты
router.get('/', async (req, res) => {
  try {
    const refunds = await Refund.findAll({
      include: [{
        model: Booking,
        include: [
          { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Tour, attributes: ['id', 'title'] }
        ]
      }]
    });
    res.json(refunds);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении возвратов', error: error.message });
  }
});

// Обработать возврат
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const refund = await Refund.findByPk(req.params.id, {
      include: [{ model: Booking }]
    });
    
    if (!refund) {
      return res.status(404).json({ message: 'Возврат не найден' });
    }

    await refund.update({ status });

    // Если возврат одобрен, обновляем статус бронирования
    if (status === 'APPROVED') {
      await refund.Booking.update({ status: 'REFUNDED' });
    }

    res.json(refund);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обработке возврата', error: error.message });
  }
});

export default router;