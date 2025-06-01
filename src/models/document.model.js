module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define(
    'Document',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      documentUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: true,
        },
      },
      documentType: {
        type: DataTypes.ENUM('image', 'pdf', 'other'),
        allowNull: false,
        defaultValue: 'image',
      },
      entityType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      entityId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: 'documents',
    }
  );
  return Document;
};
