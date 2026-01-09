const sequelize = require('../config/database');
const Equipment = require('./equipment');
const User = require('./user');

// Здесь можно добавить связи между моделями в будущем
// Например: Equipment.belongsTo(User, { foreignKey: 'created_by' });

module.exports = {
  sequelize,
  Equipment,
  User
};