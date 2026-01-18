const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticateToken } = require('../middleware/auth');

// 📋 GET /api/equipment - Получить все оборудование (без авторизации)
router.get('/', equipmentController.getAllEquipment);

// 🔍 GET /api/equipment/:id - Получить оборудование по ID (без авторизации)
router.get('/:id', equipmentController.getEquipmentById);

// ➕ POST /api/equipment - Создать новое оборудование (ТРЕБУЕТ JWT)
router.post('/', authenticateToken, equipmentController.createEquipment);

// ✏️ PUT /api/equipment/:id - Обновить оборудование (ТРЕБУЕТ JWT)
router.put('/:id', authenticateToken, equipmentController.updateEquipment);

// 🗑️ DELETE /api/equipment/:id - Удалить оборудование (ТРЕБУЕТ JWT)
router.delete('/:id', authenticateToken, equipmentController.deleteEquipment);

// 🎯 GET /api/equipment/:id/qr-code - Получить QR-код оборудования (без авторизации)
router.get('/:id/qr-code', equipmentController.getEquipmentQRCode);

// 📱 POST /api/equipment/qr-scan - Сканирование QR-кода (без авторизации)
router.post('/qr-scan', equipmentController.getEquipmentByQR);

module.exports = router;
