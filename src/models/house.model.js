const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const House = sequelize.define(
    'House',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rentAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return House;
};
