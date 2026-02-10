<?php

namespace App\Http\Controllers;

use App\Models\DiscountCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DiscountCategoryController extends Controller
{
    /**
     * Display a listing of discount categories
     */
    public function index()
    {
        $categories = DiscountCategory::withCount('customers')
            ->with('customers:id,name,customerId,discount_category_id')
            ->orderBy('name')
            ->get();
        
        // Get all customers for assignment dropdown
        $allCustomers = \App\Models\Customer::select('id', 'customerId', 'name')
            ->orderBy('name')
            ->get();
        
        return Inertia::render('DiscountCategories/Index', [
            'categories' => $categories,
            'allCustomers' => $allCustomers,
        ]);
    }

    /**
     * Store a newly created discount category
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:discount_categories',
            'type' => 'required|in:amount,percentage',
            'value' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'status' => 'required|in:active,inactive',
        ]);

        $category = DiscountCategory::create($validated);

        return back()->with('success', 'Discount category created successfully!');
    }

    /**
     * Update the specified discount category
     */
    public function update(Request $request, $id)
    {
        $category = DiscountCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:discount_categories,name,' . $id,
            'type' => 'required|in:amount,percentage',
            'value' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'status' => 'required|in:active,inactive',
        ]);

        $category->update($validated);

        return back()->with('success', 'Discount category updated successfully!');
    }

    /**
     * Remove the specified discount category
     */
    public function destroy($id)
    {
        $category = DiscountCategory::findOrFail($id);

        // Check if category has customers
        if ($category->customers()->count() > 0) {
            return back()->with('error', 'Cannot delete category with assigned customers. Please reassign customers first.');
        }

        $category->delete();

        return back()->with('success', 'Discount category deleted successfully!');
    }

    /**
     * Assign a customer to a discount category
     */
    public function assignCustomer(Request $request, $id)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
        ]);

        $category = DiscountCategory::findOrFail($id);
        
        // Update customer's discount category
        \App\Models\Customer::where('id', $validated['customer_id'])
            ->update(['discount_category_id' => $id]);

        return back()->with('success', 'Customer assigned to category successfully!');
    }

    /**
     * Remove a customer from a discount category
     */
    public function removeCustomer($categoryId, $customerId)
    {
        \App\Models\Customer::where('id', $customerId)
            ->where('discount_category_id', $categoryId)
            ->update(['discount_category_id' => null]);

        return back()->with('success', 'Customer removed from category successfully!');
    }
}
