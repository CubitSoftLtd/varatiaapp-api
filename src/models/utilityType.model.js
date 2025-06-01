module.exports = (sequelize, DataTypes) => {
  const UtilityType = sequelize.define(
    'UtilityType',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      unitRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      unitOfMeasurement: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'unit',
      },
    },
    {
      timestamps: true,
      tableName: 'utility_types',
    }
  );

  UtilityType.associate = (models) => {
    UtilityType.hasMany(models.Meter, {
      foreignKey: 'utilityTypeId',
      as: 'meters',
    });
  };

  return UtilityType;
};
