module.exports = (sequelize, DataTypes) => {
  const Property = sequelize.define(
    'Property',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false, // Primary keys must be non-nullable
        comment: 'Unique identifier for the property',
      },
      name: {
        type: DataTypes.STRING(255), // Specify a reasonable maximum length
        allowNull: false,
        comment: 'The name of the property (e.g., "Main Street Apartments", "123 Oak Ave")',
      },
      address: {
        type: DataTypes.STRING(500), // Allow for longer addresses
        allowNull: false,
        comment: 'Full physical address of the property',
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'accounts', // Reference the 'accounts' table
          key: 'id',
        },
        onDelete: 'CASCADE', // If an account is deleted, its properties should also be deleted
        onUpdate: 'CASCADE',
        comment: 'ID of the account to which this property belongs',
      },
      type: {
        type: DataTypes.ENUM('residential', 'commercial', 'mixed-use'),
        allowNull: true,
        comment: 'Type of property (e.g., residential, commercial)',
      },
      yearBuilt: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Year the property was built',
      },
      totalUnits: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Total number of units in the property',
      },
    },
    {
      timestamps: true,
      tableName: 'properties',
      modelName: 'property',
      indexes: [
        {
          // Ensure that a property name is unique within an account
          unique: true,
          fields: ['name', 'accountId'],
          name: 'idx_unique_property_name_per_account',
        },
        {
          // Index for faster lookup by account
          fields: ['accountId'],
        },
      ],
    }
  );

  Property.associate = (models) => {
    Property.hasMany(models.Unit, { foreignKey: 'propertyId', as: 'units' });
    Property.hasMany(models.Expense, { foreignKey: 'propertyId', as: 'expenses' });
    Property.belongsTo(models.Unit, { foreignKey: 'accountId', as: 'account' });
  };

  return Property;
};
