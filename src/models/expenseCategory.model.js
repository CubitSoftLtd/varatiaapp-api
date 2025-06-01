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
        type: DataTypes.ENUM('utility', 'personal'),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: 'expense_categories',
    }
  );

  ExpenseCategory.associate = (models) => {
    ExpenseCategory.hasMany(models.Expense, { foreignKey: 'expenseCategoryId', as: 'expenses' });
  };

  return ExpenseCategory;
};
