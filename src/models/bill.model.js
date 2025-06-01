module.exports = (sequelize, DataTypes) => {
  const Bill = sequelize.define(
    'Bill',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
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
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
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
  };
  return Bill;
};
