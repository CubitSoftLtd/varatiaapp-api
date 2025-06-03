module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define(
    'Tenant',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: {
            args: /^\+?[0-9\s\-()]{10,20}$/,
            msg: 'Phone number must be valid and contain 10 to 20 characters (digits, spaces, +, -, and parentheses allowed)',
          },
        },
      },
      emergencyContact: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: {
            args: /^\+?[0-9\s\-()]{10,20}$/,
            msg: 'Emergency contact must be a valid phone number (10-20 characters, digits, spaces, +, -, () allowed)',
          },
        },
      },
      unitId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'units',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      leaseStartDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      leaseEndDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      depositAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'evicted'),
        allowNull: false,
        defaultValue: 'active',
      },
      nationalId: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          is: /^[A-Za-z0-9\-/]{5,20}$/,
        },
      },
    },
    {
      timestamps: true,
      tableName: 'tenants',
    }
  );

  Tenant.associate = (models) => {
    Tenant.belongsTo(models.Unit, { foreignKey: 'unitId', as: 'unit' });
    Tenant.hasMany(models.Bill, { foreignKey: 'tenantId', as: 'bills' });
    Tenant.hasMany(models.Payment, { foreignKey: 'tenantId', as: 'payments' });
  };

  return Tenant;
};
