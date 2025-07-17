module.exports = (sequelize, DataTypes) => {
  const MeterCharge = sequelize.define(
    'MeterCharge',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'Unique identifier for the expense record',
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'accounts',
          key: 'id',
        },
        onDelete: 'CASCADE', // If the account is deleted, its expenses are also deleted
        onUpdate: 'CASCADE',
        comment: 'ID of the account that incurred this expense',
      },
      propertyId: {
        type: DataTypes.UUID,
        allowNull: false, // Can be null for account-level or personal expenses
        references: {
          model: 'properties',
          key: 'id',
        },
        onDelete: 'CASCADE', // If property is deleted, expense remains but propertyId becomes null
        onUpdate: 'CASCADE',
        comment: 'ID of the property associated with this expense (optional)',
      },
      meterId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'meters', // References the 'meters' table
          key: 'id',
        },
        onDelete: 'CASCADE', // If the parent meter is deleted, submeters are also deleted
        onUpdate: 'CASCADE',
        comment: 'ID of the main meter to which this submeter is connected',
      },

      //   categoryId: {
      //     type: DataTypes.UUID,
      //     allowNull: false,
      //     references: {
      //       model: 'expense_categories', // References the 'expense_categories' table
      //       key: 'id',
      //     },
      //     onDelete: 'RESTRICT', // Prevent deletion if expenses are still linked to it
      //     onUpdate: 'CASCADE',
      //     comment: 'ID of the expense category',
      //   },
      category: {
        type: DataTypes.STRING(1000), // Allow for a longer description
        allowNull: true,
        comment: 'category of the expense',
      },
      amount: {
        type: DataTypes.DECIMAL(18, 2), // Increased precision for currency
        allowNull: false,
        validate: {
          min: 0.01, // Expense amount must be positive
        },
        comment: 'The monetary amount of the expense',
      },
      description: {
        type: DataTypes.STRING(1000), // Allow for a longer description
        allowNull: true,
        comment: 'Detailed description of the expense',
      },
      expenseDate: {
        type: DataTypes.DATEONLY, // Use DATEONLY if time isn't critical for expenses
        allowNull: false,
        defaultValue: DataTypes.NOW, // Default to current date
        comment: 'The date when the expense was incurred or paid',
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Soft delete flag',
      },
    },
    {
      timestamps: true,
      tableName: 'meterCharges',
      modelName: 'meterCharge',
      indexes: [
        {
          fields: ['accountId'],
        },
        {
          fields: ['propertyId'],
        },
        {
          fields: ['meterId'],
        },
        {
          fields: ['expenseDate'],
        },
      ],
      validate: {
        propertyIdRules() {
          if (this.expenseType === 'utility' && !this.propertyId) {
            throw new Error('Utility expenses must be associated with a property');
          }
        },
        meterIdRules() {
          if (this.expenseType === 'utility' && !this.meterId) {
            throw new Error('Utility expenses must be associated with a Meter');
          }
        },
        accountIdRules() {
          if (this.expenseType === 'utility' && this.accountId) {
            throw new Error('Utility or tenant charge expenses should not be associated with a user');
          }
        },
      },
    }
  );

  MeterCharge.associate = (models) => {
    MeterCharge.belongsTo(models.Account, {
      foreignKey: 'accountId',
      as: 'account',
    });
    MeterCharge.belongsTo(models.Property, {
      foreignKey: 'propertyId',
      as: 'property',
    });
    MeterCharge.belongsTo(models.Meter, { foreignKey: 'meterId', as: 'meter' });
  };

  return MeterCharge;
};
