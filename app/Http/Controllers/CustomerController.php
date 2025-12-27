<?php
namespace App\Http\Controllers;

use App\Http\Requests\Customer\CustomerRequest;
use App\Models\Customer;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $customers = Customer::latest()->paginate(10);

        // Get user permissions
        $user = auth()->user();
        $permissions = $user->getPermissions();
        $isAdmin = $user->isAdmin();

        return Inertia::render('Customer/Index', [
            'customers' => $customers,
            'permissions' => $permissions,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function store(CustomerRequest $request)
    {
        $data = $request->validated();

        $customer             = Customer::create($data);
        $customer->netBalance = $customer->creditBalance ?? 0;
        $customer->save();

        return response()->json([
            'message'  => 'Customer added successfully!',
            'customer' => $customer,
        ]);
    }

    public function update(CustomerRequest $request, Customer $customer)
    {
        $data = $request->validated();

        $customer->update($data);
        $customer->netBalance = $customer->creditBalance ?? $customer->netBalance ?? 0;
        $customer->save();
        
        // Update credit period status after changes
        $customer->updateCreditPeriodStatus();

        return response()->json([
            'message'  => 'Customer updated successfully!',
            'customer' => $customer,
        ]);

    }

    public function destroy(Customer $customer)
    {
        $customer->delete();

        return redirect()->back()->with('success', 'Customer deleted successfully!');

    }

    public function edit(Customer $customer)
    {
        return inertia('Customers/Edit', ['customer' => $customer]);
    }

    public function settleCredit(Customer $customer)
    {
        $creditAmount = $customer->currentCreditSpend;

        if ($creditAmount <= 0) {
            return response()->json([
                'message' => 'No outstanding credit to settle',
            ], 400);
        }

        // Reset the current credit spend to 0
        $customer->currentCreditSpend = 0;
        $customer->save();
        
        // Update credit period status (will reset periods since credit = 0)
        $customer->updateCreditPeriodStatus();

        return response()->json([
            'message' => "Credit of Rs. {$creditAmount} settled successfully for {$customer->name}",
            'customer' => $customer,
        ]);
    }

}
