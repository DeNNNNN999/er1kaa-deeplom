import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './user.model.js';
import Tour from './tour.model.js';

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'),
    defaultValue: 'PENDING'
  },
  bookingDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  participants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('UNPAID', 'PAID', 'REFUNDED'),
    defaultValue: 'UNPAID'
  }
});

// Связи
Booking.belongsTo(User);
User.hasMany(Booking);

Booking.belongsTo(Tour);
Tour.hasMany(Booking);

export default Booking;