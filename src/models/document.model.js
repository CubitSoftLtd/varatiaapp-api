const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define(
    'Document',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false, // Primary keys must be non-nullable
        comment: 'Unique identifier for the document record',
      },
      documentUrl: {
        type: DataTypes.STRING(2048), // URLs can be very long; 2048 is a common safe limit
        allowNull: false,
        validate: {
          isUrl: {
            msg: 'Invalid document URL format.',
          },
        },
        comment: 'URL or path where the document is stored (e.g., S3 URL, local path)',
      },
      documentName: {
        // Added for user-friendly display or identification
        type: DataTypes.STRING(255),
        allowNull: true, // Can be derived from URL or manually set
        comment: 'User-friendly name of the document file',
      },
      documentType: {
        type: DataTypes.ENUM('image', 'pdf', 'lease_agreement', 'repair_photo', 'other'), // Expanded types
        allowNull: false,
        defaultValue: 'other', // Changed default to 'other' as 'image' might not always be the case
        comment: 'Classification of the document type (e.g., image, PDF, lease agreement)',
      },
      entityType: {
        type: DataTypes.ENUM('Property', 'Unit', 'Tenant', 'Expense', 'Bill', 'User'), // Specific entity types
        allowNull: false,
        comment: 'The type of entity this document is associated with (e.g., "Property", "Tenant")',
      },
      entityId: {
        type: DataTypes.UUID,
        allowNull: false,
        // No direct foreign key constraint here because it's a polymorphic association.
        // Validation for entityId existence (matching entityType) should be handled
        // in application logic (services/controllers) or custom model hooks if necessary.
        comment: 'ID of the specific entity (e.g., Property ID, Tenant ID) this document belongs to',
      },
      description: {
        type: DataTypes.STRING(500), // Allow for a longer description
        allowNull: true,
        comment: 'Brief description or notes about the document',
      },
      uploadedByUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        comment: 'ID of the user who uploaded this document (optional)',
      },
    },
    {
      timestamps: true,
      tableName: 'documents',
      modelName: 'document',
      indexes: [
        {
          fields: ['entityType', 'entityId'], // Crucial for polymorphic lookups
        },
        {
          fields: ['documentType'],
        },
        {
          fields: ['uploadedByUserId'],
        },
      ],
    }
  );

  return Document;
};
