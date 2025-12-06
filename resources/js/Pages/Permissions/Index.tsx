import { usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Authenticated from '@/Layouts/AuthenticatedLayout';

export default function PermissionsIndex() {
  const { permissions, roles, rolePermissions, flash } = usePage().props as any;
  const [selectedRole, setSelectedRole] = useState<number>(2); // Default to Stock Keeper
  const [showToast, setShowToast] = useState(false);

  // Show toast when flash message exists
  useEffect(() => {
    if (flash?.success || flash?.error) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  const handlePermissionToggle = (permissionSlug: string, currentValue: boolean) => {
    router.post(
      '/admin/permissions',
      {
        role: selectedRole,
        permission_slug: permissionSlug,
        is_enabled: !currentValue,
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const isPermissionEnabled = (permissionSlug: string): boolean => {
    return rolePermissions[selectedRole]?.[permissionSlug] || false;
  };

  return (
    <Authenticated bRoutes={undefined}>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Toast Notification - Top Center */}
        {showToast && (flash?.success || flash?.error) && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
            <div
              className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${flash?.success
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white'
                }`}
            >
              {flash?.success ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="font-medium">{flash?.success || flash?.error}</span>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage User Access</h1>
          <p className="text-sm text-gray-600">Configure permissions for each user role</p>
        </div>

        {/* Role Selector */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
          >
            {Object.entries(roles).map(([roleId, roleName]) => (
              <option key={roleId} value={parseInt(roleId)}>
                {String(roleName)}
              </option>
            ))}
          </select>
        </div>

        {/* Permissions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dashboard KPIs */}
          {permissions.dashboard && permissions.dashboard.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Dashboard KPIs</h3>
              <div className="space-y-3">
                {permissions.dashboard.map((permission: any) => {
                  const isEnabled = isPermissionEnabled(permission.slug);
                  return (
                    <label
                      key={permission.slug}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handlePermissionToggle(permission.slug, isEnabled)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{permission.name}</div>
                        <div className="text-xs text-gray-500">{permission.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          {permissions.action && permissions.action.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
              <div className="space-y-3">
                {permissions.action.map((permission: any) => {
                  const isEnabled = isPermissionEnabled(permission.slug);
                  return (
                    <label
                      key={permission.slug}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handlePermissionToggle(permission.slug, isEnabled)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{permission.name}</div>
                        <div className="text-xs text-gray-500">{permission.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Authenticated>
  );
}
