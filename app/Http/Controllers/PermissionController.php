<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\RolePermission;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PermissionController extends Controller
{
    public function index()
    {
        // Admin only
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        // Get all permissions and filter out promote_to_admin for non-admin roles
        $allPermissions = Permission::all();
        
        // Remove promote_to_admin from the list (it's admin-only, not toggleable)
        $permissions = $allPermissions->filter(function ($permission) {
            return $permission->slug !== 'promote_to_admin';
        })->groupBy('category');
        
        // Get permissions for each role
        $roles = [
            User::ROLE_STOCK_KEEPER => 'Stock Keeper',
            User::ROLE_USER => 'User',
        ];

        $rolePermissions = [];
        foreach ($roles as $roleId => $roleName) {
            $rolePermissions[$roleId] = RolePermission::where('role', $roleId)
                ->pluck('is_enabled', 'permission_slug')
                ->toArray();
        }

        return Inertia::render('Permissions/Index', [
            'permissions' => $permissions,
            'roles' => $roles,
            'rolePermissions' => $rolePermissions,
        ]);
    }

    public function update(Request $request)
    {
        // Admin only
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'role' => 'required|integer|in:2,3', // Only Stock Keeper and User
            'permission_slug' => 'required|string|exists:permissions,slug',
            'is_enabled' => 'required|boolean',
        ]);

        RolePermission::updateOrCreate(
            [
                'role' => $validated['role'],
                'permission_slug' => $validated['permission_slug'],
            ],
            [
                'is_enabled' => $validated['is_enabled'],
            ]
        );

        return back()->with('success', 'Permission updated successfully');
    }

    public function getUserPermissions()
    {
        $user = auth()->user();
        
        return response()->json([
            'permissions' => $user->getPermissions(),
            'role' => $user->getRoleName(),
            'isAdmin' => $user->isAdmin(),
        ]);
    }
}
