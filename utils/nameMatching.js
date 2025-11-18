const stringSimilarity = require('string-similarity');

class NameMatcher {
  // Enhanced fuzzy matching
  static fuzzyMatch(query, name) {
    try {
      // Clean the strings
      const cleanQuery = query.toLowerCase().trim();
      const cleanName = name.toLowerCase().trim();
      
      // Exact match
      if (cleanQuery === cleanName) return 1.0;
      
      // Contains match (strong indicator)
      if (cleanName.includes(cleanQuery) || cleanQuery.includes(cleanName)) {
        return 0.9;
      }
      
      // Use string similarity library
      const similarity = stringSimilarity.compareTwoStrings(cleanQuery, cleanName);
      
      // Common Hindi name variations that should boost score
      const commonVariations = [
        { from: 'sureesh', to: 'suresh' },
        { from: 'sursh', to: 'suresh' },
        { from: 'ramesh', to: 'rames' },
        { from: 'kumar', to: 'kummar' },
        { from: 'singh', to: 'sing' },
        { from: 'yadav', to: 'yadhav' },
        { from: 'sharma', to: 'sharma' },
        { from: 'verma', to: 'verma' }
      ];
      
      // Check for common variations
      for (const variation of commonVariations) {
        if ((cleanQuery.includes(variation.from) && cleanName.includes(variation.to)) ||
            (cleanQuery.includes(variation.to) && cleanName.includes(variation.from))) {
          return Math.min(similarity + 0.3, 1.0);
        }
      }
      
      // Boost score for similar sounding names
      const phoneticSimilar = this.phoneticMatch(cleanQuery, cleanName);
      if (phoneticSimilar) {
        return Math.min(similarity + 0.2, 1.0);
      }
      
      return similarity;
    } catch (error) {
      console.error('Fuzzy match error:', error);
      return 0;
    }
  }

  // Fixed phonetic matching for Hindi names
  static phoneticMatch(str1, str2) {
    try {
      const phonetic1 = this.getPhoneticRepresentation(str1);
      const phonetic2 = this.getPhoneticRepresentation(str2);
      
      console.log(`Phonetic comparison: "${str1}" -> "${phonetic1}" vs "${str2}" -> "${phonetic2}"`);
      
      return phonetic1 === phonetic2;
    } catch (error) {
      console.error('Phonetic match error:', error);
      return false;
    }
  }

  static getPhoneticRepresentation(str) {
    let phonetic = str.toLowerCase().trim();
    
    // Remove special characters and extra spaces
    phonetic = phonetic.replace(/[^a-z\s]/g, '');
    phonetic = phonetic.replace(/\s+/g, ' ');
    
    // Common Hindi phonetic substitutions
    const substitutions = [
      [/sh/g, 's'],
      [/ee/g, 'i'],
      [/oo/g, 'u'],
      [/aa/g, 'a'],
      [/ch/g, 'c'],
      [/th/g, 't'],
      [/dh/g, 'd'],
      [/bh/g, 'b'],
      [/gh/g, 'g'],
      [/kh/g, 'k'],
      [/ph/g, 'f'],
      [/zz/g, 'z'],
      [/rr/g, 'r'],
      // Common vowel variations
      [/[aeiou]/g, ''],
      // Remove repeated characters
      [/(.)\1+/g, '$1']
    ];
    
    // Apply substitutions in sequence
    substitutions.forEach(([pattern, replacement]) => {
      phonetic = phonetic.replace(pattern, replacement);
    });
    
    return phonetic.trim();
  }

  // Combined matching algorithm
  static combinedMatch(query, name) {
    try {
      const fuzzyScore = this.fuzzyMatch(query, name);
      const phoneticScore = this.phoneticMatch(query, name) ? 0.4 : 0;
      
      const combinedScore = fuzzyScore + phoneticScore;
      
      console.log(`Combined match: "${query}" vs "${name}" -> Fuzzy: ${fuzzyScore.toFixed(2)}, Phonetic: ${phoneticScore}, Combined: ${combinedScore.toFixed(2)}`);
      
      return Math.min(combinedScore, 1.0);
    } catch (error) {
      console.error('Combined match error:', error);
      return 0;
    }
  }

  // Enhanced name standardization
  static standardizeName(name) {
    if (!name || name.trim() === '') return '';
    
    let standardized = name.toLowerCase().trim();
    
    // Common standardization rules for Hindi names
    const rules = [
      // Spelling corrections
      [/shh+/g, 'sh'],
      [/sureesh/g, 'suresh'],
      [/sursh/g, 'suresh'],
      [/rames/g, 'ramesh'],
      [/kumarr+/g, 'kumar'],
      [/kummar/g, 'kumar'],
      [/jii+/g, 'ji'],
      [/devi/g, 'devi'],
      [/singh/g, 'singh'],
      [/sing/g, 'singh'],
      [/yadav/g, 'yadav'],
      [/yadhav/g, 'yadav'],
      [/choudhary/g, 'choudhary'],
      [/choudhury/g, 'choudhary'],
      [/chaudhary/g, 'choudhary'],
      [/tiwari/g, 'tiwari'],
      [/mishra/g, 'mishra'],
      [/gupta/g, 'gupta'],
      [/sharma/g, 'sharma'],
      [/verma/g, 'verma'],
      [/patel/g, 'patel'],
      [/naik/g, 'naik'],
      [/joshi/g, 'joshi'],
      // Remove extra spaces
      [/\s+/g, ' ']
    ];
    
    rules.forEach(([pattern, replacement]) => {
      standardized = standardized.replace(pattern, replacement);
    });
    
    // Capitalize first letter of each word
    standardized = standardized.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return standardized;
  }

  // Main search function with enhanced logging
  static searchNames(query, records, algorithm = 'combined', threshold = 0.3) {
    try {
      console.log(`\n🔍 Starting name search:`);
      console.log(`   Query: "${query}"`);
      console.log(`   Algorithm: ${algorithm}`);
      console.log(`   Threshold: ${threshold}`);
      console.log(`   Records to search: ${records.length}`);
      
      const standardizedQuery = this.standardizeName(query);
      const activeRecords = records.filter(record => record.is_active);
      
      console.log(`   Active records: ${activeRecords.length}`);
      console.log(`   Standardized query: "${standardizedQuery}"`);
      
      const matches = activeRecords.map(record => {
        let score;
        
        switch (algorithm) {
          case 'fuzzy':
            score = this.fuzzyMatch(query, record.original_name);
            break;
          case 'phonetic':
            score = this.phoneticMatch(query, record.original_name) ? 0.8 : 0.1;
            break;
          case 'combined':
          default:
            score = this.combinedMatch(query, record.original_name);
            break;
        }
        
        // Boost score if standardized names match
        const recordStandardized = this.standardizeName(record.original_name);
        if (recordStandardized === standardizedQuery) {
          score = Math.min(score + 0.2, 1.0);
          console.log(`   💫 Standardized match boost for: ${record.original_name}`);
        }
        
        return {
          ...record,
          match_score: score,
          standardized_query: standardizedQuery,
          record_standardized: recordStandardized
        };
      }).filter(match => {
        const passes = match.match_score > threshold;
        if (passes) {
          console.log(`   ✅ Match: "${match.original_name}" -> Score: ${match.match_score.toFixed(2)}`);
        }
        return passes;
      }).sort((a, b) => b.match_score - a.match_score);
      
      console.log(`   📊 Total matches found: ${matches.length}`);
      
      return matches;
    } catch (error) {
      console.error('Search names error:', error);
      return [];
    }
  }
}

module.exports = NameMatcher;