<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MultiplayerGamesPlayed extends Model
{
    protected $table = 'multiplayer_games_played';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'game_id',
        'player_won',
        'pairs_discovered',
        'custom'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function game()
    {
        return $this->belongsTo(Game::class);
    }
}
