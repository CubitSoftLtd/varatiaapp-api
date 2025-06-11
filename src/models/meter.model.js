module.exports = (sequelize, DataTypes) => {
  const Meter = sequelize.define(
    'Meter',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false, // Primary keys should always be non-nullable
        comment: 'Unique identifier for the meter', // Add comments for clarity
      },
      number: {
        type: DataTypes.STRING(100), // Specify a reasonable length for the string
        allowNull: false,
        unique: true,
        comment: 'Unique identifier or serial number of the physical meter',
      },
      propertyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'properties', // References the 'properties' table name
          key: 'id',
        },
        onDelete: 'CASCADE', // If the associated property is deleted, delete this meter
        onUpdate: 'CASCADE',
        comment: 'ID of the property to which this meter is assigned',
      },
      utilityTypeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'utility_types', // References the 'utility_types' table name
          key: 'id',
        },
        // Changed to RESTRICT: It's generally safer to prevent deletion of a utility type
        // if meters are still referencing it. Consider 'SET NULL' if you want to allow it
        // and handle meters with missing utility types.
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: 'ID of the utility type (e.g., electricity, water, gas) this meter measures',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'retired'), // Added 'retired' as a common lifecycle status
        allowNull: false,
        defaultValue: 'active',
        comment: 'Current operational status of the meter',
      },
      // You might consider adding other fields like:
      installedDate: {
        type: DataTypes.DATEONLY, // Just date, no time
        allowNull: true,
        comment: 'The date the meter was installed',
      },
      lastReadingDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date of the last recorded reading for this meter (could be redundant if using associations)',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Optional detailed description of the meter',
      },
    },
    {
      timestamps: true,
      tableName: 'meters',
      modelName: 'meter', // Explicitly define model name (optional but good practice)
      indexes: [
        {
          // Example: Add an index for faster lookups by property and utility type
          fields: ['propertyId', 'utilityTypeId'],
        },
        // If 'number' needs to be unique per property, you'd make a composite unique index:
        {
          unique: true,
          fields: ['number', 'propertyId'],
          name: 'idx_unique_meter_number_per_property',
        },
      ],
    }
  );

  // Associations
  Meter.associate = (models) => {
    Meter.belongsTo(models.Property, {
      foreignKey: 'propertyId',
      as: 'property', // Alias used for eager loading (e.g., `include: 'property'`)
    });
    Meter.belongsTo(models.UtilityType, {
      foreignKey: 'utilityTypeId',
      as: 'utilityType',
    });
    // A meter can have many submeters (one-to-many relationship)
    Meter.hasMany(models.Submeter, {
      foreignKey: 'meterId',
      as: 'submeters',
      onDelete: 'CASCADE', // If a main meter is deleted, its submeters should also be deleted
      onUpdate: 'CASCADE',
    });
    // A meter can have many readings
    Meter.hasMany(models.MeterReading, {
      foreignKey: 'meterId',
      as: 'readings',
      onDelete: 'CASCADE', // If a meter is deleted, its readings should also be deleted
      onUpdate: 'CASCADE',
    });
  };

  return Meter;
};
