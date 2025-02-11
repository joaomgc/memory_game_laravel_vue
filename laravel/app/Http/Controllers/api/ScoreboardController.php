<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Game;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ScoreboardController extends Controller
{

    protected function convertSecondsToMinutesAndSeconds($seconds)
    {
        $minutes = floor($seconds / 60);
        $remainingSeconds = $seconds % 60;
        return sprintf('%d min %d sec', $minutes, $remainingSeconds);
    }

    public function getTopSinglePlayerBestTimes($cols, $rows)
    {
        $singlePlayerBestTimes = Game::where('games.type', 'S')
            ->join('boards', 'games.board_id', '=', 'boards.id')
            ->join('users', 'games.created_user_id', '=', 'users.id')
            ->select(
                'boards.board_cols',
                'boards.board_rows',
                'users.nickname',
                'games.total_time',
                'games.began_at',
                'games.total_turns_winner'
            )
            ->where('boards.board_cols', $cols)
            ->where('boards.board_rows', $rows)
            ->whereNotNull('games.total_time')
            ->orderBy('games.total_time')
            ->limit(5)
            ->get();

        foreach ($singlePlayerBestTimes as $game) {
            $game->total_time = $this->convertSecondsToMinutesAndSeconds($game->total_time);
            $game->began_at = Carbon::parse($game->began_at)->format('Y-m-d H:i:s');
        }

        return response()->json($singlePlayerBestTimes);
    }

    public function getTopSinglePlayerMinTurns($cols, $rows)
    {
        $singlePlayerMinTurns = Game::where('games.type', 'S')
            ->join('boards', 'games.board_id', '=', 'boards.id')
            ->join('users', 'games.created_user_id', '=', 'users.id')
            ->select(
                'boards.board_cols',
                'boards.board_rows',
                'users.nickname',
                'games.total_turns_winner',
                'games.total_time',
                'games.began_at'
            )
            ->where('boards.board_cols', $cols)
            ->where('boards.board_rows', $rows)
            ->whereNotNull('games.total_turns_winner')
            ->orderBy('games.total_turns_winner')
            ->limit(5)
            ->get();

        foreach ($singlePlayerMinTurns as $game) {
            $game->total_time = $this->convertSecondsToMinutesAndSeconds($game->total_time);
            $game->began_at = Carbon::parse($game->began_at)->format('Y-m-d H:i:s');
        }

        return response()->json($singlePlayerMinTurns);
    }

    public function getTopMultiplayerVictories()
    {
        $multiplayerVictories = Game::where('games.type', 'M')
            ->join('multiplayer_games_played', 'games.id', '=', 'multiplayer_games_played.game_id')
            ->join('users', 'multiplayer_games_played.user_id', '=', 'users.id')
            ->select('users.nickname')
            ->selectRaw('SUM(multiplayer_games_played.player_won) as total_victories')
            ->groupBy('users.nickname')
            ->orderByDesc('total_victories')
            ->limit(5)
            ->get();

        return response()->json($multiplayerVictories);
    }

    public function getUserStats($userId, $cols, $rows)
    {
        $userStats = [];

        // Get the best times
        $userStats['best_times'] = Game::where('games.type', 'S')
            ->join('boards', 'games.board_id', '=', 'boards.id')
            ->join('users', 'games.created_user_id', '=', 'users.id')
            ->select(
                'boards.board_cols',
                'boards.board_rows',
                'games.total_time',
                'games.created_at',
                'games.total_turns_winner'
            )
            ->where('users.id', $userId)
            ->where('boards.board_cols', $cols)
            ->where('boards.board_rows', $rows)
            ->whereNotNull('games.total_time')
            ->orderBy('games.total_time')
            ->limit(5)
            ->get()
            ->map(function ($game) {
                $game->total_time = $this->convertSecondsToMinutesAndSeconds($game->total_time);
                return $game;
            });

        // Get the minimum turns
        $userStats['min_turns'] = Game::where('games.type', 'S')
            ->join('boards', 'games.board_id', '=', 'boards.id')
            ->join('users', 'games.created_user_id', '=', 'users.id')
            ->select(
                'boards.board_cols',
                'boards.board_rows',
                'games.total_turns_winner',
                'games.created_at'
            )
            ->where('users.id', $userId)
            ->where('boards.board_cols', $cols)
            ->where('boards.board_rows', $rows)
            ->whereNotNull('games.total_turns_winner')
            ->orderBy('games.total_turns_winner')
            ->limit(5)
            ->get();

        // Get the victories, losses, ties, and win rate
        $totalGames = Game::where('games.created_user_id', $userId)
            ->where('games.type', 'M')
            ->count();
        $victories = Game::where('games.created_user_id', $userId)->where('games.winner_user_id', $userId)->count();
        $losses = Game::where('games.created_user_id', $userId)->where('games.winner_user_id', '!=', $userId)->whereNotNull('games.winner_user_id')->count();

        $userStats['victories'] = $victories;
        $userStats['losses'] = $losses;
        $userStats['win_rate'] = $totalGames > 0 ? number_format(($victories / $totalGames) * 100, 2) : '0.00';
        return response()->json($userStats);
    }


    public function getUserBestTimes($userId)
    {
        $userBestTimes = Game::where('games.type', 'S')
            ->join('boards', 'games.board_id', '=', 'boards.id')
            ->join('users', 'games.created_user_id', '=', 'users.id')
            ->select(
                'boards.board_cols',
                'boards.board_rows',
                'games.began_at',
                'games.total_time',
                'games.created_at',
                'games.total_turns_winner'
            )
            ->where('users.id', $userId)
            ->whereNotNull('games.total_time')
            ->orderBy('games.total_time')
            ->limit(10)
            ->get()
            ->map(function ($game) {
                $game->total_time = $this->convertSecondsToMinutesAndSeconds($game->total_time);
                return $game;
            });

        return response()->json($userBestTimes);
    }

    public function getUserMinTurns($userId)
    {
        $userMinTurns = Game::where('games.type', 'S')
            ->join('boards', 'games.board_id', '=', 'boards.id')
            ->join('users', 'games.created_user_id', '=', 'users.id')
            ->select(
                'boards.board_cols',
                'boards.board_rows',
                'games.total_turns_winner',
                'games.began_at',
                'games.created_at',
                'games.total_time'
            )
            ->where('users.id', $userId)
            ->whereNotNull('games.total_turns_winner')
            ->orderBy('games.total_turns_winner')
            ->limit(10)
            ->get()
            ->map(function ($game) {
                $game->total_time = $this->convertSecondsToMinutesAndSeconds($game->total_time);
                return $game;
            });

        return response()->json($userMinTurns);
    }
}
