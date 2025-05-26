const { Sequelize } = require('sequelize');
const config = require('../config/config');
const User = require('./user.model');
const Token = require('./token.model');
const Bill = require('./bill.model');
const House = require('./house.model');
const Meter = require('./meter.model');
const Payment = require('./payment.model');
const MeterReading = require('./meterReading.model');
const UtilityType = require('./utilityType.model');
const UtilityCharge = require('./utilityCharge.model');
const Expense = require('./expense.model');
const ExpenseCategory = require('./expenseCategory.model');

// Select environment configuration
const env = process.env.NODE_ENV || 'development';
const dbConfig = config.database[env];

// Initialize Sequelize with configuration
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  timezone: dbConfig.timezone,
  pool: dbConfig.pool,
  dialectOptions: dbConfig.dialectOptions,
});

// Initialize models
const models = {
  User: User(sequelize),
  Token: Token(sequelize),
  Bill: Bill(sequelize),
  House: House(sequelize),
  Meter: Meter(sequelize),
  Payment: Payment(sequelize),
  MeterReading: MeterReading(sequelize),
  UtilityType: UtilityType(sequelize),
  UtilityCharge: UtilityCharge(sequelize),
  Expense: Expense(sequelize),
  ExpenseCategory: ExpenseCategory(sequelize),
};

// Export sequelize instance and models
module.exports = { sequelize, ...models };
