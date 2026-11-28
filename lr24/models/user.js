const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

class User {
  static getCollection() {
    return getDB().collection('users');
  }

  static async findAll(query = {}) {
    try {
      // Базовый фильтр
      let filter = {};
      if (query.group_name) filter.group_name = query.group_name;
      if (query.course) filter.course = parseInt(query.course);
      
      // Пагинация
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const skip = (page - 1) * limit;

      // Сортировка
      let sort = {};
      if (query.sort) {
        if (query.sort.startsWith('-')) sort[query.sort.substring(1)] = -1;
        else sort[query.sort] = 1;
      }

      // Поиск (по имени или email)
      if (query.search) {
        filter.$or = [
          { name: { $regex: query.search, $options: 'i' } },
          { email: { $regex: query.search, $options: 'i' } }
        ];
      }

      const total = await this.getCollection().countDocuments(filter);
      const data = await this.getCollection()
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

      return { data, total, page, limit, pages: Math.ceil(total / limit) };
    } catch (e) {
      console.error("Ошибка в findAll:", e);
      return { data: [], total: 0, page: 1, limit: 10, pages: 0 };
    }
  }

  static async findById(id) {
    try {
      return await this.getCollection().findOne({ _id: new ObjectId(id) });
    } catch (e) {
      return null;
    }
  }

  static async create(data) {
    const result = await this.getCollection().insertOne({ ...data, created_at: new Date() });
    return { _id: result.insertedId, ...data };
  }
}

module.exports = User;