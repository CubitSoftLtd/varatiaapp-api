/* eslint-disable prettier/prettier */
module.exports = (sequelize, DataTypes) => {
  const DueBill = sequelize.define(
    'DueBill',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'Unique identifier for the due bill',
      },

      tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'ID of the tenant who owns this due bill',
      },

      billId: {
        type: DataTypes.UUID,
        allowNull: true, // ✅ এখন null থাকতে পারবে
        references: { model: 'bills', key: 'id' },
        onDelete: 'SET NULL', // যদি বিল ডিলিট হয় তাহলে null হয়ে যাবে
        onUpdate: 'CASCADE',
        comment: 'ID of the bill that generated this due (nullable)',
      },

      dueMonth: {
        type: DataTypes.STRING(7), // Format: YYYY-MM (e.g., 2025-08)
        allowNull: false,
        comment: 'Month for which the due is applicable',
      },

      amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: 'Due amount for the bill',
      },

      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional notes or remarks for the due bill',
      },

      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'accounts', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'ID of the account associated with this due bill',
      },
    },
    {
      timestamps: true,
      tableName: 'due_bills',
      modelName: 'dueBill',
      indexes: [
        { fields: ['tenantId'] },
        { fields: ['billId'] },
        { fields: ['dueMonth'] },
      ],
    }
  );

  DueBill.associate = (models) => {
    DueBill.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
    DueBill.belongsTo(models.Bill, { foreignKey: 'billId', as: 'bill' });
  };

  return DueBill;
};
