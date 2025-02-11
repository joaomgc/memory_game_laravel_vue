<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{

    public $timestamps = false;

    protected $fillable = [
        'type',
        'transaction_datetime',
        'user_id',
        'game_id',
        'euros',
        'payment_type',
        'payment_reference',
        'brain_coins'
    ];

    protected $dates = [
        'transaction_datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    // Scopes for transaction types
    public function scopeBonusTransactions($query)
    {
        return $query->where('type', 'B');
    }

    public function scopePurchaseTransactions($query)
    {
        return $query->where('type', 'P');
    }

    public function scopeInternalTransactions($query)
    {
        return $query->where('type', 'I');
    }
}
