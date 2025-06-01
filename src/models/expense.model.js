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
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      propertyId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      expenseType: {
        type: DataTypes.ENUM('utility', 'personal'),
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
        propertyIdRequiredForUtility() {
          if (this.expenseType === 'utility' && !this.propertyId) {
            throw new Error('Utility expenses must be associated with a property');
          }
          if (this.expenseType === 'personal' && this.propertyId) {
            throw new Error('Personal expenses should not be associated with a property');
          }
        },
        userIdRequiredForPersonal() {
          if (this.expenseType === 'personal' && !this.userId) {
            throw new Error('Personal expenses must be associated with a user');
          }
          if (this.expenseType === 'utility' && this.userId) {
            throw new Error('Utility expenses should not be associated with a user');
          }
        },
      },
    }
  );

  Expense.associate = (models) => {
    Expense.belongsTo(models.Property, { foreignKey: 'propertyId', as: 'property' });
    Expense.belongsTo(models.Unit, { foreignKey: 'unitId', as: 'unit' });
    Expense.belongsTo(models.ExpenseCategory, { foreignKey: 'expenseCategoryId', as: 'category' });
  };

  return Expense;
};
