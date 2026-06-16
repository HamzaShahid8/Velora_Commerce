export const rolePermissionMap = {
  admin: [
    'create_role',
    'update_role',
    'view_role',
    'create_permission',
    'update_permission',
    'view_permission',
    'create_product',
    'update_product',
    'view_product',
    'create_product_design',
    'update_product_design',
    'view_product_design',
    'create_order',
    'update_order',
    'view_order',
    'create_bill',
    'update_bill',
    'view_bill',
    'create_role_permission',
    'update_role_permission',
    'view_role_permission',
    'can_access_admin_panel',
    'can_access_admin',
    'create_admin_profile',
    'update_admin_profile',
    'view_admin_profile',
    'create_manager_profile',
    'update_manager_profile',
    'view_manager_profile',
    'create_customer_profile',
    'update_customer_profile',
    'view_customer_profile',
    'create_worker_profile',
    'update_worker_profile',
    'view_worker_profile',
  ],
  manager: [
    'view_role',
    'view_permission',
    'create_product',
    'update_product',
    'view_product',
    'create_product_design',
    'update_product_design',
    'view_product_design',
    'create_order',
    'update_order',
    'view_order',
    'create_bill',
    'update_bill',
    'view_bill',
    'view_role_permission',
    'can_access_admin_panel',
    'can_access_admin',
    'view_admin_profile',
    'create_manager_profile',
    'update_manager_profile',
    'view_manager_profile',
    'create_customer_profile',
    'update_customer_profile',
    'view_customer_profile',
    'create_worker_profile',
    'update_worker_profile',
    'view_worker_profile',
  ],
  worker: [
    'view_role',
    'view_permission',
    'create_product',
    'update_product',
    'view_product',
    'create_product_design',
    'update_product_design',
    'view_product_design',
    'view_order',
    'view_bill',
    'view_role_permission',
    'create_worker_profile',
    'update_worker_profile',
    'view_worker_profile',
  ],
  customer: [
    'view_role',
    'view_permission',
    'view_product',
    'view_product_design',
    'view_order',
    'view_bill',
    'view_role_permission',
    'create_customer_profile',
    'update_customer_profile',
    'view_customer_profile',
  ],
}

export const modulePermissionMap = {
  users: {
    view: null,
    create: null,
    update: null,
    delete: null,
  },
  'admin-profiles': {
    view: 'view_admin_profile',
    create: 'create_admin_profile',
    update: 'update_admin_profile',
    delete: 'delete_admin_profile',
  },
  'manager-profiles': {
    view: 'view_manager_profile',
    create: 'create_manager_profile',
    update: 'update_manager_profile',
    delete: 'delete_manager_profile',
  },
  'worker-profiles': {
    view: 'view_worker_profile',
    create: 'create_worker_profile',
    update: 'update_worker_profile',
    delete: 'delete_worker_profile',
  },
  'client-profiles': {
    view: 'view_customer_profile',
    create: 'create_customer_profile',
    update: 'update_customer_profile',
    delete: 'delete_customer_profile',
  },
  'product-designs': {
    view: 'view_product_design',
    create: 'create_product_design',
    update: 'update_product_design',
    delete: 'delete_product_design',
  },
  products: {
    view: 'view_product',
    create: 'create_product',
    update: 'update_product',
    delete: 'delete_product',
  },
  invoices: {
    view: 'view_bill',
    create: 'create_bill',
    update: 'update_bill',
    delete: 'delete_bill',
  },
  'invoice-items': {
    view: 'view_bill',
    create: 'create_bill',
    update: 'update_bill',
    delete: 'delete_bill',
  },
  payments: {
    view: 'view_bill',
    create: 'create_bill',
    update: 'update_bill',
    delete: 'delete_bill',
  },
}

export const groupModuleKeys = {
  profiles: ['admin-profiles', 'manager-profiles', 'worker-profiles', 'client-profiles'],
  'product-management': ['product-designs', 'products'],
  billing: ['invoices', 'invoice-items', 'payments'],
}

export const profileModuleKeys = groupModuleKeys.profiles

export function normalizeRoleName(role) {
  if (!role) return ''
  if (typeof role === 'string') return role.toLowerCase()
  return String(role.name ?? role.role ?? '').toLowerCase()
}

export function normalizePermissionName(permission) {
  if (!permission) return ''
  if (typeof permission === 'string') return permission
  return permission.name ?? permission.permission ?? ''
}

export function isSuperuser(authUser, permissionsState) {
  return Boolean(authUser?.is_superuser || permissionsState?.isSuperuser)
}

export function isProfileModule(moduleKey) {
  return profileModuleKeys.includes(moduleKey)
}

export function getRolePermissionNames(role) {
  const roleName = normalizeRoleName(role)
  return rolePermissionMap[roleName] ?? []
}

function currentPermissionList(permissionsState, authUser) {
  if (Array.isArray(permissionsState?.permissions)) return permissionsState.permissions
  return getRolePermissionNames(permissionsState?.role || authUser?.role)
}

export function hasPermission(permissionsState, permissionName, authUser) {
  if (!permissionName) return true
  if (isSuperuser(authUser, permissionsState)) return true
  const permissions = currentPermissionList(permissionsState, authUser)
  if (!Array.isArray(permissions)) return false
  if (permissions.includes('*')) return true
  return permissions.includes(permissionName)
}

export function modulePermissionNames(moduleKey) {
  const permissionConfig = modulePermissionMap[moduleKey]
  if (!permissionConfig) return []
  return Object.values(permissionConfig).filter(Boolean)
}

export function moduleAllowedActions(moduleKey, permissionsState, authUser) {
  const permissionConfig = modulePermissionMap[moduleKey] ?? {}

  if (moduleKey === 'users') {
    return { view: true, create: false, update: false, delete: false }
  }

  return {
    view: hasPermission(permissionsState, permissionConfig.view, authUser),
    create: hasPermission(permissionsState, permissionConfig.create, authUser),
    update: hasPermission(permissionsState, permissionConfig.update, authUser),
    delete: hasPermission(permissionsState, permissionConfig.delete, authUser),
  }
}

export function canAccessModule(moduleKey, permissionsState, authUser) {
  if (moduleKey === 'users') return true
  const actions = moduleAllowedActions(moduleKey, permissionsState, authUser)
  return Object.values(actions).some(Boolean)
}

export function canViewModule(moduleKey, permissionsState, authUser) {
  if (moduleKey === 'users') return true
  return moduleAllowedActions(moduleKey, permissionsState, authUser).view
}

export function canCreateModule(moduleKey, permissionsState, authUser) {
  if (moduleKey === 'users') return false
  return moduleAllowedActions(moduleKey, permissionsState, authUser).create
}

export function canUpdateModule(moduleKey, permissionsState, authUser) {
  if (moduleKey === 'users') return false
  return moduleAllowedActions(moduleKey, permissionsState, authUser).update
}

export function canDeleteModule(moduleKey, permissionsState, authUser) {
  if (moduleKey === 'users') return false
  return moduleAllowedActions(moduleKey, permissionsState, authUser).delete
}
