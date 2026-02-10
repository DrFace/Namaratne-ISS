<?php
namespace App\Http\Controllers;

use App\Http\Requests\Customer\CustomerRequest;
use App\Services\CustomerService;
use App\Models\DiscountCategory;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CustomerController extends Controller
{
    public function __construct(
        protected CustomerService $customerService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        $permissions = $user->getPermissions();
        $isAdmin = $user->isAdmin();

        $discountCategories = DiscountCategory::select('id', 'name')
            ->orderBy('name')
            ->get();

        $search = trim((string) request()->query('search', ''));
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

        // Use CustomerService to get paginated customers
        $filters = [
            'search' => $search !== '' ? $search : null,
            'start_date' => $rangeStart,
            'end_date' => $rangeEnd,
        ];

        $customers = $this->customerService->getPaginatedCustomers($filters, 10);

        return Inertia::render('Customer/Index', [
            'customers' => $customers,
            'permissions' => $permissions,
            'isAdmin' => $isAdmin,
            'discountCategories' => $discountCategories,
            'filters' => [
                'search' => $search !== '' ? $search : null,
                'start_date' => $rangeStart ? $rangeStart->toDateString() : null,
                'end_date' => $rangeEnd ? $rangeEnd->toDateString() : null,
            ],
        ]);
    }

    public function store(CustomerRequest $request)
    {
        Gate::authorize('add_customer');

        $data = $request->validated();

        // MAP camelCase → snake_case
        if (isset($data['discountCategoryId']) && !isset($data['discount_category_id'])) {
            $data['discount_category_id'] = $data['discountCategoryId'];
        }
        unset($data['discountCategoryId']);

        try {
            $customer = $this->customerService->createCustomer($data);

            return response()->json([
                'message' => 'Customer added successfully!',
                'customer' => $customer,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating customer: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(CustomerRequest $request, $customerId)
    {
        $data = $request->validated();

        // MAP camelCase → snake_case
        if (isset($data['discountCategoryId']) && !isset($data['discount_category_id'])) {
            $data['discount_category_id'] = $data['discountCategoryId'];
        }
        unset($data['discountCategoryId']);

        try {
            $customer = $this->customerService->updateCustomer($customerId, $data);

            return response()->json([
                'message' => 'Customer updated successfully!',
                'customer' => $customer,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating customer: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($customerId)
    {
        Gate::authorize('delete_customer');

        try {
            $this->customerService->deleteCustomer($customerId);

            return redirect()->back()->with('success', 'Customer deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error deleting customer: ' . $e->getMessage());
        }
    }

    public function settleCredit(Request $request, $customerId)
    {
        $amount = $request->input('amount', null);

        if ($amount === null || $amount === '' || !is_numeric($amount) || $amount <= 0) {
            return response()->json([
                'message' => 'Valid settlement amount is required',
            ], 422);
        }

        try {
            $customer = $this->customerService->settleCredit($customerId, (float) $amount);

            return response()->json([
                'message' => "Credit of Rs. {$amount} settled successfully for {$customer->name}",
                'customer' => $customer,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
