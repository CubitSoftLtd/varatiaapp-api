module.exports = (sequelize, DataTypes) => {
  const Submeter = sequelize.define(
    'Submeter',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      meterId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'meters',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      unitId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'units',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      submeterNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      timestamps: true,
      tableName: 'submeters',
    }
  );

  Submeter.associate = (models) => {
    Submeter.belongsTo(models.Meter, { foreignKey: 'meterId', as: 'meter' });
    Submeter.belongsTo(models.Unit, { foreignKey: 'unitId', as: 'unit' });
  };

  return Submeter;
};
