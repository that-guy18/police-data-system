const express = require('express');
const { auth } = require('../middleware/auth');
const DataManager = require('../utils/dataManager');
const NameMatcher = require('../utils/nameMatching');

const router = express.Router();

// Search names with enhanced debugging
router.post('/search', auth, async (req, res) => {
  try {
    const { query, algorithm = 'combined', threshold = 0.3 } = req.body;

    console.log('\n🎯 SEARCH REQUEST RECEIVED:');
    console.log('   User:', req.user.username);
    console.log('   Query:', query);
    console.log('   Algorithm:', algorithm);
    console.log('   Threshold:', threshold);

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Get all records
    const records = await DataManager.getRecords();
    console.log('   Total records in database:', records.length);
    
    // Perform matching
    const matches = NameMatcher.searchNames(
      query.trim(), 
      records, 
      algorithm, 
      parseFloat(threshold)
    );

    console.log('   Final matches to return:', matches.length);

    res.json({
      success: true,
      query: query.trim(),
      algorithm,
      threshold: parseFloat(threshold),
      matches_found: matches.length,
      matches: matches.map(match => ({
        id: match.id,
        original_name: match.original_name,
        standardized_name: match.standardized_name,
        person_type: match.person_type,
        case_number: match.case_number,
        department: match.department,
        created_by: match.created_by_name,
        match_score: Math.round(match.match_score * 100),
        created_at: match.created_at
      }))
    });

  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching names: ' + error.message
    });
  }
});

// Test matching endpoint for debugging
router.post('/test-match', auth, async (req, res) => {
  try {
    const { name1, name2, algorithm = 'combined' } = req.body;

    console.log('\n🧪 TEST MATCH REQUEST:');
    console.log('   Name 1:', name1);
    console.log('   Name 2:', name2);
    console.log('   Algorithm:', algorithm);

    let score;
    switch (algorithm) {
      case 'fuzzy':
        score = NameMatcher.fuzzyMatch(name1, name2);
        break;
      case 'phonetic':
        score = NameMatcher.phoneticMatch(name1, name2) ? 1.0 : 0.0;
        break;
      case 'combined':
      default:
        score = NameMatcher.combinedMatch(name1, name2);
        break;
    }

    const standardized1 = NameMatcher.standardizeName(name1);
    const standardized2 = NameMatcher.standardizeName(name2);

    console.log('   Results:');
    console.log('     Score:', score);
    console.log('     Standardized 1:', standardized1);
    console.log('     Standardized 2:', standardized2);

    res.json({
      success: true,
      name1,
      name2,
      algorithm,
      score: Math.round(score * 100),
      standardized_name1: standardized1,
      standardized_name2: standardized2,
      phonetic_match: NameMatcher.phoneticMatch(name1, name2)
    });

  } catch (error) {
    console.error('Test match error:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing match: ' + error.message
    });
  }
});

// Get all records for debugging
router.get('/debug/records', auth, async (req, res) => {
  try {
    const records = await DataManager.getRecords();
    const activeRecords = records.filter(record => record.is_active);
    
    res.json({
      success: true,
      total_records: records.length,
      active_records: activeRecords.length,
      records: activeRecords.map(record => ({
        id: record.id,
        original_name: record.original_name,
        standardized_name: record.standardized_name,
        person_type: record.person_type,
        case_number: record.case_number
      }))
    });
  } catch (error) {
    console.error('Debug records error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching debug records'
    });
  }
});

// Add new name record
router.post('/', auth, async (req, res) => {
  try {
    const { original_name, person_type, case_number, department } = req.body;

    if (!original_name || !person_type) {
      return res.status(400).json({
        success: false,
        message: 'Original name and person type are required'
      });
    }

    const standardized_name = NameMatcher.standardizeName(original_name);

    const newRecord = await DataManager.addRecord({
      original_name: original_name.trim(),
      standardized_name,
      person_type,
      case_number: case_number || null,
      department: department || req.user.department,
      created_by: req.user.id,
      created_by_name: req.user.username
    });

    res.status(201).json({
      success: true,
      message: 'Name record created successfully',
      record: newRecord
    });
  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating name record'
    });
  }
});

// Get record by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const records = await DataManager.getRecords();
    const record = records.find(r => r.id === parseInt(req.params.id) && r.is_active);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    res.json({
      success: true,
      record
    });
  } catch (error) {
    console.error('Get record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching record'
    });
  }
});

// Standardize a name
router.post('/standardize', auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const standardized = NameMatcher.standardizeName(name);

    res.json({
      success: true,
      original_name: name,
      standardized_name: standardized
    });
  } catch (error) {
    console.error('Standardize error:', error);
    res.status(500).json({
      success: false,
      message: 'Error standardizing name'
    });
  }
});

module.exports = router;