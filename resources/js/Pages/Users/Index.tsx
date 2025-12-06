import { usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Authenticated from '@/Layouts/AuthenticatedLayout';

interface User {
  id: number;
  name: string;
  email: string;
  role: number;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersIndex() {
  const { users, flash } = usePage().props as any;
  const [updating, setUpdating] = useState<number | null>(null);
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

  const handleRoleChange = (userId: number, newRole: number) => {
    if (confirm('Are you sure you want to change this user\'s role?')) {
      setUpdating(userId);
      router.post(
        `/admin/users/${userId}/role`,
        { role: newRole },
        {
          onFinish: () => {
            setUpdating(null);
          },
        }
      );
    }
  };

  const getRoleBadgeColor = (role: number) => {
    switch (role) {
      case 1: return 'bg-purple-100 text-purple-700';
      case 2: return 'bg-blue-100 text-blue-700';
      case 3: return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
          <h1 className="text-3xl font-bold text-gray-800">User Role Management</h1>
          <p className="text-sm text-gray-600">Manage user roles and permissions</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Current Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Change Role</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: User) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{user.name}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.roleName}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                        disabled={updating === user.id}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      >
                        <option value={1}>Admin</option>
                        <option value={2}>Stock Keeper</option>
                        <option value={3}>User</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{user.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Authenticated>
  );
}
