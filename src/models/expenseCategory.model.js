module.exports = (sequelize, DataTypes) => {
  const ExpenseCategory = sequelize.define(
    'ExpenseCategory',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'Unique identifier for the expense category',
      },
      name: {
        type: DataTypes.STRING(100), // Specify reasonable length (e.g., "Repairs", "Utilities", "Management Fees")
        allowNull: false,
        unique: true, // Category names should be unique
        comment: 'Name of the expense category',
      },
      type: {
        // Renamed 'type' to 'categoryType' to avoid confusion with DataType 'type'
        type: DataTypes.ENUM('property_related', 'tenant_chargeable', 'administrative', 'personal'), // More comprehensive types
        allowNull: false,
        comment: 'The general classification of the expense category (e.g., property related, tenant chargeable)',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Optional detailed description of the expense category',
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
      tableName: 'expense_categories',
      modelName: 'expenseCategory',
      indexes: [
        {
          fields: ['name'],
        },
        {
          fields: ['type'],
        },
      ],
    }
  );

  ExpenseCategory.associate = (models) => {
    ExpenseCategory.hasMany(models.Expense, {
      foreignKey: 'categoryId',
      as: 'expenses',
      onDelete: 'RESTRICT', // Prevent deletion if expenses are still linked to it
      onUpdate: 'CASCADE',
    });
  };

  return ExpenseCategory;
};
