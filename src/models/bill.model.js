const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bill = sequelize.define(
    'Bill',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      billingPeriod: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rentAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      totalUtilityAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return Bill;
};
