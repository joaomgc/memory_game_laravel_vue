<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    protected $fillable = [
        'board_cols',
        'board_rows',
        'custom'
    ];

    public function games()
    {
        return $this->hasMany(Game::class);
    }

    public function scopeStandardSizes($query)
    {
        return $query->whereIn('board_cols', [3, 4, 6])
            ->whereIn('board_rows', [4, 6]);
    }
}
