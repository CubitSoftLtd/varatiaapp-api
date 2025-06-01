module.exports = (sequelize, DataTypes) => {
  const TenantHistory = sequelize.define(
    'TenantHistory',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      unitId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: 'tenant_histories',
    }
  );

  TenantHistory.associate = (models) => {
    TenantHistory.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
  };

  return TenantHistory;
};
