<?php
namespace App\Http\Controllers;

use App\Http\Requests\Customer\CustomerRequest;
use App\Models\Customer;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        $permissions = $user->getPermissions();
        $isAdmin = $user->isAdmin();

        // Search (name/contact/email)
        $search = trim((string) request()->query('search', ''));

        // Date range for Total Sales
        $startDateParam = request()->query('start_date');
        $endDateParam = request()->query('end_date');

        $rangeStart = null;
        $rangeEnd = null;

        if ($startDateParam && $endDateParam) {
            try {
                $rangeStart = Carbon::parse($startDateParam)->startOfDay();
                $rangeEnd = Carbon::parse($endDateParam)->endOfDay();

                if ($rangeStart->gt($rangeEnd)) {
                    $tmp = $rangeStart;
                    $rangeStart = $rangeEnd->copy()->startOfDay();
                    $rangeEnd = $tmp->copy()->endOfDay();
                }
            } catch (\Exception $e) {
                $rangeStart = null;
                $rangeEnd = null;
            }
        }

        $customersQuery = Customer::with('discountCategory');

        if ($search !== '') {
            $customersQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('contactNumber', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Total Sales should respect date range AND only approved sales
        if ($rangeStart && $rangeEnd) {
            $customersQuery->withSum(['sales' => function ($q) use ($rangeStart, $rangeEnd) {
                $q->where('status', 'approved')
                  ->whereBetween('created_at', [$rangeStart, $rangeEnd]);
            }], 'totalAmount');
        } else {
            $customersQuery->withSum(['sales' => function ($q) {
                $q->where('status', 'approved');
            }], 'totalAmount');
        }

        $customers = $customersQuery
            ->latest()
            ->paginate(10)
            ->appends(request()->query());

        // Add totalSales attribute to each customer
        $customers->getCollection()->transform(function ($customer) {
            $customer->totalSales = $customer->sales_sum_totalamount ?? 0;
            return $customer;
        });

        return Inertia::render('Customer/Index', [
            'customers' => $customers,
            'permissions' => $permissions,
            'isAdmin' => $isAdmin,
            'filters' => [
                'search' => $search !== '' ? $search : null,
                'start_date' => $rangeStart ? $rangeStart->toDateString() : null,
                'end_date' => $rangeEnd ? $rangeEnd->toDateString() : null,
            ],
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

    public function settleCredit(Request $request, Customer $customer)
    {
        $currentOutstanding = (float) ($customer->currentCreditSpend ?? 0);

        if ($currentOutstanding <= 0) {
            return response()->json([
                'message' => 'No outstanding credit to settle',
            ], 400);
        }

        $amount = $request->input('amount', null);

        if ($amount === null || $amount === '') {
            return response()->json([
                'message' => 'Settlement amount is required',
            ], 422);
        }

        if (!is_numeric($amount)) {
            return response()->json([
                'message' => 'Settlement amount must be a number',
            ], 422);
        }

        $amount = (float) $amount;

        if ($amount <= 0) {
            return response()->json([
                'message' => 'Settlement amount must be greater than 0',
            ], 422);
        }

        if ($amount > $currentOutstanding) {
            return response()->json([
                'message' => 'Settlement amount cannot exceed outstanding credit',
            ], 422);
        }

        // Subtract only the settled amount
        $customer->currentCreditSpend = max(0, $currentOutstanding - $amount);
        $customer->save();

        // Update credit period status (resets periods if credit becomes 0)
        $customer->refresh();
        $customer->updateCreditPeriodStatus();

        return response()->json([
            'message' => "Credit of Rs. {$amount} settled successfully for {$customer->name}",
            'customer' => $customer,
        ]);
    }
}