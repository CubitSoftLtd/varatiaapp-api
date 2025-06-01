const { Op } = require('sequelize');

const tokenTypes = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'reset_password',
};

module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define(
    'Token',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Unique identifier for the token',
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 1000], // Adjust length based on token requirements (e.g., JWT length)
        },
        comment: 'The token string (e.g., JWT or other token format)',
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'Foreign key referencing the associated user',
      },
      type: {
        type: DataTypes.ENUM(...Object.values(tokenTypes)),
        allowNull: false,
        comment: 'Type of token (access, refresh, or reset_password)',
      },
      expires: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Expiration date and time of the token',
      },
      blacklisted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indicates if the token is blacklisted/invalidated',
      },
    },
    {
      sequelize,
      modelName: 'Token',
      tableName: 'tokens',
      timestamps: true,
      paranoid: true, // Enables soft deletion with deletedAt field
      indexes: [
        { fields: ['token'] }, // Index for fast token lookups
        { fields: ['userId'] }, // Index for queries filtering by user
      ],
      scopes: {
        active: {
          where: {
            blacklisted: false,
            expires: { [Op.gt]: new Date() }, // Only non-expired tokens
          },
        },
      },
      validate: {
        typeExpirationConsistency() {
          if (this.type === tokenTypes.RESET_PASSWORD && this.expires > new Date(Date.now() + 24 * 60 * 60 * 1000)) {
            throw new Error('Reset password tokens must expire within 24 hours');
          }
        },
      },
      comment: 'Stores authentication tokens with type, expiration, and blacklisting',
    }
  );

  Token.associate = (models) => {
    Token.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Token;
};
