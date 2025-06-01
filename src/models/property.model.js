module.exports = (sequelize, DataTypes) => {
  const Property = sequelize.define(
    'Property',
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
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: 'properties',
    }
  );

  Property.associate = (models) => {
    Property.hasMany(models.Unit, { foreignKey: 'propertyId', as: 'units' });
    Property.hasMany(models.Expense, { foreignKey: 'propertyId', as: 'expenses' });
  };

  return Property;
};
