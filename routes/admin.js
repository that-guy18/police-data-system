const express = require('express');
const { adminAuth } = require('../middleware/auth');
const DataManager = require('../utils/dataManager');
const NameMatcher = require('../utils/nameMatching');

const router = express.Router();

// Get system statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const records = await DataManager.getRecords();
    const activeRecords = records.filter(record => record.is_active);
    
    const stats = {
      total_records: activeRecords.length,
      unique_names: new Set(activeRecords.map(r => r.standardized_name)).size,
      by_type: {}
    };

    // Count by person type
    activeRecords.forEach(record => {
      stats.by_type[record.person_type] = (stats.by_type[record.person_type] || 0) + 1;
    });

    // Count by department
    stats.by_department = {};
    activeRecords.forEach(record => {
      stats.by_department[record.department] = (stats.by_department[record.department] || 0) + 1;
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// Test name matching algorithms
router.post('/test-matching', adminAuth, async (req, res) => {
  try {
    const { name1, name2 } = req.body;

    if (!name1 || !name2) {
      return res.status(400).json({
        success: false,
        message: 'Both names are required'
      });
    }

    const fuzzyScore = NameMatcher.fuzzyMatch(name1, name2);
    const phoneticMatch = NameMatcher.phoneticMatch(name1, name2);
    const combinedScore = NameMatcher.combinedMatch(name1, name2);

    res.json({
      success: true,
      comparison: {
        name1,
        name2,
        fuzzy_score: Math.round(fuzzyScore * 100),
        phonetic_match: phoneticMatch,
        combined_score: Math.round(combinedScore * 100),
        standardized_name1: NameMatcher.standardizeName(name1),
        standardized_name2: NameMatcher.standardizeName(name2)
      }
    });
  } catch (error) {
    console.error('Test matching error:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing matching algorithms'
    });
  }
});

// Bulk standardize names
router.post('/bulk-standardize', adminAuth, async (req, res) => {
  try {
    const { names } = req.body;

    if (!names || !Array.isArray(names)) {
      return res.status(400).json({
        success: false,
        message: 'Names array is required'
      });
    }

    const standardized = names.map(name => ({
      original: name,
      standardized: NameMatcher.standardizeName(name)
    }));

    res.json({
      success: true,
      results: standardized
    });
  } catch (error) {
    console.error('Bulk standardize error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk standardization'
    });
  }
});

// Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await DataManager.getUsers();
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    
    res.json({
      success: true,
      users: usersWithoutPasswords
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

module.exports = router;