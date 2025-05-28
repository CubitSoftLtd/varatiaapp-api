const { DataTypes } = require('sequelize');

module.exs = (sequelize) => {
  const UtilityType = sequelize.define(
    'UtilityType',
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
      unitRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return UtilityType;
};
