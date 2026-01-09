const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// 🔐 РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ
exports.register = async (req, res) => {
  try {
    const { username, email, password, role, full_name } = req.body;

    // Проверяем обязательные поля
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Имя пользователя, email и пароль обязательны'
      });
    }

    // Проверяем существует ли пользователь
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Пользователь с таким именем или email уже существует'
      });
    }

    // Создаем пользователя
    const user = await User.create({
      username,
      email,
      password_hash: password,
      role: role || 'viewer',
      full_name: full_name || null
    });

    // Генерируем JWT токен
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Пользователь успешно создан',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      },
      token: token
    });

  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    res.status(500).json({ 
      error: 'Не удалось создать пользователя',
      details: error.message
    });
  }
};

// 🔑 АВТОРИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Проверяем обязательные поля
    if (!username || !password) {
      return res.status(400).json({
        error: 'Имя пользователя и пароль обязательны'
      });
    }

    // Ищем пользователя
    const user = await User.findOne({
      where: { username: username }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Неверное имя пользователя или пароль'
      });
    }

    // Проверяем активен ли пользователь
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Учетная запись деактивирована'
      });
    }

    // Проверяем пароль
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Неверное имя пользователя или пароль'
      });
    }

    // Генерируем JWT токен
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Авторизация успешна',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      },
      token: token
    });

  } catch (error) {
    console.error('❌ Ошибка авторизации:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при авторизации',
      details: error.message
    });
  }
};

// 👤 ПОЛУЧЕНИЕ ИНФОРМАЦИИ О ТЕКУЩЕМ ПОЛЬЗОВАТЕЛЕ
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Пользователь не найден'
      });
    }

    res.json({
      user: user
    });

  } catch (error) {
    console.error('❌ Ошибка получения пользователя:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: error.message
    });
  }
};