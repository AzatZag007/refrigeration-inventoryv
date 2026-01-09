const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const equipmentRoutes = require('./routes/equipment');

// 🔐 ДОБАВЛЯЕМ ИМПОРТЫ ДЛЯ АУТЕНТИФИКАЦИИ
const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./middleware/auth');
const createDemoUsers = require('./init-demo-users'); // ← ИМПОРТ СКРИПТА ДЕМО-ПОЛЬЗОВАТЕЛЕЙ

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 🔐 ПОДКЛЮЧАЕМ МАРШРУТЫ АУТЕНТИФИКАЦИИ
app.use('/api/auth', authRoutes);

// 🔐 НАСТРАИВАЕМ ПРОВЕРКУ ПРАВ ДОСТУПА ДЛЯ ОБОРУДОВАНИЯ
app.use('/api/equipment', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    // Для создания, редактирования, удаления - проверяем токен
    authenticateToken(req, res, next);
  } else {
    // Для GET запросов (просмотр) - пропускаем без проверки
    next();
  }
});

// Подключаем маршруты оборудования
app.use('/api/equipment', equipmentRoutes);

// Тестовый маршрут
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Сервер работает! 🚀', 
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL'
  });
});

// Запуск сервера
const startServer = async () => {
  try {
    console.log('🔄 Запускаем сервер...');
    
    // Синхронизируем модели с базой данных
    console.log('🗄️  Синхронизируем модели с базой данных...');
    await sequelize.sync({ force: false });
    console.log('✅ Модели синхронизированы с базой данных');
    
    // 🎯 ДОБАВЛЯЕМ СОЗДАНИЕ ДЕМО-ПОЛЬЗОВАТЕЛЕЙ ЗДЕСЬ!
    console.log('👥 Создаем демо-пользователей...');
    await createDemoUsers();
    console.log('✅ Демо-пользователи готовы к использованию');
    
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log('🚀 СЕРВЕР ЗАПУЩЕН УСПЕШНО!');
      console.log('='.repeat(50));
      console.log(`📍 Порт: ${PORT}`);
      console.log(`📱 API: http://localhost:${PORT}/api`);
      console.log(`🔧 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`🗄️  База данных: ${process.env.DB_NAME}:${process.env.DB_PORT}`);
      console.log('='.repeat(50));
      console.log('🎯 Демо-аккаунты для тестирования:');
      console.log('   👑 Админ: admin / admin123');
      console.log('   🔧 Техник: tech / tech123'); 
      console.log('   👀 Просмотр: viewer / viewer123');
      console.log('='.repeat(50));
    });
    
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error.message);
    console.error('🔍 Детали ошибки:', error);
  }
};

startServer();