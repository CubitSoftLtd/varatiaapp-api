module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define(
    'Account',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false, // Primary keys should always be non-nullable
        comment: 'Unique identifier for the account', // Add comments for clarity
      },
      name: {
        type: DataTypes.STRING(255), // Specify a reasonable maximum length for the string
        allowNull: false,
        unique: true, // Account names should ideally be unique
        comment: 'The name of the organization or individual account',
      },
      subscriptionType: {
        type: DataTypes.ENUM('free', 'basic', 'premium', 'enterprise'), // Added 'enterprise' as a common tier
        defaultValue: 'free',
        allowNull: false, // Subscription type should always be defined
        comment: 'The type of subscription plan for this account',
      },
      contactName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Full name of the primary contact person for this account',
      },
      contactEmail: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true, // Contact email should likely be unique across accounts
        validate: {
          isEmail: true, // Sequelize's built-in email validation
        },
        comment: 'Email address of the primary contact, used for notifications and login',
      },
      contactPhone: {
        type: DataTypes.STRING(50), // A reasonable length for phone numbers, accommodating various formats
        allowNull: true, // Phone number is optional
        comment: 'Optional phone number for the primary contact',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false, // Account status should always be defined
        comment: 'Indicates whether the account is currently active and usable',
      },
      subscriptionExpiry: {
        type: DataTypes.DATE,
        allowNull: true, // Free accounts might not have an expiry, or it's for paid plans
        comment: 'Date when the current subscription plan expires',
      },
      // Sequelize automatically adds `createdAt` and `updatedAt` if `timestamps: true` is set in options.
      // Explicitly defining them like this is redundant unless you need custom default values
      // or want to override their behavior, which is usually not the case.
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Soft delete flag',
      },
    },
    {
      tableName: 'accounts', // Explicitly define the table name
      timestamps: true, // Enable automatic `createdAt` and `updatedAt` fields
      modelName: 'account', // Explicitly define model name (optional but good practice)
      indexes: [
        {
          // Add an index for faster lookups by subscriptionType if you often filter by it
          fields: ['subscriptionType'],
        },
        {
          // Add an index for isActive for quick filtering of active/inactive accounts
          fields: ['isActive'],
        },
      ],
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
