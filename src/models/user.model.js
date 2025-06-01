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
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [6, 128],
        },
      },
      role: {
        type: DataTypes.ENUM('super_admin', 'admin', 'tenant'),
        allowNull: false,
        defaultValue: 'admin',
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'accounts',
          key: 'id',
        },
      },
    },
    {
      timestamps: true,
      tableName: 'users',
      scopes: {
        withPassword: {
          attributes: { include: ['password'] },
        },
      },
      validate: {
        accountIdRoleConsistency() {
          if (this.role === 'super_admin' && this.accountId !== null) {
            throw new Error('Super admin should not have an accountId');
          }
          if ((this.role === 'admin' || this.role === 'tenant') && this.accountId === null) {
            throw new Error('Admin and tenant must have an accountId');
          }
        },
      },
    }
  );

  User.associate = (models) => {
    User.belongsTo(models.Account, {
      foreignKey: 'accountId',
      as: 'account',
    });
  };

  User.prototype.isPasswordMatch = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  User.isEmailTaken = async function (email, excludeUserId = null) {
    const where = { email };
    if (excludeUserId) {
      where.id = { [Op.ne]: excludeUserId };
    }
    const user = await User.findOne({ where });
    return !!user;
  };

  User.beforeCreate(async (user) => {
    if (user.password) {
      /* eslint-disable no-param-reassign */
      user.password = await bcrypt.hash(user.password, 8);
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      /* eslint-disable no-param-reassign */
      user.password = await bcrypt.hash(user.password, 8);
    }
  });

  return User;
};
