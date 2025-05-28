const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UtilityCharge = sequelize.define(
    'UtilityCharge',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      billId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      meterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      previousReading: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currentReading: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      consumption: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      chargeAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return UtilityCharge;
};
