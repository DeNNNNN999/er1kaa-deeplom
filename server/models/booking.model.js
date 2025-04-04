import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'
import User from './user.model.js'
import Tour from './tour.model.js'

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Убедитесь, что поля называются так, как ожидается в запросе
  UserId: {
    // Проверьте, что поле именно UserId, а не userId
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  TourId: {
    // Проверьте, что поле именно TourId, а не tourId
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Tour,
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'),
    defaultValue: 'PENDING',
  },
  bookingDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  participants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('UNPAID', 'PAID', 'REFUNDED'),
    defaultValue: 'UNPAID',
  },
})

// Связи - уточним их с указанием имен внешних ключей
Booking.belongsTo(User, { foreignKey: 'UserId' })
User.hasMany(Booking, { foreignKey: 'UserId' })

Booking.belongsTo(Tour, { foreignKey: 'TourId' })
Tour.hasMany(Booking, { foreignKey: 'TourId' })

export default Booking
