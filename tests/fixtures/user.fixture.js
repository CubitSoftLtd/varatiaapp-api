const bcrypt = require('bcryptjs');
const User = require('../../src/models/user.model');

const password = 'password1';
const hashedPassword = bcrypt.hashSync(password, 8); // Synchronized hashing with user.model.js salt rounds

const userOne = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  password,
  role: 'user',
  isEmailVerified: false,
};

const userTwo = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  password,
  role: 'user',
  isEmailVerified: false,
};

const admin = {
  name: 'Admin User',
  email: 'admin@example.com',
  password,
  role: 'admin',
  isEmailVerified: false,
};

const insertUsers = async (users) => {
  // Hash passwords for each user before insertion
  const usersWithHashedPasswords = await Promise.all(
    users.map(async (user) => {
      return { ...user, password: hashedPassword };
    })
  );
  return User.bulkCreate(usersWithHashedPasswords);
};

module.exports = {
  userOne,
  userTwo,
  admin,
  insertUsers,
};
