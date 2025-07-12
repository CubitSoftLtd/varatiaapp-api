module.exports = (sequelize, DataTypes) => {
  const UtilityType = sequelize.define(
    'UtilityType',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'Unique identifier for the utility type',
      },
      name: {
        type: DataTypes.STRING(100), // Specify reasonable length (e.g., "Electricity", "Water", "Gas")
        allowNull: false,
        comment: 'Name of the utility type (e.g., Electricity, Water, Gas)',
      },
      unitRate: {
        type: DataTypes.DECIMAL(18, 6), // Increased precision for rates (e.g., $0.123456 per kWh)
        allowNull: false,
        defaultValue: 0.0, // Default to 0 for consistency
        comment: 'Default rate per unit of measurement for this utility type',
      },
      unitOfMeasurement: {
        type: DataTypes.STRING(50), // e.g., "kWh", "cubic meters", "gallons"
        allowNull: false,
        defaultValue: 'unit',
        comment: 'The standard unit of measurement for this utility type (e.g., kWh, m³)',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Detailed description of the utility type',
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'accounts', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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
      tableName: 'utility_types',
      modelName: 'utilityType',
      indexes: [
        {
          unique: true,
          fields: ['name', 'accountId'],
        },
        { fields: ['accountId'] },
      ],
    }
  );

  UtilityType.associate = (models) => {
    UtilityType.hasMany(models.Meter, {
      foreignKey: 'utilityTypeId',
      as: 'meters',
      // onDelete: 'RESTRICT' is usually good here as discussed in Meter model
      // If a UtilityType is deleted, it should prevent deletion if meters reference it
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    UtilityType.belongsTo(models.Account, { foreignKey: 'accountId', as: 'account' });
  };

  return UtilityType;
};
