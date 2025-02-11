<?php

namespace App\Http\Controllers\api;

use App\Models\User;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class TransactionController extends Controller
{
    protected $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    // Get user's transaction history
    public function getTransactionHistory()
    {
        $user = Auth::user();

        if ($user->type === 'A') {
            return User::with('transactions')
                ->join('transactions', 'users.id', '=', 'transactions.user_id')
                ->select('transactions.*', 'users.name as user_name')
                ->orderBy('transactions.transaction_datetime', 'desc')
                ->paginate(20);
        } else {
            return $user->transactions()->orderBy('transaction_datetime', 'desc')->paginate(20);
        }
    }

    // Purchase brain coins
    public function purchaseBrainCoins(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:MBWAY,IBAN,MB,VISA',
            'reference' => 'required',
            'amount' => 'required|integer|min:1|max:99'
        ]);

        try {
            $transaction = $this->transactionService->purchaseBrainCoins(
                Auth::user(),
                $validated['type'],
                $validated['reference'],
                $validated['amount']
            );

            return response()->json([
                'success' => true,
                'transaction' => $transaction,
                'balance' => Auth::user()->refresh()->brain_coins_balance
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
