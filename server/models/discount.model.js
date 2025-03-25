import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Tour from './tour.model.js';

const Discount = sequelize.define('Discount', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  percentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 100
    }
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Связи
Discount.belongsTo(Tour);
Tour.hasMany(Discount);

export default Discount;