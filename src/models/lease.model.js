module.exports = (sequelize, DataTypes) => {
  const Lease = sequelize.define(
    'Lease',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false, // Primary keys must be non-nullable
        comment: 'Unique identifier for the lease',
      },

      unitId: {
        type: DataTypes.UUID,
        allowNull: true, // Tenant might not be currently assigned to a unit (e.g., prospective tenant)
        references: {
          model: 'units', // References the 'units' table
          key: 'id',
        },
        onDelete: 'SET NULL', // If a unit is deleted, lease's unitId becomes null (lease can still exist)
        onUpdate: 'CASCADE',
        comment: 'ID of the unit the lease is currently occupying or assigned to',
      },
      tenantId: {
        type: DataTypes.UUID,
        allowNull: true, // Tenant might not be currently assigned to a unit (e.g., prospective tenant)
        references: {
          model: 'tenants', // References the 'tenants' table
          key: 'id',
        },
        onDelete: 'SET NULL', // If a unit is deleted, tenant's unitId becomes null (tenant can still exist)
        onUpdate: 'CASCADE',
        comment: 'ID of the tenant is currently occupying or assigned to',
      },
      leaseStartDate: {
        type: DataTypes.DATEONLY, // Use DATEONLY if you only need the date
        allowNull: false,
        comment: "Date the tenant's lease agreement started",
      },
      leaseEndDate: {
        type: DataTypes.DATEONLY, // Use DATEONLY
        // type: DataTypes.DATE, // Change back to DATE if time component is needed
        allowNull: true, // Lease might be month-to-month or open-ended
        comment: "Date the tenant's lease agreement is scheduled to end (null for open-ended leases)",
      },

      moveInDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Actual date the tenant moved into the unit',
      },
      moveOutDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Actual date the tenant moved out of the unit',
      },
      startedMeterReading: {
        type: DataTypes.DECIMAL(18, 6), // Increased precision for utility readings
        allowNull: false,
        comment: 'The actual meter reading value at the time of lease start',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Any additional notes about the lease',
      },
      status: {
        type: DataTypes.ENUM('active', 'terminated'), // More descriptive statuses
        allowNull: false,
        defaultValue: 'active',
        comment: 'Current status of the lease in the property management system',
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'accounts', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'ID of the account that generated this bill',
      },
    },
    {
      timestamps: true,
      tableName: 'leases',
      modelName: 'lease', // Optional: explicitly define model name
      indexes: [
        {
          fields: ['unitId'], // Index for faster lookups by unit
        },
        {
          fields: ['leaseStartDate', 'leaseEndDate'], // Index for date range queries
        },
        {
          fields: ['status'], // Index for filtering by status
        },
      ],
    }
  );

  Lease.associate = (models) => {
    Lease.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
    Lease.belongsTo(models.Unit, { foreignKey: 'unitId', as: 'unit' });
  };

  return Lease;
};
