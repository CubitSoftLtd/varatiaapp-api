module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    'Payment',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      billId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'bills',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      amountPaid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      paymentMethod: {
        type: DataTypes.ENUM('cash', 'credit_card', 'bank_transfer', 'mobile_payment', 'check'),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: 'rent_payments',
    }
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.Bill, { foreignKey: 'billId', as: 'bill' });
  };

  return Payment;
};
