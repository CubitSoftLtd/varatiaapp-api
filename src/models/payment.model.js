const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define(
    'Payment',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'Unique identifier for the payment record',
      },
      billId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'bills', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'ID of the bill to which this payment applies',
      },
      tenantId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'ID of the tenant who made this payment (optional)',
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'accounts', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'ID of the account to which this payment belongs',
      },
      amountPaid: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        validate: { min: 0.01 },
        comment: 'The amount of money paid in this transaction',
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'The date and time the payment was received or processed',
      },

      paymentMethod: {
        type: DataTypes.ENUM('cash', 'credit_card', 'bank_transfer', 'mobile_payment', 'check', 'online'),
        allowNull: false,
        comment: 'Method used for the payment (e.g., cash, card, bank transfer)',
      },
      transactionId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        comment: 'External transaction ID from payment gateway or bank',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Any additional notes about the payment',
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved'), // More descriptive statuses
        allowNull: false,
        defaultValue: 'pending',
        comment: ' status of the payment in the property management system',
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
      tableName: 'payments',
      modelName: 'payment',
      scopes: { all: { where: {} } },
      indexes: [{ fields: ['billId'] }, { fields: ['tenantId'] }, { fields: ['accountId'] }, { fields: ['paymentDate'] }],
    }
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.Bill, { foreignKey: 'billId', as: 'bill' });
    Payment.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
    Payment.belongsTo(models.Account, { foreignKey: 'accountId', as: 'account' });
  };

  return Payment;
};
