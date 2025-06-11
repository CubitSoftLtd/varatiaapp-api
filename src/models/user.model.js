/* eslint-disable no-param-reassign */
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false, // Primary keys must be non-nullable
        comment: 'Unique identifier for the user',
      },
      firstName: {
        // Split name into firstName and lastName for better data granularity
        type: DataTypes.STRING(100), // Specify a reasonable length
        allowNull: false,
        comment: "User's first name",
      },
      lastName: {
        type: DataTypes.STRING(100), // Specify a reasonable length
        allowNull: false,
        comment: "User's last name",
      },
      fullName: {
        // Add a virtual field for full name
        type: DataTypes.VIRTUAL,
        get() {
          const firstName = this.getDataValue('firstName');
          const lastName = this.getDataValue('lastName');
          return `${firstName || ''} ${lastName || ''}`.trim();
        },
        // No 'set' method needed as it's a derived field
      },
      email: {
        type: DataTypes.STRING(255), // Specify a reasonable length for emails
        allowNull: false,
        unique: true, // Email must be unique for each user
        validate: {
          isEmail: {
            msg: 'Please provide a valid email address.',
          },
        },
        comment: "User's unique email address, used for login",
      },
      password: {
        type: DataTypes.STRING(255), // Store hashed passwords, typically longer than 128 after bcrypt
        allowNull: false,
        validate: {
          // Password length validation should typically happen *before* hashing
          // (e.g., in your API validation layer, not just here).
          // However, keeping it here as a fallback or for development.
          len: {
            args: [8, 255], // Recommended minimum password length is 8
            msg: 'Password must be between 8 and 255 characters long.',
          },
        },
        comment: 'Hashed password for user authentication',
      },
      role: {
        type: DataTypes.ENUM('super_admin', 'account_admin', 'property_manager', 'tenant'), // More granular roles
        allowNull: false,
        defaultValue: 'property_manager', // Changed default role for more common use case
        comment: 'User role defining access permissions',
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false, // This status should always be defined
        comment: "Indicates if the user's email address has been verified",
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: true, // Super admin should have null, others linked
        references: {
          model: 'accounts', // References the 'accounts' table
          key: 'id',
        },
        onDelete: 'CASCADE', // If an account is deleted, its users should also be deleted
        onUpdate: 'CASCADE',
        comment: 'ID of the associated account (null for super_admin)',
      },
      // You might add fields like:
      // lastLogin: {
      //   type: DataTypes.DATE,
      //   allowNull: true,
      //   comment: 'Timestamp of the user\'s last successful login',
      // },
      // phoneNumber: {
      //   type: DataTypes.STRING(50),
      //   allowNull: true,
      //   comment: 'User\'s phone number',
      // },
    },
    {
      timestamps: true, // `createdAt` and `updatedAt` columns are automatically added
      tableName: 'users', // Explicitly set the table name
      underscored: true, // Use snake_case for column names (e.g., `is_email_verified`)
      // modelName: 'user', // Explicitly define model name (optional but good practice)
      scopes: {
        // A scope to easily retrieve a user with their password for authentication checks
        withPassword: {
          attributes: { include: ['password'] },
        },
        // A scope to exclude sensitive information (like password) by default
        withoutPassword: {
          attributes: { exclude: ['password'] },
        },
      },
      validate: {
        // Model-level validation for accountId and role consistency
        accountIdRoleConsistency() {
          const { role, accountId } = this;
          if (role === 'super_admin' && accountId !== null) {
            throw new Error('Super admin users must not be associated with an account.');
          }
          if (['account_admin', 'property_manager', 'tenant'].includes(role) && accountId === null) {
            throw new Error(
              `${
                role.replace('_', ' ').charAt(0).toUpperCase() + role.replace('_', ' ').slice(1)
              } users must be associated with an account.`
            );
          }
          // Optional: A tenant user might also need a tenantId linked to the Tenant model
          // if you have a 1-to-1 relationship between a User and a Tenant record for login purposes.
          // This would typically involve another FK like `tenantUserTenantId` or similar.
        },
      },
    }
  );

  // Associations
  User.associate = (models) => {
    User.belongsTo(models.Account, {
      foreignKey: 'accountId',
      as: 'account',
    });
  };

  // --- Instance Methods ---
  /**
   * Checks if the provided password matches the user's stored hashed password.
   * @param {string} password - The plain-text password to compare.
   * @returns {Promise<boolean>} True if passwords match, false otherwise.
   */
  User.prototype.isPasswordMatch = async function (password) {
    if (!this.password) {
      // Handle cases where password might not be loaded (e.g., if 'withPassword' scope wasn't used)
      throw new Error('Password not loaded. Use .scope("withPassword") to retrieve password for comparison.');
    }
    return bcrypt.compare(password, this.password);
  };

  // --- Static Methods ---
  /**
   * Checks if an email address is already taken by another user.
   * @param {string} email - The email address to check.
   * @param {string|null} [excludeUserId=null] - Optional: ID of a user to exclude from the check (e.g., for update scenarios).
   * @returns {Promise<boolean>} True if email is taken, false otherwise.
   */
  User.isEmailTaken = async function (email, excludeUserId = null) {
    const where = { email };
    if (excludeUserId) {
      where.id = { [Op.ne]: excludeUserId }; // Use Op.ne for 'not equal'
    }
    // Using findOne directly is efficient. You can also specify attributes to limit fetched data.
    const user = await this.findOne({
      where,
      attributes: ['id'], // Only fetch 'id' as we only need to know if a user exists
    });
    return !!user; // Convert to boolean
  };

  // --- Hooks ---
  /**
   * Hook to hash the user's password before creating a new user.
   */
  User.beforeCreate(async (user) => {
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10); // Use a higher salt round (e.g., 10 or 12)
    }
  });

  /**
   * Hook to hash the user's password before updating the user if the password has changed.
   */
  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      // Check if the password field was modified
      user.password = await bcrypt.hash(user.password, 10); // Use a higher salt round
    }
  });

  return User;
};
