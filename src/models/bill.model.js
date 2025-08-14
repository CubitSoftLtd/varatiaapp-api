const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bill = sequelize.define(
    'Bill',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'Unique identifier for the bill',
      },
      invoiceNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Unique invoice number for the bill, generated per account',
      },
      tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'ID of the tenant to whom this bill is issued',
      },
      unitId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'units', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'ID of the unit for which this bill is issued',
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'accounts', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'ID of the account that generated this bill',
      },
      billingPeriodStart: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Start date of the billing period',
      },
      billingPeriodEnd: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'End date of the billing period',
      },
      rentAmount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: 'The rent amount charged for this billing period',
      },
      totalUtilityAmount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: 'Total amount charged for utilities for this billing period',
      },
      otherChargesAmount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: 'Total amount for additional charges (e.g., late fees, repairs)',
      },
      deductedAmount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: 'The amount which is deducted from tenant advance',
      },
      totalAmount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        comment: 'The calculated total amount due for this bill (sum of rent, utilities, other charges)',
      },
      amountPaid: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: 'The total amount received for this bill',
      },
      balanceDue: {
        type: DataTypes.VIRTUAL,
        get() {
          return parseFloat(this.getDataValue('totalAmount')) - parseFloat(this.getDataValue('amountPaid'));
        },
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'The date by which the bill is due',
      },
      issueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'The date the bill was issued',
      },
      paymentStatus: {
        type: DataTypes.ENUM('unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled'),
        defaultValue: 'unpaid',
        allowNull: false,
        comment: 'Current payment status of the bill',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Any additional notes or remarks about the bill',
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
      tableName: 'bills',
      modelName: 'bill',
      scopes: {
        all: { where: {} },
      },
      indexes: [
        { fields: ['tenantId'] },
        { fields: ['unitId'] },
        { fields: ['accountId'] },
        { fields: ['dueDate'] },
        { fields: ['paymentStatus'] },
        {
          fields: ['accountId', 'issueDate', 'invoiceNo'],
          name: 'bill_accountId_issueDate_invoiceNo_idx',
        },
        {
          unique: true,
          fields: ['tenantId', 'unitId', 'billingPeriodStart', 'billingPeriodEnd'],
          name: 'unique_bill_per_period',
          comment: 'Ensures that there is only one bill per tenant and unit for a specific billing period',
        },
      ],
    }
  );

  Bill.associate = (models) => {
    Bill.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
    Bill.belongsTo(models.Unit, { foreignKey: 'unitId', as: 'unit' });
    Bill.belongsTo(models.Account, { foreignKey: 'accountId', as: 'account' });
    Bill.hasMany(models.Payment, { foreignKey: 'billId', as: 'payments', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    Bill.hasMany(models.Expense, { foreignKey: 'billId', as: 'expenses', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
  };

  return Bill;
};
