import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Tour from './tour.model.js';

const TourDate = sequelize.define('TourDate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  availableSeats: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'SCHEDULED'
  }
});

// Связи
TourDate.belongsTo(Tour);
Tour.hasMany(TourDate);

export default TourDate;