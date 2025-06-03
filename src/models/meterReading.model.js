module.exports = (sequelize, DataTypes) => {
  const MeterReading = sequelize.define(
    'MeterReading',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      meterId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      submeterId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      readingValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      readingDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      consumption: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: 'meter_readings',
    }
  );

  MeterReading.associate = (models) => {
    MeterReading.belongsTo(models.Meter, { foreignKey: 'meterId', as: 'meter' });
    MeterReading.belongsTo(models.Submeter, { foreignKey: 'submeterId', as: 'submeter' });
  };

  return MeterReading;
};
