module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define(
    'Expense',
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
        allowNull: true, // Can be null for account-level or personal expenses
        references: {
          model: 'properties',
          key: 'id',
        },
        onDelete: 'SET NULL', // If property is deleted, expense remains but propertyId becomes null
        onUpdate: 'CASCADE',
        comment: 'ID of the property associated with this expense (optional)',
      },
      unitId: {
        type: DataTypes.UUID,
        allowNull: true, // Can be null for property-level or account-level expenses
        references: {
          model: 'units',
          key: 'id',
        },
        onDelete: 'SET NULL', // If unit is deleted, expense remains but unitId becomes null
        onUpdate: 'CASCADE',
        comment: 'ID of the unit associated with this expense (optional)',
      },
      billId: {
        type: DataTypes.UUID,
        allowNull: true, // Only applicable if this expense is part of a bill charged to a tenant
        references: {
          model: 'bills',
          key: 'id',
        },
        onDelete: 'SET NULL', // If bill is deleted, expense remains but billId becomes null
        onUpdate: 'CASCADE',
        comment: 'ID of the bill if this expense is charged to a tenant (optional)',
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'expense_categories', // References the 'expense_categories' table
          key: 'id',
        },
        onDelete: 'RESTRICT', // Prevent deletion if expenses are still linked to it
        onUpdate: 'CASCADE',
        comment: 'ID of the expense category',
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
      tableName: 'expenses',
      modelName: 'expense',
      indexes: [
        {
          fields: ['accountId'],
        },
        {
          fields: ['propertyId'],
        },
        {
          fields: ['unitId'],
        },
        {
          fields: ['categoryId'],
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
          if (this.expenseType === 'personal' && this.propertyId) {
            throw new Error('Personal expenses should not be associated with a property');
          }
          if (this.expenseType === 'tenant_charge' && !this.propertyId) {
            throw new Error('Tenant charges must be associated with a property');
          }
        },
        accountIdRules() {
          if (this.expenseType === 'personal' && !this.accountId) {
            throw new Error('Personal expenses must be associated with a user');
          }
          if ((this.expenseType === 'utility' || this.expenseType === 'tenant_charge') && this.accountId) {
            throw new Error('Utility or tenant charge expenses should not be associated with a user');
          }
        },
        unitIdRules() {
          if (this.expenseType === 'tenant_charge' && !this.unitId) {
            throw new Error('Tenant charges must be associated with a unit');
          }
          if (this.expenseType === 'personal' && this.unitId) {
            throw new Error('Personal expenses should not be associated with a unit');
          }
        },
        billIdRules() {
          if (this.expenseType === 'tenant_charge' && !this.billId) {
            throw new Error('Tenant charge expenses must be associated with a bill');
          }
          if (this.expenseType === 'personal' && this.billId) {
            throw new Error('Personal expenses should not be associated with a bill');
          }
          if (this.expenseType === 'utility' && this.billId) {
            throw new Error('Utility expenses should not be associated with a bill');
          }
        },
      },
    }
  );

  Expense.associate = (models) => {
    Expense.belongsTo(models.Account, {
      foreignKey: 'accountId',
      as: 'account',
    });
    Expense.belongsTo(models.Property, {
      foreignKey: 'propertyId',
      as: 'property',
    });
    Expense.belongsTo(models.Unit, {
      foreignKey: 'unitId',
      as: 'unit',
    });
    Expense.belongsTo(models.ExpenseCategory, {
      foreignKey: 'categoryId',
      as: 'category',
    });
    Expense.belongsTo(models.Bill, {
      foreignKey: 'billId',
      as: 'bill',
    });
  };

  return Expense;
};
