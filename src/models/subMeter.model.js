module.exports = (sequelize, DataTypes) => {
  const Submeter = sequelize.define(
    'Submeter',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false, // Primary keys must be non-nullable
        comment: 'Unique identifier for the submeter',
      },
      meterId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'meters', // References the 'meters' table
          key: 'id',
        },
        onDelete: 'CASCADE', // If the parent meter is deleted, submeters are also deleted
        onUpdate: 'CASCADE',
        comment: 'ID of the main meter to which this submeter is connected',
      },
      propertyId: {
        type: DataTypes.UUID,
        allowNull: true, // Tenant might not be currently assigned to a unit (e.g., prospective tenant)
        references: {
          model: 'properties', // References the 'units' table
          key: 'id',
        },
        onDelete: 'SET NULL', // If a unit is deleted, lease's unitId becomes null (lease can still exist)
        onUpdate: 'CASCADE',
        comment: 'ID of the unit the lease is currently occupying or assigned to',
      },
      unitId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'units', // References the 'units' table
          key: 'id',
        },
        comment: 'ID of the unit to which this submeter is installed',
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'accounts', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'ID of the account that generated this bill',
      },
      number: {
        // Renamed from submeterNumber for consistency with main Meter model
        type: DataTypes.STRING(100), // Specify a reasonable maximum length
        allowNull: false,
        unique: true, // Unique across all submeters
        comment: 'Unique identifier or serial number for the submeter',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'retired'), // Added 'retired' for completeness
        allowNull: false,
        defaultValue: 'active',
        comment: 'Current operational status of the submeter',
      },
      installedDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Date the submeter was installed',
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
      tableName: 'submeters',
      modelName: 'submeter',
      indexes: [
        {
          // Ensure a submeter number is unique within its main meter (more common scenario)
          // If submeter numbers are unique globally, keep 'unique: true' on the 'number' field itself.
          unique: true,
          fields: ['number', 'meterId'],
          name: 'idx_unique_submeter_number_per_meter',
        },
        {
          fields: ['unitId'], // Index for faster lookups by unit
        },
      ],
    }
  );

  Submeter.associate = (models) => {
    Submeter.belongsTo(models.Meter, { foreignKey: 'meterId', as: 'meter' });
    Submeter.belongsTo(models.Unit, { foreignKey: 'unitId', as: 'unit' });
    Submeter.belongsTo(models.Property, { foreignKey: 'propertyId', as: 'property' });
  };

  return Submeter;
};
