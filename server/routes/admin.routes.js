import express from 'express';
import { User, Tour, Booking, Category, Payment } from '../models/index.js';
import { authenticate, checkRole } from '../middleware/auth.middleware.js';
import { Op } from 'sequelize';

const router = express.Router();

// Middleware для проверки прав администратора
router.use(authenticate, checkRole(['ADMIN']));

// Получить всех пользователей
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'blocked']
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении пользователей', error: error.message });
  }
});

// Создать нового пользователя (менеджера)
router.post('/users', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    // Проверяем, что создаваемый пользователь - менеджер
    if (role !== 'MANAGER') {
      return res.status(400).json({ message: 'Можно создавать только менеджеров' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании пользователя', error: error.message });
  }
});

// Обновить роль пользователя
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    await user.update({ role });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении роли', error: error.message });
  }
});

// Заблокировать/разблокировать пользователя
router.put('/users/:id/block', async (req, res) => {
  try {
    const { blocked } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    await user.update({ blocked });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при блокировке/разблокировке', error: error.message });
  }
});

// Получить аналитику
router.get('/analytics', async (req, res) => {
  try {
    // Общая выручка
    const totalRevenue = await Payment.sum('amount', {
      where: { status: 'COMPLETED' }
    });

    // Количество активных туров
    const activeTours = await Tour.count();

    // Новые пользователи за последний месяц
    const newUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Рост продаж (пример: сравнение с предыдущим месяцем)
    const currentMonthSales = await Payment.sum('amount', {
      where: {
        status: 'COMPLETED',
        createdAt: {
          [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const previousMonthSales = await Payment.sum('amount', {
      where: {
        status: 'COMPLETED',
        createdAt: {
          [Op.between]: [
            new Date(new Date() - 60 * 24 * 60 * 60 * 1000),
            new Date(new Date() - 30 * 24 * 60 * 60 * 1000)
          ]
        }
      }
    });

    const salesGrowth = previousMonthSales
      ? ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100
      : 100;

    // Популярные туры
    const popularTours = await Tour.findAll({
      include: [{
        model: Booking,
        include: [Payment]
      }],
      attributes: [
        'id',
        'title',
        [sequelize.fn('COUNT', sequelize.col('Bookings.id')), 'bookings'],
        [sequelize.fn('SUM', sequelize.col('Bookings.Payment.amount')), 'revenue']
      ],
      group: ['Tour.id'],
      order: [[sequelize.literal('bookings'), 'DESC']],
      limit: 5
    });

    // Статистика по категориям
    const categoryStats = await Category.findAll({
      include: [{
        model: Tour,
        include: [{
          model: Booking,
          include: [Payment]
        }]
      }],
      attributes: [
        'id',
        'name',
        [sequelize.fn('SUM', sequelize.col('Tours.Bookings.Payment.amount')), 'revenue']
      ],
      group: ['Category.id']
    });

    // Вычисляем процент от общей выручки для каждой категории
    const categoryStatsWithPercentage = categoryStats.map(category => ({
      ...category.toJSON(),
      percentage: (category.revenue / totalRevenue) * 100
    }));

    res.json({
      totalRevenue,
      activeTours,
      newUsers,
      salesGrowth,
      popularTours,
      categoryStats: categoryStatsWithPercentage
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении аналитики', error: error.message });
  }
});

export default router;