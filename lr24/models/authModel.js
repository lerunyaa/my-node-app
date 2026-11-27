const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

class AuthModel {
  static getCollection() {
    return getDB().collection('users');
  }

  static async findByEmail(email) {
    return await this.getCollection().findOne({ email });
  }

  static async createUser(data) {
    const result = await this.getCollection().insertOne({
      ...data,
      role: data.role || 'user',
      created_at: new Date()
    });
    return { _id: result.insertedId, ...data };
  }
}

module.exports = AuthModel; 
