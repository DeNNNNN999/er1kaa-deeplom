import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Category from './category.model.js';

const Tour = sequelize.define('Tour', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  duration: {
    type: DataTypes.INTEGER, // в днях
    allowNull: false,
    validate: {
      min: 1
    }
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Связи
Tour.belongsTo(Category);
Category.hasMany(Tour);

export default Tour;