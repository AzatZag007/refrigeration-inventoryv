const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// 🔐 Регистрация
router.post('/register', authController.register);

// 🔑 Авторизация
router.post('/login', authController.login);

// 👤 Получение информации о текущем пользователе
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;