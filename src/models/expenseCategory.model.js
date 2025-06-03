module.exports = (sequelize, DataTypes) => {
  const ExpenseCategory = sequelize.define(
    'ExpenseCategory',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type: DataTypes.ENUM('utility', 'personal', 'tenant_charge'),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: 'expense_categories',
    }
  );

  ExpenseCategory.associate = (models) => {
    ExpenseCategory.hasMany(models.Expense, { foreignKey: 'categoryId', as: 'expenses' });
  };

  return ExpenseCategory;
};
