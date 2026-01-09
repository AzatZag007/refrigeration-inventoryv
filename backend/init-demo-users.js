const User = require('./models/user');

async function createDemoUsers() {
  try {
    console.log('🎯 Создание демо-пользователей...');

    // Демо-админ
    const [adminUser, adminCreated] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        email: 'admin@inventory.com',
        password_hash: 'admin123',
        role: 'admin',
        full_name: 'Администратор Системы'
      }
    });

    // Демо-техник
    const [techUser, techCreated] = await User.findOrCreate({
      where: { username: 'tech' },
      defaults: {
        email: 'tech@inventory.com',
        password_hash: 'tech123',
        role: 'technician',
        full_name: 'Техник Обслуживания'
      }
    });

    // Демо-просмотр
    const [viewerUser, viewerCreated] = await User.findOrCreate({
      where: { username: 'viewer' },
      defaults: {
        email: 'viewer@inventory.com',
        password_hash: 'viewer123',
        role: 'viewer',
        full_name: 'Пользователь Просмотра'
      }
    });

    console.log('✅ Демо-пользователи обработаны!');
    
    if (adminCreated) console.log('   👑 Создан администратор: admin / admin123');
    if (techCreated) console.log('   🔧 Создан техник: tech / tech123');
    if (viewerCreated) console.log('   👀 Создан пользователь просмотра: viewer / viewer123');
    
    if (!adminCreated) console.log('   👑 Администратор уже существует');
    if (!techCreated) console.log('   🔧 Техник уже существует');
    if (!viewerCreated) console.log('   👀 Пользователь просмотра уже существует');

  } catch (error) {
    console.error('❌ Ошибка создания демо-пользователей:', error);
  }
}

// Для тестирования скрипта отдельно
if (require.main === module) {
  const sequelize = require('../config/database');
  
  sequelize.sync({ force: false })
    .then(() => createDemoUsers())
    .then(() => {
      console.log('✅ Скрипт выполнен успешно');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Ошибка выполнения скрипта:', error);
      process.exit(1);
    });
}

module.exports = createDemoUsers;