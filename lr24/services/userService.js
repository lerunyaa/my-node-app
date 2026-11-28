const User = require('../models/user');

class UserService {
  async createUser(data) {
    const existingUser = await User.getCollection().findOne({ email: data.email });
    if (existingUser) {
      const error = new Error('Email already exists');
      error.status = 409;
      throw error;
    }
    console.log(`[SERVICE] Создание пользователя: ${data.email}`);
    const user = await User.create(data);
    console.log(`[SERVICE] Email отправлен: ${data.email}`);
    return user;
  }

  async getAllUsers(query) {
    return await User.findAll(query);
  }

  async getUserById(id) {
    return await User.findById(id);
  }
}

module.exports = new UserService();