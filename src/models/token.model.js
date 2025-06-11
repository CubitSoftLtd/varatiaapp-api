const { DataTypes, Op } = require('sequelize');

// Define token types in a clear, accessible object
const tokenTypes = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'reset_password',
  VERIFY_EMAIL: 'verify_email', // Added a common token type for email verification
};

module.exports = (sequelize) => {
  const Token = sequelize.define(
    'Token',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false, // Primary keys must be non-nullable
        comment: 'Unique identifier for the token record',
      },
      token: {
        type: DataTypes.STRING(512), // JWTs can be quite long, 512-1024 chars is safer
        allowNull: false,
        unique: true, // Tokens should generally be unique, especially refresh tokens
        validate: {
          notEmpty: true,
          len: [10, 512], // Minimum length to avoid accidental empty/short tokens
        },
        comment: 'The actual token string (e.g., JWT, unique ID)',
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users', // References the 'users' table
          key: 'id',
        },
        onDelete: 'CASCADE', // If a user is deleted, all their tokens should be deleted
        onUpdate: 'CASCADE',
        comment: 'Foreign key referencing the user associated with this token',
      },
      type: {
        // Use Object.values(tokenTypes) to dynamically generate the ENUM list
        type: DataTypes.ENUM(...Object.values(tokenTypes)),
        allowNull: false,
        comment: 'Type of token (e.g., access, refresh, reset_password, verify_email)',
      },
      expires: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'The exact date and time when the token expires',
      },
      blacklisted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false, // This status should always be defined
        comment: 'Indicates if the token has been explicitly invalidated (e.g., by logout)',
      },
      // You might consider adding a field for IP address or user agent for security auditing
      ipAddress: {
        type: DataTypes.STRING(45), // IPv4: 15 chars, IPv6: 45 chars
        allowNull: true,
        comment: 'IP address from which the token was issued/last used (for auditing)',
      },
      userAgent: {
        type: DataTypes.TEXT, // User agent strings can be very long
        allowNull: true,
        comment: 'User agent string of the client that received the token (for auditing)',
      },
    },
    {
      timestamps: true, // `createdAt` and `updatedAt` are automatically added
      tableName: 'tokens', // Explicitly set the table name
      modelName: 'token', // Explicitly define model name (optional but good practice)
      paranoid: true, // Enables soft deletion (adds a `deletedAt` column)
      // Soft deletion is useful for audit trails, but be aware it complicates queries.
      // If you primarily just want to mark tokens as invalid, `blacklisted` is sufficient,
      // and `paranoid` might be overkill here unless you have specific audit needs.
      // For token management, typically hard delete or rely on `blacklisted` and `expires`.
      // Consider removing `paranoid: true` if you just need `blacklisted`.
      indexes: [
        { fields: ['token'], unique: true }, // Ensure token string is indexed for fast lookup
        { fields: ['userId'] }, // Index for queries filtering by user
        { fields: ['type'] }, // Index for queries filtering by token type
        { fields: ['expires'] }, // Index for cleaning up expired tokens
        { fields: ['blacklisted'] }, // Index for checking blacklisted status
      ],
      // Scopes provide reusable query conditions
      scopes: {
        // Scope to easily retrieve only currently valid (non-blacklisted, non-expired) tokens
        active: {
          where: {
            blacklisted: false,
            expires: { [Op.gt]: new Date() }, // Only tokens whose expiration is in the future
          },
        },
        // Scope for refresh tokens specifically
        refresh: {
          where: {
            type: tokenTypes.REFRESH,
          },
        },
        // Scope for reset password tokens
        resetPassword: {
          where: {
            type: tokenTypes.RESET_PASSWORD,
          },
        },
      },
      // Model-level validation for consistency
      validate: {
        typeExpirationConsistency() {
          // This validation is for `RESET_PASSWORD` tokens specifically.
          // It's often defined by business logic. For example, reset tokens typically
          // have a very short lifespan (e.g., 1 hour to a few hours).
          // 24 hours (24 * 60 * 60 * 1000 milliseconds)
          const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
          if (this.type === tokenTypes.RESET_PASSWORD && this.expires.getTime() > Date.now() + twentyFourHoursInMs) {
            throw new Error('Reset password tokens must expire within 24 hours of creation.');
          }
          // Add similar checks for other token types if needed (e.g., access tokens being very short-lived)
        },
      },
    }
  );

  // --- Associations ---
  Token.associate = (models) => {
    // A token belongs to a user
    Token.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user', // Alias for eager loading (e.g., `include: 'user'`)
    });
  };

  return Token;
};

// Export tokenTypes for external use (e.g., in services or controllers)
module.exports.tokenTypes = tokenTypes;
