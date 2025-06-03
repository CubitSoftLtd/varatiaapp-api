module.exports = (sequelize, DataTypes) => {
  const Bill = sequelize.define(
    'Bill',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      unitId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'units', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      billingPeriod: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rentAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      totalUtilityAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      otherChargesAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      paymentStatus: {
        type: DataTypes.ENUM('unpaid', 'partially_paid', 'paid', 'overdue'),
        defaultValue: 'unpaid',
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: 'bills',
    }
  );

  Bill.associate = (models) => {
    Bill.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
    Bill.belongsTo(models.Unit, { foreignKey: 'unitId', as: 'unit' });
    Bill.hasMany(models.Payment, { foreignKey: 'billId', as: 'payment' });
  };

  Bill.beforeCreate(async (bill) => {
    // eslint-disable-next-line no-param-reassign
    bill.totalAmount =
      parseFloat(bill.rentAmount || 0) + parseFloat(bill.totalUtilityAmount || 0) + parseFloat(bill.otherChargesAmount || 0);
  });
  Bill.beforeUpdate(async (bill) => {
    // eslint-disable-next-line no-param-reassign
    bill.totalAmount =
      parseFloat(bill.rentAmount || 0) + parseFloat(bill.totalUtilityAmount || 0) + parseFloat(bill.otherChargesAmount || 0);
  });

  return Bill;
};
