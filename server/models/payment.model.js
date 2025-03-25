import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Booking from './booking.model.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED'),
    defaultValue: 'PENDING'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Связи
Payment.belongsTo(Booking);
Booking.hasOne(Payment);

export default Payment;