<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Board;
use App\Models\MultiplayerGamesPlayed;

class Game extends Model
{
    protected $fillable = [
        'type',
        'created_user_id',
        'winner_user_id',
        'status',
        'began_at',
        'ended_at',
        'total_time',
        'board_id',
        'total_turns_winner',
    ];

    public function created_user()
    {
        return $this->belongsTo(User::class, 'created_user_id');
    }

    public function winner_user()
    {
        return $this->belongsTo(User::class, 'winner_user_id');
    }

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    // For multiplayer games
    public function multiplayer_players()
    {
        return $this->hasMany(MultiplayerGamesPlayed::class, 'game_id');
    }
}
