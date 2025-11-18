const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Simple demo credentials
const USERS = {
  'admin': { id: 1, username: 'admin', role: 'admin', department: 'Headquarters', password: 'admin123' },
  'officer1': { id: 2, username: 'officer1', role: 'officer', department: 'District 1', password: 'officer123' },
  'officer2': { id: 3, username: 'officer2', role: 'officer', department: 'District 2', password: 'officer123' }
};

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Login attempt:', username);

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password required'
      });
    }

    const user = USERS[username];
    
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/me', (req, res) => {
  // Simple me endpoint - in real app, verify token
  res.json({ success: true, user: req.user });
});

module.exports = router;