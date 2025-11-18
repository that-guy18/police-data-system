const fs = require('fs').promises;
const path = require('path');

class DataManager {
  static dataPath = path.join(__dirname, '../data');

  static async readJSON(fileName) {
    try {
      const filePath = path.join(this.dataPath, fileName);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${fileName}:`, error);
      return [];
    }
  }

  static async writeJSON(fileName, data) {
    try {
      const filePath = path.join(this.dataPath, fileName);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error(`Error writing ${fileName}:`, error);
      return false;
    }
  }

  static async getUsers() {
    return await this.readJSON('users.json');
  }

  static async getRecords() {
    return await this.readJSON('records.json');
  }

  static async saveRecords(records) {
    return await this.writeJSON('records.json', records);
  }

  static async addRecord(newRecord) {
    const records = await this.getRecords();
    const maxId = records.reduce((max, record) => Math.max(max, record.id), 0);
    
    const record = {
      ...newRecord,
      id: maxId + 1,
      created_at: new Date().toISOString(),
      is_active: true
    };
    
    records.push(record);
    await this.saveRecords(records);
    return record;
  }

  static async updateRecord(id, updates) {
    const records = await this.getRecords();
    const index = records.findIndex(record => record.id === id);
    
    if (index === -1) return null;
    
    records[index] = { ...records[index], ...updates };
    await this.saveRecords(records);
    return records[index];
  }

  static async deleteRecord(id) {
    const records = await this.getRecords();
    const index = records.findIndex(record => record.id === id);
    
    if (index === -1) return false;
    
    records[index].is_active = false;
    await this.saveRecords(records);
    return true;
  }
}

module.exports = DataManager;