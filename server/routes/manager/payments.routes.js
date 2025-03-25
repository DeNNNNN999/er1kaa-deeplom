import express from 'express';
import { Payment, Booking, User, Tour } from '../../models/index.js';
import { authenticate, checkRole } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Middleware для проверки прав менеджера
router.use(authenticate, checkRole(['MANAGER']));

// Получить все платежи
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{
        model: Booking,
        include: [
          { 
            model: User,
            attributes: ['firstName', 'lastName', 'email']
          },
          {
            model: Tour,
            attributes: ['title']
          }
        ]
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении платежей', error: error.message });
  }
});

// Обновить статус платежа
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findByPk(req.params.id, {
      include: [Booking]
    });
    
    if (!payment) {
      return res.status(404).json({ message: 'Платеж не найден' });
    }

    await payment.update({ status });

    // Обновляем статус бронирования
    if (status === 'COMPLETED') {
      await payment.Booking.update({ status: 'CONFIRMED' });
    } else if (status === 'FAILED') {
      await payment.Booking.update({ status: 'CANCELLED' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении статуса', error: error.message });
  }
});

export default router;