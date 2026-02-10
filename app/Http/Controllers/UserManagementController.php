<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index()
    {
        // Admin only
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        $users = User::select('id', 'first_name', 'last_name', 'email', 'role', 'is_active', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->first_name . ' ' . $user->last_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'roleName' => $user->getRoleName(),
                    'isActive' => $user->is_active,
                    'createdAt' => $user->created_at->format('Y-m-d'),
                ];
            });

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    public function updateRole(Request $request, $id)
    {
        // Admin only
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'role' => 'required|integer|in:1,2,3',
        ]);

        $user = User::findOrFail($id);

        // Prevent changing own role
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot change your own role']);
        }

        $user->update(['role' => $validated['role']]);

        return back()->with('success', 'User role updated successfully');
    }
}
