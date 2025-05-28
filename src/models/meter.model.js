const { DataTypes } = require('sequelize');

module.exs = (sequelize) => {
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
