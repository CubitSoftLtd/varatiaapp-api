module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    'Payment',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      rentSlipId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      method: {
        type: DataTypes.ENUM('cash', 'bank_transfer', 'online'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('completed', 'pending', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
    },
    {
      timestamps: true,
      tableName: 'payments',
    }
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.RentSlip, { foreignKey: 'rentSlipId', as: 'rentSlip' });
    Payment.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
  };

  return Payment;
};
