const express = require('express');
const { User } = require('../models');
const { authMiddleware } = require('../middleware/auth'); // только authMiddleware!

const router = express.Router();

// Middleware проверки роли admin
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// 👑 GET /api/admin/users
router.get('/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'full_name', 'is_active', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔄 PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', authMiddleware, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['viewer', 'technician', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.role = role;
    await user.save();

    res.json({ message: `User ${user.username} role changed to ${role}`, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ❌ PATCH /api/admin/users/:id/status
router.patch('/users/:id/status', authMiddleware, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.is_active = Boolean(is_active);
    await user.save();

    res.json({
      message: `User ${user.username} ${is_active ? 'activated' : 'deactivated'}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
