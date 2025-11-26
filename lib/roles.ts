// Role-based access control system
// Defines permissions and access controls for different user roles

export type UserRole = 'admin' | 'user' | 'customer' | 'driver' | 'manager';

export interface RolePermissions {
  role: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  routes: string[];
  defaultRoute: string;
}

export type Permission = 
  // Order permissions
  | 'orders:create'
  | 'orders:read'
  | 'orders:update'
  | 'orders:delete'
  | 'orders:assign_driver'
  // User permissions
  | 'users:create'
  | 'users:read'
  | 'users:update'
  | 'users:delete'
  // Admin permissions
  | 'admin:dashboard'
  | 'admin:settings'
  | 'admin:reports'
  // Driver permissions
  | 'driver:pickup'
  | 'driver:delivery'
  | 'driver:status_update'
  // Customer permissions
  | 'customer:order_history'
  | 'customer:profile'
  // Manager permissions
  | 'manager:staff'
  | 'manager:analytics'
  // Location permissions
  | 'locations:create'
  | 'locations:read'
  | 'locations:update'
  | 'locations:delete'
  | 'locations:manage'
  | 'locations:billing'
  | 'locations:analytics';

export const ROLE_DEFINITIONS: Record<UserRole, RolePermissions> = {
  admin: {
    role: 'admin',
    displayName: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: [
      'orders:create', 'orders:read', 'orders:update', 'orders:delete', 'orders:assign_driver',
      'users:create', 'users:read', 'users:update', 'users:delete',
      'admin:dashboard', 'admin:settings', 'admin:reports',
      'manager:staff', 'manager:analytics',
      'locations:create', 'locations:read', 'locations:update', 'locations:delete', 
      'locations:manage', 'locations:billing', 'locations:analytics'
    ],
    routes: ['/admin', '/orders', '/users', '/analytics', '/settings', '/settings/locations'],
    defaultRoute: '/admin'
  },
  
  manager: {
    role: 'manager',
    displayName: 'Manager',
    description: 'Operational management with staff and analytics access',
    permissions: [
      'orders:create', 'orders:read', 'orders:update', 'orders:assign_driver',
      'users:read', 'users:update',
      'manager:staff', 'manager:analytics',
      'driver:pickup', 'driver:delivery',
      'locations:create', 'locations:read', 'locations:update', 'locations:manage', 'locations:analytics'
    ],
    routes: ['/manager', '/orders', '/analytics', '/staff', '/settings/locations'],
    defaultRoute: '/manager'
  },
  
  driver: {
    role: 'driver',
    displayName: 'Driver',
    description: 'Delivery and pickup operations',
    permissions: [
      'orders:read', 'orders:update',
      'driver:pickup', 'driver:delivery', 'driver:status_update'
    ],
    routes: ['/driver', '/orders', '/pickup'],
    defaultRoute: '/driver'
  },
  
  customer: {
    role: 'customer',
    displayName: 'Customer',
    description: 'Order placement and tracking',
    permissions: [
      'orders:create', 'orders:read',
      'customer:order_history', 'customer:profile'
    ],
    routes: ['/customer', '/order', '/profile', '/order-history'],
    defaultRoute: '/customer'
  },
  
  user: {
    role: 'user',
    displayName: 'User',
    description: 'Basic user access (legacy role)',
    permissions: [
      'orders:read',
      'customer:profile'
    ],
    routes: ['/profile'],
    defaultRoute: '/'
  }
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const roleDefinition = ROLE_DEFINITIONS[userRole];
  return roleDefinition.permissions.includes(permission);
}

/**
 * Check if a user can access a specific route
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const roleDefinition = ROLE_DEFINITIONS[userRole];
  return roleDefinition.routes.some(allowedRoute => 
    route.startsWith(allowedRoute) || allowedRoute === route
  );
}

/**
 * Get the default route for a user role
 */
export function getDefaultRoute(userRole: UserRole): string {
  return ROLE_DEFINITIONS[userRole].defaultRoute;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(userRole: UserRole): Permission[] {
  return ROLE_DEFINITIONS[userRole].permissions;
}

/**
 * Get role display information
 */
export function getRoleInfo(userRole: UserRole): Pick<RolePermissions, 'displayName' | 'description'> {
  const role = ROLE_DEFINITIONS[userRole];
  return {
    displayName: role.displayName,
    description: role.description
  };
}

/**
 * Get all available roles (useful for admin user management)
 */
export function getAllRoles(): UserRole[] {
  return Object.keys(ROLE_DEFINITIONS) as UserRole[];
}

/**
 * Validate if a role assignment is allowed
 * Admins can assign any role, Managers can assign customer/driver roles
 */
export function canAssignRole(assignerRole: UserRole, targetRole: UserRole): boolean {
  if (assignerRole === 'admin') {
    return true; // Admins can assign any role
  }
  
  if (assignerRole === 'manager') {
    return ['customer', 'driver', 'user'].includes(targetRole);
  }
  
  return false; // Other roles cannot assign roles
}