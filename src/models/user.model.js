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
        allowNull: false,
        comment: 'Unique identifier for the user',
      },
      name: {
        type: DataTypes.STRING(200), // Combined full name
        allowNull: false,
        comment: "User's full name",
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Please provide a valid email address.',
          },
        },
        comment: "User's unique email address, used for login",
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: {
            args: [8, 255],
            msg: 'Password must be between 8 and 255 characters long.',
          },
        },
        comment: 'Hashed password for user authentication',
      },
      role: {
        type: DataTypes.ENUM('super_admin', 'account_admin', 'property_manager', 'tenant'),
        allowNull: false,
        defaultValue: 'property_manager',
        comment: 'User role defining access permissions',
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: "Indicates if the user's email address has been verified",
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'accounts',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'ID of the associated account (null for super_admin)',
      },
      // Optional fields commented out:
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp of last login',
      },
      phoneNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'User phone number',
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
      tableName: 'users',
      defaultScope: { where: { isDeleted: false } },
      scopes: {
        all: { where: {} },
        withPassword: { attributes: { include: ['password'] } },
        withoutPassword: { attributes: { exclude: ['password'] } },
      },
      validate: {
        accountIdRoleConsistency() {
          const { role, accountId } = this;
          if (role === 'super_admin' && accountId !== null) {
            throw new Error('Super admin users must not be associated with an account.');
          }
          if (['account_admin', 'property_manager', 'tenant'].includes(role) && accountId === null) {
            throw new Error(
              `${role.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} users must be associated with an account.`
            );
          }
        },
      },
    }
  );

  // Associations
  User.associate = (models) => {
    User.belongsTo(models.Account, { foreignKey: 'accountId', as: 'account' });
  };

  // Instance methods
  User.prototype.isPasswordMatch = async function (password) {
    if (!this.password) {
      throw new Error('Password not loaded. Use .scope("withPassword") to include password.');
    }
    return bcrypt.compare(password, this.password);
  };

  // Static methods
  User.isEmailTaken = async function (email, excludeUserId = null) {
    const where = { email };
    if (excludeUserId) where.id = { [Op.ne]: excludeUserId };
    const user = await this.findOne({ where, attributes: ['id'] });
    return !!user;
  };

  // Hooks
  User.beforeCreate(async (user) => {
    if (user.password) user.password = await bcrypt.hash(user.password, 10);
  });
  User.beforeUpdate(async (user) => {
    if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10);
  });

  return User;
};
