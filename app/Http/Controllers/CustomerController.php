<?php
namespace App\Http\Controllers;

use App\Http\Requests\Customer\CustomerRequest;
use App\Services\CustomerService;
use App\Models\DiscountCategory;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Gate;

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
        Gate::authorize('add_customers');

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
        Gate::authorize('delete_customers');

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

    public function timeline($customerId)
    {
        $customer = \App\Models\Customer::with(['sales', 'notes.createdBy'])->findOrFail($customerId);

        // Fetch Sales
        $sales = $customer->sales()->with('user')->get()->map(function($sale) {
            return [
                'id' => 'sale-' . $sale->id,
                'type' => 'sale',
                'title' => 'Purchase: #' . $sale->billNumber,
                'description' => "Purchased items worth Rs. " . number_format((float)$sale->totalAmount, 2),
                'timestamp' => $sale->created_at,
                'amount' => (float)$sale->totalAmount,
                'meta' => [
                    'bill_number' => $sale->billNumber,
                    'status' => $sale->status,
                    'user' => $sale->user->name ?? 'System',
                ]
            ];
        });

        // Fetch Payments
        $payments = \App\Models\Payment::whereIn('sale_id', $customer->sales()->pluck('id'))->with('recordedBy')->get()->map(function($payment) {
            return [
                'id' => 'payment-' . $payment->id,
                'type' => 'payment',
                'title' => 'Payment Received',
                'description' => "Payment of Rs. " . number_format((float)$payment->amount, 2) . " via " . ($payment->payment_method ?? 'N/A'),
                'timestamp' => $payment->payment_date ?: $payment->created_at,
                'amount' => (float)$payment->amount,
                'meta' => [
                    'method' => $payment->payment_method,
                    'reference' => $payment->reference_number,
                    'user' => $payment->recordedBy->name ?? 'System',
                ]
            ];
        });

        // Fetch Returns
        $returns = \App\Models\ReturnModel::whereIn('sale_id', $customer->sales()->pluck('id'))->with('createdBy')->get()->map(function($return) {
            return [
                'id' => 'return-' . $return->id,
                'type' => 'return',
                'title' => 'Product Return: #' . $return->return_number,
                'description' => "Returned items worth Rs. " . number_format((float)$return->total_amount, 2),
                'timestamp' => $return->created_at,
                'amount' => (float)$return->total_amount,
                'meta' => [
                    'return_number' => $return->return_number,
                    'reason' => $return->reason,
                    'user' => $return->createdBy->name ?? 'System',
                ]
            ];
        });

        // Fetch Notes
        $notes = $customer->notes->map(function($note) {
            return [
                'id' => 'note-' . $note->id,
                'type' => 'note',
                'title' => 'Internal Note (' . ucfirst($note->type) . ')',
                'description' => $note->note,
                'timestamp' => $note->created_at,
                'meta' => [
                    'type' => $note->type,
                    'user' => $note->createdBy->name ?? 'System',
                ]
            ];
        });

        // Fetch Activity Logs
        $activity = \Spatie\Activitylog\Models\Activity::where('subject_type', \App\Models\Customer::class)
            ->where('subject_id', $customer->id)
            ->with('causer')
            ->get()
            ->map(function($log) {
                return [
                    'id' => 'activity-' . $log->id,
                    'type' => 'activity',
                    'title' => 'Customer Profile Updated',
                    'description' => $log->description,
                    'timestamp' => $log->created_at,
                    'meta' => [
                        'user' => $log->causer->name ?? 'System',
                        'changes' => $log->properties['attributes'] ?? [],
                    ]
                ];
            });

        // Combine and Sort
        $timeline = $sales->concat($payments)->concat($returns)->concat($notes)->concat($activity)
            ->sortByDesc(function($item) {
                return \Carbon\Carbon::parse($item['timestamp'])->timestamp;
            })
            ->values();

        return response()->json($timeline);
    }

    public function storeNote(Request $request)
    {
        $data = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'note' => 'required|string',
            'type' => 'required|string|in:general,follow-up,complaint,vip',
        ]);

        $data['created_by'] = auth()->id();

        $note = \App\Models\CustomerNote::create($data);

        return response()->json([
            'message' => 'Note added successfully',
            'note' => $note->load('createdBy'),
        ]);
    }
}
