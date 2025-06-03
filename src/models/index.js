const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config');

// Import model definitions
const User = require('./user.model');
const Token = require('./token.model');
const Account = require('./account.model');
const Bill = require('./bill.model');
const Tenant = require('./tenant.model');
const Property = require('./property.model');
const Unit = require('./unit.model');
const Meter = require('./meter.model');
const Submeter = require('./subMeter.model');
const Payment = require('./payment.model');
const MeterReading = require('./meterReading.model');
const UtilityType = require('./utilityType.model');
const Expense = require('./expense.model');
const ExpenseCategory = require('./expenseCategory.model');
const TenancyHistory = require('./tenancyHistory.model');
const Document = require('./document.model');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config.database[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  timezone: dbConfig.timezone,
  port: dbConfig.port,
  pool: dbConfig.pool,
  dialectOptions: dbConfig.dialectOptions,
});

// Initialize models
const models = {
  Account: Account(sequelize, DataTypes),
  User: User(sequelize, DataTypes),
  Token: Token(sequelize, DataTypes),
  Tenant: Tenant(sequelize, DataTypes),
  TenancyHistory: TenancyHistory(sequelize, DataTypes),
  Meter: Meter(sequelize, DataTypes),
  Submeter: Submeter(sequelize, DataTypes), // fixed casing here
  Unit: Unit(sequelize, DataTypes),
  Property: Property(sequelize, DataTypes),
  MeterReading: MeterReading(sequelize, DataTypes),
  UtilityType: UtilityType(sequelize, DataTypes),
  ExpenseCategory: ExpenseCategory(sequelize, DataTypes),
  Expense: Expense(sequelize, DataTypes),
  Bill: Bill(sequelize, DataTypes),
  Payment: Payment(sequelize, DataTypes),
  Document: Document(sequelize, DataTypes),
};

// Associate models
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  ...models,
};
