const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');

// 📋 GET /api/equipment - Получить все оборудование
router.get('/', equipmentController.getAllEquipment);

// 🔍 GET /api/equipment/:id - Получить оборудование по ID
router.get('/:id', equipmentController.getEquipmentById);

// ➕ POST /api/equipment - Создать новое оборудование
router.post('/', equipmentController.createEquipment);

// ✏️ PUT /api/equipment/:id - Обновить оборудование
router.put('/:id', equipmentController.updateEquipment);

// 🗑️ DELETE /api/equipment/:id - Удалить оборудование
router.delete('/:id', equipmentController.deleteEquipment);

// 🎯 GET /api/equipment/:id/qr-code - Получить QR-код оборудования
router.get('/:id/qr-code', equipmentController.getEquipmentQRCode);

// 📱 POST /api/equipment/qr-scan - Сканирование QR-кода
router.post('/qr-scan', equipmentController.getEquipmentByQR);

module.exports = router;