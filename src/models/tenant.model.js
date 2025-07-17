module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define(
    'Tenant',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false, // Primary keys must be non-nullable
        comment: 'Unique identifier for the tenant',
      },
      firstName: {
        type: DataTypes.STRING(100), // Specify reasonable length
        allowNull: false,
        comment: "Tenant's first name",
      },
      lastName: {
        type: DataTypes.STRING(100), // Specify reasonable length
        allowNull: false,
        comment: "Tenant's last name",
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: "Tenant's full name",
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true, // Email should be unique for each tenant
        validate: {
          isEmail: true,
        },
        comment: "Tenant's primary email address",
      },
      phoneNumber: {
        type: DataTypes.STRING(50), // Accommodate various phone formats
        allowNull: false,
        unique: true, // Phone number should typically be unique for each tenant
        validate: {
          // A more robust regex for phone numbers might be needed depending on internationalization
          is: {
            args: /^\+?[0-9\s\-.()]{7,25}$/, // Adjusted regex for common international formats, 7-25 chars
            msg: 'Phone number must be valid (7-25 characters, digits, spaces, +, -, and parentheses allowed)',
          },
        },
        comment: "Tenant's primary phone number",
      },
      emergencyContactName: {
        // Separating name and number for clarity
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Name of the emergency contact person',
      },
      emergencyContactPhone: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          is: {
            args: /^\+?[0-9\s\-.()]{7,25}$/,
            msg: 'Emergency contact phone must be a valid phone number (7-25 characters, digits, spaces, +, -, () allowed)',
          },
        },
        comment: 'Phone number for the emergency contact',
      },
      // unitId: {
      //   type: DataTypes.UUID,
      //   allowNull: true, // Tenant might not be currently assigned to a unit (e.g., prospective tenant)
      //   references: {
      //     model: 'units', // References the 'units' table
      //     key: 'id',
      //   },
      //   onDelete: 'SET NULL', // If a unit is deleted, tenant's unitId becomes null (tenant can still exist)
      //   onUpdate: 'CASCADE',
      //   comment: 'ID of the unit the tenant is currently occupying or assigned to',
      // },
      // leaseStartDate: {
      //   type: DataTypes.DATEONLY, // Use DATEONLY if you only need the date
      //   allowNull: false,
      //   comment: "Date the tenant's lease agreement started",
      // },
      // leaseEndDate: {
      //   type: DataTypes.DATEONLY, // Use DATEONLY
      //   // type: DataTypes.DATE, // Change back to DATE if time component is needed
      //   allowNull: true, // Lease might be month-to-month or open-ended
      //   comment: "Date the tenant's lease agreement is scheduled to end (null for open-ended leases)",
      // },
      depositAmount: {
        type: DataTypes.DECIMAL(18, 2), // Increased precision for currency
        allowNull: false,
        defaultValue: 0.0,
        comment: 'The security deposit amount paid by the tenant',
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'accounts', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'ID of the account that generated this bill',
      },
      status: {
        type: DataTypes.ENUM('current', 'prospective', 'past', 'evicted', 'notice'), // More descriptive statuses
        allowNull: false,
        defaultValue: 'current',
        comment: 'Current status of the tenant in the property management system',
      },
      nationalId: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        validate: {
          notEmpty: {
            msg: 'National ID cannot be empty if provided',
          },
          is: {
            // Change 'args' to 'is' for regex validation
            args: /^[A-Za-z0-9\-/]{5,50}$/,
            msg: 'National ID must be valid (5-50 characters, alphanumeric, hyphen, slash allowed)', // Custom message for regex failure
          },
        },
        comment: 'National identification number (e.g., NID, Passport number)',
      },
      // moveInDate: {
      //   type: DataTypes.DATEONLY,
      //   allowNull: true,
      //   comment: 'Actual date the tenant moved into the unit',
      // },
      // moveOutDate: {
      //   type: DataTypes.DATEONLY,
      //   allowNull: true,
      //   comment: 'Actual date the tenant moved out of the unit',
      // },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Any additional notes about the tenant',
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
      tableName: 'tenants',
      modelName: 'tenant', // Optional: explicitly define model name
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

  Tenant.associate = (models) => {
    Tenant.belongsTo(models.Unit, { foreignKey: 'unitId', as: 'unit' });
    Tenant.hasMany(models.Bill, { foreignKey: 'tenantId', as: 'bills' });
    Tenant.hasMany(models.Payment, { foreignKey: 'tenantId', as: 'payments' });
  };

  return Tenant;
};
