<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Serias;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Show the form for editing the specified product.
     */
    public function edit($id)
    {
        $product = Product::findOrFail($id);
        $seriasList = Serias::all(['id', 'seriasNo']);

        return Inertia::render('Inventory/EditProduct', [
            'product' => $product,
            'seriasList' => $seriasList,
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'productCode' => 'nullable|string|max:255',
            'productDescription' => 'nullable|string|max:1000',
            'unit' => 'nullable|string|max:50',
            'brand' => 'nullable|string|max:255',
            'seriasId' => 'nullable|integer|exists:serias,id',
            'lowStock' => 'nullable|integer|min:0',
            'productImage' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // Handle image upload
        if ($request->hasFile('productImage')) {
            // Delete old image if exists
            if ($product->productImage && Storage::disk('public')->exists($product->productImage)) {
                Storage::disk('public')->delete($product->productImage);
            }

            // Store new image
            $path = $request->file('productImage')->store('products', 'public');
            $validated['productImage'] = $path;
        }

        // Update product
        $product->update($validated);

        return redirect()->route('products.index')->with('success', 'Product updated successfully!');
    }
}
