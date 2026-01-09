const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware для проверки JWT токена
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Токен доступа отсутствует'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Недействительный токен'
      });
    }

    req.user = user;
    next();
  });
};

// Middleware для проверки ролей
exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Пользователь не авторизован'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Недостаточно прав для выполнения операции'
      });
    }

    next();
  };
};

// Упрощенные проверки для конкретных ролей
exports.requireAdmin = exports.requireRole(['admin']);
exports.requireTechnicianOrAdmin = exports.requireRole(['admin', 'technician']);
exports.requireViewerOrAbove = exports.requireRole(['admin', 'technician', 'viewer']);