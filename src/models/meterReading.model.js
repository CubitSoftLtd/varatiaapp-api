module.exports = (sequelize, DataTypes) => {
  const MeterReading = sequelize.define(
    'MeterReading',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'Unique identifier for the meter reading',
      },
      meterId: {
        type: DataTypes.UUID,
        allowNull: true, // Allow null as it could be a submeter reading
        references: {
          model: 'meters', // References the 'meters' table
          key: 'id',
        },
        onDelete: 'CASCADE', // If the meter is deleted, its readings are also deleted
        onUpdate: 'CASCADE',
        comment: 'ID of the associated main meter (null if it is a submeter reading)',
      },
      submeterId: {
        type: DataTypes.UUID,
        allowNull: true, // Allow null as it could be a main meter reading
        references: {
          model: 'submeters', // References the 'submeters' table
          key: 'id',
        },
        onDelete: 'CASCADE', // If the submeter is deleted, its readings are also deleted
        onUpdate: 'CASCADE',
        comment: 'ID of the associated submeter (null if it is a main meter reading)',
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'accounts', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'ID of the account that generated this bill',
      },
      readingValue: {
        type: DataTypes.DECIMAL(18, 6), // Increased precision for utility readings
        allowNull: false,
        comment: 'The actual meter reading value at the time of reading',
      },
      readingDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'The date and time when the meter reading was taken',
      },
      consumption: {
        type: DataTypes.DECIMAL(18, 6), // Increased precision
        allowNull: true, // Allow null as it might be calculated later or not available for the first reading
        comment: 'Calculated consumption since the previous reading',
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Soft delete flag',
      },
      // You might also want to add a field for the user who entered the reading
      enteredByUserId: {
        type: DataTypes.UUID,
        allowNull: true, // Allow null if readings can be automated
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL', // Don't delete readings if user is removed
        onUpdate: 'CASCADE',
        comment: 'ID of the user who entered this reading',
      },
    },
    {
      timestamps: true,
      tableName: 'meter_readings',
      modelName: 'meterReading', // Explicitly define model name (good practice)
      indexes: [
        {
          // Ensure a reading is for either a meter or a submeter, but not both, and one must be present.
          // This is often best enforced at the application/service layer due to SQL dialect variations
          // but a partial index can help for uniqueness on either field.
          // A CHECK constraint (if supported by your database) is ideal for mutual exclusivity.
          // Example for PostgreSQL (needs raw query):
          // CHECK ((meter_id IS NOT NULL AND submeter_id IS NULL) OR (meter_id IS NULL AND submeter_id IS NOT NULL))
          fields: ['meterId', 'submeterId', 'readingDate'], // Composite index for efficient querying
          unique: true, // Prevents duplicate readings for the same meter/submeter on the same date
          where: {
            // Partial index example (useful if you only expect one reading per day per meter)
            // This can vary greatly by database. For a more robust mutual exclusivity,
            // it's often better handled in the service layer before creation.
          },
        },
      ],
    }
  );

  MeterReading.associate = (models) => {
    MeterReading.belongsTo(models.Meter, {
      foreignKey: 'meterId',
      as: 'meter',
      constraints: false, // Important: Don't enforce this as a strict FK constraint if submeterId can be present
      // Instead, rely on application-level validation for mutual exclusivity.
    });
    MeterReading.belongsTo(models.Submeter, {
      foreignKey: 'submeterId',
      as: 'submeter',
      constraints: false, // Same as above
    });
    // If you added enteredByUserId:
    // MeterReading.belongsTo(models.User, { foreignKey: 'enteredByUserId', as: 'enteredByUser' });
  };

  return MeterReading;
};
