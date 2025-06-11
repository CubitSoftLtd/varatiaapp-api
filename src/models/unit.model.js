module.exports = (sequelize, DataTypes) => {
  const Unit = sequelize.define(
    'Unit',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'Unique identifier for the unit',
      },
      name: {
        type: DataTypes.STRING(100), // Specify a reasonable maximum length (e.g., "Apt 101", "Unit B")
        allowNull: false,
        comment: 'Name or number of the unit (e.g., "Apt 1A", "Suite 200")',
      },
      propertyId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'ID of the property to which this unit belongs',
      },
      rentAmount: {
        type: DataTypes.DECIMAL(18, 2), // Increased precision for currency
        allowNull: false,
        defaultValue: 0.0, // Default to 0 for consistency
        comment: 'The base monthly rent amount for this unit',
      },
      status: {
        type: DataTypes.ENUM('occupied', 'vacant', 'maintenance'),
        defaultValue: 'vacant',
        allowNull: false,
        comment: 'Current occupancy status of the unit',
      },
      bedroomCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Number of bedrooms in the unit',
      },
      bathroomCount: {
        type: DataTypes.DECIMAL(3, 1), // e.g., 1.5, 2.0
        allowNull: true,
        comment: 'Number of bathrooms in the unit',
      },
      squareFootage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Area of the unit in square feet/meters',
      },
    },
    {
      timestamps: true,
      tableName: 'units',
      modelName: 'unit',
      indexes: [
        {
          // Ensure unit names are unique within a property
          unique: true,
          fields: ['name', 'propertyId'],
          name: 'idx_unique_unit_name_per_property',
        },
        {
          fields: ['propertyId'], // Index for faster lookup by property
        },
      ],
    }
  );

  Unit.associate = (models) => {
    Unit.belongsTo(models.Property, {
      foreignKey: 'propertyId',
      as: 'property',
      onDelete: 'CASCADE', // If the parent property is deleted, units should also be deleted
      onUpdate: 'CASCADE',
    });
    Unit.hasMany(models.Tenant, {
      foreignKey: 'unitId',
      as: 'tenants',
      onDelete: 'SET NULL', // If a unit is deleted, tenants might remain but be unassigned
      onUpdate: 'CASCADE',
    });
    Unit.hasMany(models.Bill, {
      foreignKey: 'unitId',
      as: 'bills',
      onDelete: 'CASCADE', // If a unit is deleted, its bills should also be deleted
      onUpdate: 'CASCADE',
    });
    // This association was incorrect. Meters can be for properties or units.
    // If a meter is specifically for a unit, it belongs here. If it's a main meter, it belongs to a property.
    // Assuming 'Meter' also has a 'unitId' if it's a submeter, or propertyId if it's a main meter.
    // Given 'Submeter' exists, 'Meter' likely belongs to 'Property' directly.
    // If a main meter is truly assigned to a unit, ensure your Meter model reflects 'unitId' as well.
    // For now, assuming this was intended for `Submeter`s.
    Unit.hasMany(models.Submeter, {
      // Assuming main Meter is tied to Property, Submeter to Unit
      foreignKey: 'unitId',
      as: 'submeters',
      onDelete: 'SET NULL', // If unit is deleted, submeter can be unassigned, or CASCADE if it must be deleted
      onUpdate: 'CASCADE',
    });
    // A unit can also have expenses directly related to it
    Unit.hasMany(models.Expense, {
      foreignKey: 'unitId',
      as: 'expenses',
      onDelete: 'SET NULL', // Expenses might be kept for audit, but unitId becomes null
      onUpdate: 'CASCADE',
    });
  };

  return Unit;
};
