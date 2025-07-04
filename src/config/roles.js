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
    // Expense permissions
    'expense:management',
    // Expense Category permissions
    'expense_category:management',
    // Expense permissions
    'expense:management',
    // Property permissions
    'property:management',
    // User management
    'user:management',
    // Utility Type management
    'utility_type:management',
    // Role management
    'role:management',
  ],
  account_admin: [
    // Bill permissions
    'bill:create',
    'bill:view',
    'bill:view_all',
    'bill:amount_update',
    'bill:delete',
    'bill:hard_delete',
    // Payment permissions
    'payment:payment_create',
    'payment:view_all',
    'payment:view',
    'payment:payment_update',
    'payment:ddelete',
    'payment:hard_ddelete',
    // Account permissions
    'account:management',
    // Read-only permissions for context
    'tenant:view_all',
    'unit:view',
    'meter:view',
    'expense:view',
    'property:view',
    'role:management',
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
    // Expense permissions
    'expense:management',
    // Property permissions
    'property:management',
    // Read-only permissions for financial oversight
    'bill:view_all',
    'payment:view_all',
    'role:management',
  ],
  tenant: [
    // Scoped permissions
    // 'bill:view_own',
    // 'payment:view_own',
    'payment:payment_create', // Tenants can submit payments for their bills
    // 'tenant:view_own',
    'role:management',
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
