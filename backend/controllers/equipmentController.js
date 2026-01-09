const Equipment = require('../models/equipment');
const User = require('../models/user'); // Прямой импорт User
const QRCode = require('qrcode');

// 📋 ПОЛУЧИТЬ ВСЕ ОБОРУДОВАНИЕ - доступно всем
exports.getAllEquipment = async (req, res) => {
  try {
    console.log('📋 Запрос на получение оборудования');
    const equipment = await Equipment.findAll();
    res.json(equipment);
  } catch (error) {
    console.error('❌ Ошибка получения оборудования:', error);
    res.status(500).json({ error: error.message });
  }
};

// ➕ СОЗДАТЬ НОВОЕ ОБОРУДОВАНИЕ - только админы и техники
exports.createEquipment = async (req, res) => {
  try {
    // 🔐 ПРОВЕРКА ПРАВ - только admin и technician
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }
    if (!['admin', 'technician'].includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Недостаточно прав. Требуется роль admin или technician' 
      });
    }

    console.log('➕ Запрос на создание оборудования от пользователя:', req.user.username);
    
    const { serial_number, model_name, equipment_type, manufacturer, location } = req.body;
    
    // Проверяем обязательные поля
    if (!serial_number || !model_name || !equipment_type || !manufacturer || !location) {
      return res.status(400).json({
        error: 'Все поля обязательны для заполнения'
      });
    }
    
    // ... остальной код создания оборудования без изменений
    const equipment = await Equipment.create({
      serial_number,
      model_name,
      equipment_type,
      manufacturer,
      location
    });

    // Генерация QR-кода
    const qrData = JSON.stringify({
      equipment_id: equipment.id,
      serial_number: equipment.serial_number,
      type: 'equipment'
    });
    
    const qrCode = await QRCode.toDataURL(qrData);
    equipment.qr_code_data = qrCode;
    await equipment.save();

    console.log(`✅ Оборудование создано пользователем ${req.user.username}: ${equipment.model_name}`);
    
    res.status(201).json({
      message: 'Оборудование успешно создано',
      equipment: equipment,
      qr_code: qrCode
    });
    
  } catch (error) {
    console.error('❌ Ошибка при создании оборудования:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Оборудование с таким серийным номером уже существует'
      });
    }
    
    res.status(500).json({ 
      error: 'Не удалось создать оборудование',
      details: error.message
    });
  }
};

// 🔍 ПОЛУЧИТЬ ОБОРУДОВАНИЕ ПО ID - доступно всем
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: 'Оборудование не найдено' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ ОБНОВИТЬ ОБОРУДОВАНИЕ - только админы и техники
exports.updateEquipment = async (req, res) => {
  try {
    // 🔐 ПРОВЕРКА ПРАВ - только admin и technician
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }
    if (!['admin', 'technician'].includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Недостаточно прав. Требуется роль admin или technician' 
      });
    }

    console.log(`✏️ Запрос на обновление оборудования ID: ${req.params.id} от пользователя: ${req.user.username}`);
    
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: 'Оборудование не найдено' });
    }

    await equipment.update(req.body);
    
    console.log(`✅ Оборудование ID: ${req.params.id} обновлено пользователем ${req.user.username}`);
    
    res.json({
      message: 'Оборудование успешно обновлено',
      equipment: equipment
    });
  } catch (error) {
    console.error('❌ Ошибка при обновлении оборудования:', error);
    res.status(400).json({ error: error.message });
  }
};

// 🗑️ УДАЛИТЬ ОБОРУДОВАНИЕ - только админы
exports.deleteEquipment = async (req, res) => {
  try {
    // 🔐 ПРОВЕРКА ПРАВ - только admin
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Недостаточно прав. Требуется роль admin' 
      });
    }

    console.log(`🗑️ Запрос на удаление оборудования ID: ${req.params.id} от пользователя: ${req.user.username}`);
    
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: 'Оборудование не найдено' });
    }

    await equipment.destroy();
    
    console.log(`✅ Оборудование ID: ${req.params.id} удалено пользователем ${req.user.username}`);
    
    res.json({ message: 'Оборудование успешно удалено' });
  } catch (error) {
    console.error('❌ Ошибка при удалении оборудования:', error);
    res.status(500).json({ error: error.message });
  }
};

// 🎯 ПОЛУЧИТЬ QR-КОД ДЛЯ ОБОРУДОВАНИЯ - доступно всем
exports.getEquipmentQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Запрос QR-кода для оборудования ID: ${id}`);
    
    const equipment = await Equipment.findByPk(id);
    
    if (!equipment) {
      return res.status(404).json({ 
        error: 'Оборудование не найдено' 
      });
    }

    // Если QR код еще не сгенерирован - генерируем
    if (!equipment.qr_code_data) {
      const qrData = JSON.stringify({
        equipment_id: equipment.id,
        serial_number: equipment.serial_number,
        type: 'equipment'
      });
      
      const qrCode = await QRCode.toDataURL(qrData);
      equipment.qr_code_data = qrCode;
      await equipment.save();
    }

    res.json({
      equipment: {
        id: equipment.id,
        serial_number: equipment.serial_number,
        model_name: equipment.model_name
      },
      qr_code: equipment.qr_code_data
    });
    
  } catch (error) {
    console.error('❌ Ошибка при генерации QR-кода:', error);
    res.status(500).json({ 
      error: 'Не удалось сгенерировать QR-код',
      details: error.message
    });
  }
};

// 📱 ПОЛУЧИТЬ ИНФОРМАЦИЮ ПО QR-КОДУ - доступно всем
exports.getEquipmentByQR = async (req, res) => {
  try {
    const { qrData } = req.body;
    
    console.log(`🔄 Запрос информации по QR-коду:`, qrData);
    
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({
        error: 'Неверный формат QR-кода'
      });
    }

    const equipment = await Equipment.findByPk(parsedData.equipment_id);
    
    if (!equipment) {
      return res.status(404).json({ 
        error: 'Оборудование не найдено' 
      });
    }

    res.json(equipment);
    
  } catch (error) {
    console.error('❌ Ошибка при поиске по QR-коду:', error);
    res.status(500).json({ 
      error: 'Не удалось найти оборудование',
      details: error.message
    });
  }
};