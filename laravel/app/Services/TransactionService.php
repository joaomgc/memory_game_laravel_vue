<?php

namespace App\Services;

use App\Models\User;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

class TransactionService
{
    // Welcome bonus for new users
    public function giveWelcomeBonus(User $user)
    {
        return Transaction::create([
            'type' => 'B',
            'transaction_datetime' => now(),
            'user_id' => $user->id,
            'brain_coins' => 10,
            'custom' => json_encode(['reason' => 'Welcome bonus'])
        ]);
    }

    // Purchase brain coins via external payment gateway
    public function purchaseBrainCoins(User $user, $paymentType, $reference, $amount)
    {
        // Validate payment with external service
        $response = $this->validatePayment($paymentType, $reference, $amount);

        if (!$response['success']) {
            throw new \Exception($response['message']);
        }

        // Create transaction
        $transaction = Transaction::create([
            'type' => 'P',
            'transaction_datetime' => now(),
            'user_id' => $user->id,
            'euros' => $amount,
            'payment_type' => $paymentType,
            'payment_reference' => $reference,
            'brain_coins' => $amount * 10 // 1 euro = 10 brain coins
        ]);

        // Update user's brain coins balance
        $user->increment('brain_coins_balance', $amount * 10);

        return $transaction;
    }

    // Validate payment with external payment gateway
    private function validatePayment($paymentType, $reference, $amount)
    {
        try {
            $response = Http::post('https://dad-202425-payments-api.vercel.app/api/debit', [
                'type' => $paymentType,
                'reference' => $reference,
                'value' => $amount
            ]);

            return [
                'success' => $response->successful(),
                'message' => $response->successful() ? 'Payment successful' : 'Payment failed'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    // Internal transaction (game spending/earning)
    public function createGameTransaction(User $user, $gameId, $brainCoinsChange)
    {
        return Transaction::create([
            'type' => 'I',
            'transaction_datetime' => now(),
            'user_id' => $user->id,
            'game_id' => $gameId,
            'brain_coins' => $brainCoinsChange
        ]);
    }
}
