const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Meter = sequelize.define(
    'Meter',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      houseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      utilityTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return Meter;
};
