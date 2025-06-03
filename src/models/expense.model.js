module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define(
    'Expense',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      propertyId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      unitId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expenseDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
      tableName: 'expenses',
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
      },
    }
  );

  Expense.associate = (models) => {
    Expense.belongsTo(models.Property, { foreignKey: 'propertyId', as: 'property' });
    Expense.belongsTo(models.Unit, { foreignKey: 'unitId', as: 'unit' });
    Expense.belongsTo(models.ExpenseCategory, { foreignKey: 'categoryId', as: 'category' });
  };

  return Expense;
};
