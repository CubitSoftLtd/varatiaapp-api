/* eslint-disable prettier/prettier */
module.exports = (sequelize, DataTypes) => {
    const Beneficiary = sequelize.define(
        'Beneficiary',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
                comment: 'Unique identifier for the expense category',
            },
            accountId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: 'accounts', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                comment: 'ID of the account that generated this bill',
            },
            name: {
                type: DataTypes.STRING(100), // Specify reasonable length (e.g., "Repairs", "Utilities", "Management Fees")
                allowNull: false,
                unique: false, // Category names should be unique
                comment: 'Name of the expense category',
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
            tableName: 'beneficiary',
            modelName: 'beneficiary',
            indexes: [
                {
                    fields: ['name'],
                }
            ],
        }
    );

    Beneficiary.associate = (models) => {
        Beneficiary.hasMany(models.PersonalExpense, {
            foreignKey: 'beneficiaryId',
            as: 'personalExpense',
            onDelete: 'RESTRICT', // Prevent deletion if expenses are still linked to it
            onUpdate: 'CASCADE',
        });
    Beneficiary.belongsTo(models.Account, { foreignKey: 'accountId', as: 'account' });

    };

    return Beneficiary;
};
