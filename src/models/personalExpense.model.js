/* eslint-disable prettier/prettier */
module.exports = (sequelize, DataTypes) => {
    const PersonalExpense = sequelize.define(
        'PersonalExpense',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
                comment: 'Unique identifier for the personal Expense',
            },
            accountId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: 'accounts', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                comment: 'ID of the account that generated this bill',
            },
            beneficiary: {
                type: DataTypes.STRING(100), // Specify reasonable length (e.g., "Repairs", "Utilities", "Management Fees")
                allowNull: false,
                unique: false, // Category names should be unique
                comment: 'Name of the expense beneficiary',
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
            expenseDate: {
                type: DataTypes.DATEONLY, // Use DATEONLY if time isn't critical for expenses
                allowNull: false,
                defaultValue: DataTypes.NOW, // Default to current date
                comment: 'The date when the expense was incurred or paid',
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
            tableName: 'peersonal_expense',
            modelName: 'personalExpense',
            indexes: [
                {
                    fields: ['beneficiary'],
                },
            ],
        }
    );

PersonalExpense.associate = (models) => {
    PersonalExpense.belongsTo(models.ExpenseCategory, {
      foreignKey: 'categoryId',
      as: 'category',
    });

  };
    return PersonalExpense;
};
