const { Sequelize } = require('sequelize');
require('dotenv').config();

// Создаем экземпляр Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

// Экспортируем сам экземпляр sequelize, а не класс
module.exports = sequelize;