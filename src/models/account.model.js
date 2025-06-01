module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define(
    'Account',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subscriptionType: {
        type: DataTypes.ENUM('free', 'basic', 'premium'),
        defaultValue: 'free',
      },
      contactName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
      },
      contactPhone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      subscriptionExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'accounts',
    }
  );

  Account.associate = (models) => {
    Account.hasMany(models.User, { foreignKey: 'accountId', as: 'users' });
    Account.hasMany(models.Property, { foreignKey: 'accountId', as: 'properties' });
    Account.hasMany(models.Payment, { foreignKey: 'accountId', as: 'payments' });
    Account.hasMany(models.Expense, { foreignKey: 'accountId', as: 'expenses' });
  };

  return Account;
};
