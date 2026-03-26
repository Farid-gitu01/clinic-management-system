import type { UserRole } from "./auth-context"

interface RouteConfig {
  path: string
  roles: UserRole[]
}

export const routeConfigs: RouteConfig[] = [
  // Admin routes
  { path: "/dashboard/admin", roles: ["admin"] },
  { path: "/dashboard/admin/doctors", roles: ["admin"] },
  { path: "/dashboard/admin/patients", roles: ["admin"] },
  { path: "/dashboard/admin/appointments", roles: ["admin"] },
  { path: "/dashboard/admin/payments", roles: ["admin"] },
  { path: "/dashboard/admin/settings", roles: ["admin"] },

  // Doctor routes
  { path: "/dashboard/doctor", roles: ["doctor"] },
  { path: "/dashboard/doctor/appointments", roles: ["doctor"] },
  { path: "/dashboard/doctor/profile", roles: ["doctor"] },

  // Patient routes
  { path: "/dashboard/patient", roles: ["patient"] },
  { path: "/dashboard/patient/appointments", roles: ["patient"] },
  { path: "/dashboard/patient/profile", roles: ["patient"] },
  { path: "/dashboard/patient/payments", roles: ["patient"] },
]

export function canAccessRoute(userRole: UserRole, pathname: string): boolean {
  const route = routeConfigs.find((config) => config.path === pathname)
  if (!route) return true // If route not configured, allow access
  return route.roles.includes(userRole)
}
