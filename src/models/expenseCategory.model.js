const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ExpenseCategory = sequelize.define(
    'ExpenseCategory',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return ExpenseCategory;
};
