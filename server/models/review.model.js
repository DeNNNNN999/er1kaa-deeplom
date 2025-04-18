import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './user.model.js';
import Tour from './tour.model.js';

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Связи
Review.belongsTo(User, { foreignKey: 'UserId' });
User.hasMany(Review, { foreignKey: 'UserId' });

Review.belongsTo(Tour, { foreignKey: 'TourId' });
Tour.hasMany(Review, { foreignKey: 'TourId' });

export default Review;