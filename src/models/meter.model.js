module.exports = (sequelize, DataTypes) => {
  const Meter = sequelize.define(
    'Meter',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      utilityTypeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'utility_types',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      timestamps: true,
      tableName: 'meters',
    }
  );

  Meter.associate = (models) => {
    Meter.belongsTo(models.UtilityType, {
      foreignKey: 'utilityTypeId',
      as: 'utilityType',
    });
    Meter.hasMany(models.Submeter, {
      foreignKey: 'meterId',
      as: 'submeters',
    });
  };

  return Meter;
};
