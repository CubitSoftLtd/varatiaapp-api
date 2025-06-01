module.exports = (sequelize, DataTypes) => {
  const RentSlip = sequelize.define(
    'RentSlip',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      rentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      amountPaid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: 'rentslips',
    }
  );
  RentSlip.associate = (models) => {
    RentSlip.belongsTo(models.Rent, { foreignKey: 'rentId', as: 'rent' });
    RentSlip.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
  };

  return RentSlip;
};
