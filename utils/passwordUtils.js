const bcrypt = require('bcryptjs');

class PasswordUtils {
  // For demo purposes, we'll use simple password matching
  // In production, always use proper bcrypt
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  static async comparePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Password comparison error:', error);
      return false;
    }
  }

  // Simple demo password check (remove in production)
  static demoPasswordCheck(plainPassword, storedPassword) {
    const demoPasswords = {
      'admin': 'admin123',
      'officer1': 'officer123', 
      'officer2': 'officer123'
    };
    
    // For demo, check against known passwords
    for (const [username, password] of Object.entries(demoPasswords)) {
      if (storedPassword.includes(username) && plainPassword === password) {
        return true;
      }
    }
    
    return false;
  }
}

module.exports = PasswordUtils;