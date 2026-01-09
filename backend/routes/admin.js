const express = require('express');
const { User } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth'); // ✅ Глобальный!

const router = express.Router();

// 👑 GET /api/admin/users — JWT + admin check
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  console.log('🔍 DEBUG - req.user:', req.user); // Backend лог!
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'is_active'],
      order: [['id', 'DESC']]
    });
    console.log('👥 DEBUG - Users count:', users.length);
    res.json(users);
  } catch (error) {
    console.error('❌ Users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🔄 PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  const { role } = req.body;
  const id = parseInt(req.params.id);
  if (!['viewer', 'technician', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ message: `Role changed to ${role}`, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ⚡ PATCH /api/admin/users/:id/status
router.patch('/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { is_active } = req.body;
  const id = parseInt(req.params.id);
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.is_active = Boolean(is_active);
    await user.save();
    res.json({ message: `User ${is_active ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
