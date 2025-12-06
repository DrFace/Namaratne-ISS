<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    // Role constants
    const ROLE_ADMIN = 1;
    const ROLE_STOCK_KEEPER = 2;
    const ROLE_USER = 3;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'avatar',
        'position',
        'role',
        'is_active',
        'password',

    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Role checking methods
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isStockKeeper(): bool
    {
        return $this->role === self::ROLE_STOCK_KEEPER;
    }

    public function isUser(): bool
    {
        return $this->role === self::ROLE_USER;
    }

    // Permission checking
    public function hasPermission(string $permissionSlug): bool
    {
        // Admins have all permissions
        if ($this->isAdmin()) {
            return true;
        }

        // Check role_permissions table
        $rolePermission = \App\Models\RolePermission::where('role', $this->role)
            ->where('permission_slug', $permissionSlug)
            ->where('is_enabled', true)
            ->first();

        return $rolePermission !== null;
    }

    public function canPromoteToAdmin(): bool
    {
        return $this->isAdmin();
    }

    // Get all permissions for this user's role
    public function getPermissions(): array
    {
        if ($this->isAdmin()) {
            // Admins have all permissions
            return \App\Models\Permission::pluck('slug')->toArray();
        }

        return \App\Models\RolePermission::where('role', $this->role)
            ->where('is_enabled', true)
            ->pluck('permission_slug')
            ->toArray();
    }

    public function getRoleName(): string
    {
        return match($this->role) {
            self::ROLE_ADMIN => 'Admin',
            self::ROLE_STOCK_KEEPER => 'Stock Keeper',
            self::ROLE_USER => 'User',
            default => 'Unknown',
        };
    }
}
