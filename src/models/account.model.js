const { DataTypes } = require('sequelize');

module.exs = (sequelize) => {
  const Account = sequelize.define(
    'Account',
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
      tableName: 'accounts',
    }
  );

  Account.associate = (models) => {
    Account.hasMany(models.User, { foreignKey: 'accountId', as: 'users' });
    Account.hasMany(models.Property, { foreignKey: 'accountId', as: 'properties' });
  };

  return Account;
};
