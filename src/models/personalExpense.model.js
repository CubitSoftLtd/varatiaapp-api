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
            beneficiaryId: {
                type: DataTypes.UUID,
                allowNull: true, // Tenant might not be currently assigned to a unit (e.g., prospective tenant)
                references: {
                    model: 'beneficiary', // References the 'units' table
                    key: 'id',
                },
                onDelete: 'SET NULL', // If a unit is deleted, lease's unitId becomes null (lease can still exist)
                onUpdate: 'CASCADE',
                comment: 'ID of the beneficiary the lease is currently occupying or assigned to',
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
                    fields: ['expenseDate'],
                },
            ],
        }
    );

    PersonalExpense.associate = (models) => {
        PersonalExpense.belongsTo(models.ExpenseCategory, {
            foreignKey: 'categoryId',
            as: 'category',
        });
        PersonalExpense.belongsTo(models.Beneficiary, {
            foreignKey: 'beneficiaryId',
            as: 'beneficiary',
        });

    };
    return PersonalExpense;
};
