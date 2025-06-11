const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TenantHistory = sequelize.define(
    'TenantHistory',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false, // Primary keys must be non-nullable
        comment: 'Unique identifier for the tenant history record',
      },
      tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'tenants', // References the 'tenants' table
          key: 'id',
        },
        onDelete: 'CASCADE', // If a tenant is deleted, their history should also be deleted
        onUpdate: 'CASCADE',
        comment: 'ID of the tenant associated with this history record',
      },
      unitId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'units', // References the 'units' table
          key: 'id',
        },
        onDelete: 'CASCADE', // If a unit is deleted, its associated history records should also be deleted
        onUpdate: 'CASCADE',
        comment: 'ID of the unit the tenant occupied during this period',
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'accounts', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'ID of the account that generated this bill',
      },
      startDate: {
        type: DataTypes.DATEONLY, // Use DATEONLY if time component is not crucial for history
        allowNull: false,
        comment: "The start date of the tenant's occupancy in this unit",
      },
      endDate: {
        type: DataTypes.DATEONLY, // Use DATEONLY
        // type: DataTypes.DATE, // Revert to DATE if time component is necessary
        allowNull: true, // `null` if the tenant is currently occupying the unit
        comment: "The end date of the tenant's occupancy in this unit (null if current)",
      },
      notes: {
        type: DataTypes.TEXT, // For any additional remarks about the tenancy period
        allowNull: true,
        comment: 'Any specific notes about this period of tenancy (e.g., reason for move-out)',
      },
    },
    {
      timestamps: true, // Automatically adds `createdAt` and `updatedAt` columns
      tableName: 'tenant_histories', // Explicitly define the table name
      modelName: 'tenantHistory', // Optional: explicitly define model name
      indexes: [
        {
          // Index for faster lookups by tenant
          fields: ['tenantId'],
        },
        {
          // Index for faster lookups by unit
          fields: ['unitId'],
        },
        {
          // A composite index to ensure that a tenant doesn't have overlapping history entries for the same unit.
          // This assumes a tenant can only be in one unit at a time.
          // If a tenant can occupy multiple units simultaneously, this unique constraint might need adjustment.
          unique: true,
          fields: ['tenantId', 'unitId', 'startDate'],
          name: 'idx_unique_tenant_unit_history',
        },
        {
          // Index for queries involving date ranges
          fields: ['startDate', 'endDate'],
        },
      ],
      validate: {
        // Model-level validation to ensure endDate is not before startDate if both are present
        datesAreValid() {
          if (this.startDate && this.endDate && this.endDate < this.startDate) {
            throw new Error('End date cannot be before start date.');
          }
        },
        // Ensure that there is only one active (null endDate) record per tenant
        async onlyOneActivePeriodPerTenant() {
          if (this.endDate === null) {
            // If this is an active period
            const existingActiveHistory = await sequelize.models.TenantHistory.findOne({
              where: {
                tenantId: this.tenantId,
                endDate: null,
                // Exclude the current record if it's an update scenario
                ...(this.id && { id: { [DataTypes.Op.ne]: this.id } }),
              },
            });

            if (existingActiveHistory) {
              throw new Error('A tenant can only have one active (current) history record at a time.');
            }
          }
        },
      },
    }
  );

  TenantHistory.associate = (models) => {
    TenantHistory.belongsTo(models.Tenant, {
      foreignKey: 'tenantId',
      as: 'tenant',
    });
    TenantHistory.belongsTo(models.Unit, {
      foreignKey: 'unitId',
      as: 'unit',
    });
  };

  return TenantHistory;
};
