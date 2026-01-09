const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Equipment = sequelize.define('Equipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  serial_number: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  model_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  equipment_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  manufacturer: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'maintenance', 'out_of_service'),
    defaultValue: 'active'
  },
  qr_code_data: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'equipment',
  timestamps: true
});

module.exports = Equipment;