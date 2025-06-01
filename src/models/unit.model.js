module.exports = (sequelize, DataTypes) => {
  const Unit = sequelize.define(
    'Unit',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      propertyId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      rentAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: 'units',
    }
  );

  Unit.associate = (models) => {
    Unit.belongsTo(models.Property, { foreignKey: 'propertyId', as: 'property' });
    Unit.hasMany(models.Tenant, { foreignKey: 'unitId', as: 'tenants' });
    Unit.hasMany(models.Rent, { foreignKey: 'unitId', as: 'rents' });
    Unit.hasMany(models.Meter, { foreignKey: 'unitId', as: 'meters' });
  };

  return Unit;
};
