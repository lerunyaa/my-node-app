const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class StudentDAO {
  getCollection() {
    return getDB().collection('students');
  }

  async create(data) {
    const result = await this.getCollection().insertOne({
      ...data,
      created_at: new Date()
    });
    return { _id: result.insertedId, ...data };
  }

  async findAll(limit = 10, offset = 0) {
    const collection = this.getCollection();
    const total = await collection.countDocuments();
    const data = await collection.find({}).skip(offset).limit(limit).toArray();
    return { data, pagination: { total, limit, offset } };
  }

  async findById(id) {
    return await this.getCollection().findOne({ _id: new ObjectId(id) });
  }

  async getStats() {
    const stats = await this.getCollection().aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgGrade: { $avg: "$grade" }
        }
      }
    ]).toArray();
    
    const byGroup = await this.getCollection().aggregate([
      { $group: { _id: "$group_name", count: { $sum: 1 } } }
    ]).toArray();

    return {
      total: stats[0]?.total || 0,
      avgGrade: stats[0]?.avgGrade ? stats[0].avgGrade.toFixed(2) : 0,
      byGroup: byGroup.reduce((acc, g) => ({ ...acc, [g._id]: g.count }), {})
    };
  }
}

module.exports = new StudentDAO(); 
