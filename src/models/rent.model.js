module.exports = (sequelize, DataTypes) => {
  const Rent = sequelize.define(
    'Rent',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      baseAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      utilityAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      paymentStatus: {
        type: DataTypes.ENUM('unpaid', 'paid', 'overdue'),
        defaultValue: 'unpaid',
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: 'rents',
    }
  );

  // Hook to ensure totalAmount is the sum of baseAmount and utilityAmount
  Rent.beforeCreate(async (rent) => {
    // eslint-disable-next-line no-param-reassign
    rent.totalAmount = (rent.baseAmount || 0) + (rent.utilityAmount || 0);
  });
  Rent.beforeUpdate(async (rent) => {
    // eslint-disable-next-line no-param-reassign
    rent.totalAmount = (rent.baseAmount || 0) + (rent.utilityAmount || 0);
  });

  Rent.associate = (models) => {
    Rent.belongsTo(models.Tenant, { foreignKey: 'tenantId', as: 'tenant' });
    Rent.belongsTo(models.Unit, { foreignKey: 'unitId', as: 'unit' });
    Rent.hasMany(models.RentSlip, { foreignKey: 'rentId', as: 'rentSlips' });
  };

  return Rent;
};
