const allRoles = {
  super_admin: [
    // Bill permissions
    'bill:create',
    'bill:view',
    'bill:view_all',
    'bill:update',
    'bill:delete',
    'bill:hard_delete',
    'bill:restore',
    // Payment permissions
    'payment:create',
    'payment:view',
    'payment:view_all',
    'payment:update',
    'payment:delete',
    'payment:hard_delete',
    'payment:restore',

    // Tenant permissions
    'tenant:tenant_create',
    'tenant:view_all',
    'tenant:view', // Included for completeness
    'tenant:tenant_update',
    'tenant:delete',
    'tenant:hard_delete',
    'tenant:restore',

    // Unit permissions
    'unit:management',
    // Account permissions
    'account:management',
    // Meter/Submeter permissions
    'meter:management',
    'sub_meter:management',
    'meter_reading:management',
    // Expense permissions
    'expense:management',
    // Expense Category permissions
    // 'expense_category:management',
    // 'expense_category:create',
    'expense_category:view_all',
    'expense_category:view', // Included for completeness
    // 'expense_category:update',
    'expense_category:delete',
    'expense_category:hard_delete',
    'expense_category:restore',
    // Expense permissions
    'expense:management',
    // Property permissions
    'property:management',
    // User management
    'user:management',
    // Utility Type management
    // 'utility_type:management',
    // 'utility_type:create',
    'utility_type:view',
    'utility_type:view_all',
    // 'utility_type:update',
    'utility_type:delete',
    'utility_type:hard_delete',
    'utility_type:restore',
    // Role management
    'role:management',
    'role:permission',
    'report:management',
  ],
  account_admin: [
    // Bill permissions
    'bill:create',
    'bill:view',
    'bill:view_all',
    'bill:update',
    'bill:delete',
    'bill:hard_delete',
    'bill:restore',
    // Payment permissions
    'payment:create',
    'payment:view',
    'payment:view_all',
    'payment:update',
    'payment:delete',
    'payment:hard_delete',
    'payment:restore',

    // Tenant permissions
    'tenant:tenant_create',
    'tenant:view_all',
    'tenant:view', // Included for completeness
    'tenant:tenant_update',
    'tenant:delete',
    'tenant:hard_delete',
    'tenant:restore',

    // Unit permissions
    'unit:management',
    // Account permissions
    // 'account:management',
    // Meter/Submeter permissions
    'meter:management',
    'sub_meter:management',
    'meter_reading:management',
    // Expense permissions
    'expense:management',
    // Expense Category permissions
    // 'expense_category:create',
    'expense_category:view_all',
    // 'expense_category:view', // Included for completeness
    // 'expense_category:update',
    // 'expense_category:delete',
    // 'expense_category:hard_delete',
    // 'expense_category:restore',

    // Expense permissions
    'expense:management',
    // Property permissions
    'property:management',
    // User management
    'user:management',
    // Utility Type management
    'utility_type:view',
    'utility_type:view_all',
    'utility_type:create',
    'utility_type:update',
    'utility_type:delete',
    'utility_type:hard_delete',
    'utility_type:restore',
    'role:permission',
    'report:management',
  ],
  property_manager: [
    // Tenant permissions
    'tenant:tenant_create',
    'tenant:view_all',
    'tenant:tenant_update',
    'tenant:delete',
    // Unit permissions
    'unit:management',
    // Meter/Submeter permissions
    'meter:management',
    'sub_meter:management',
    'meter_reading:management',
    'utility_type:view_all',
    'utility_type:create',
    'expense_category:view_all',
    // Expense permissions
    'expense:management',
    // Property permissions
    'property:management',
    // Read-only permissions for financial oversight
    'bill:view_all',
    'payment:view_all',
    'role:permission',
    'report:management',
  ],
  tenant: [
    // Scoped permissions
    'bill:view_own',
    'payment:view_own',
    'payment:create', // Tenants can submit payments for their bills
    'tenant:view_own',
    'role:permission',
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
