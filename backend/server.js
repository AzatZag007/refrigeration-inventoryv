const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const equipmentRoutes = require('./routes/equipment');

// 🔐 ДОБАВЛЯЕМ ИМПОРТЫ ДЛЯ АУТЕНТИФИКАЦИИ
const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./middleware/auth');
const createDemoUsers = require('./init-demo-users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Логирование всех входящих запросов
app.use((req, res, next) => {
  console.log(`\n📨 ${req.method} ${req.path}`);
  console.log(`   Full URL: ${req.originalUrl}`);
  next();
});

// Тестовый маршрут
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Сервер работает! 🚀', 
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL'
  });
});

// ✅ 1. AUTH (login/register БЕЗ JWT!)
app.use('/api/auth', authRoutes);

// ✅ 2. ADMIN (JWT + admin check)
app.use('/api/admin', authenticateToken, require('./routes/admin'));

// ✅ 3. Equipment (JWT защита внутри самого роута equipment.js)
app.use('/api/equipment', equipmentRoutes);

// Обработчик 404
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Маршрут не найден',
    path: req.path,
    method: req.method
  });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('❌ Необработанная ошибка:', err);
  console.error('Stack trace:', err.stack);
  
  res.status(err.status || 500).json({
    error: err.message || 'Внутренняя ошибка сервера',
    status: 'error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

// Запуск сервера
const startServer = async () => {
  try {
    console.log('🔄 Запускаем сервер...');
    
    console.log('🗄️  Синхронизируем модели с базой данных...');
    await sequelize.sync({ force: false });
    console.log('✅ Модели синхронизированы с базой данных');
    
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
