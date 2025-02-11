<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Game;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    public function getGenericStats()
    {
        try {
            $totalPlayers = User::count();
            $totalGames = Game::count();
            $gamesLastWeek = Game::where('created_at', '>=', Carbon::now()->subWeek())->count();
            $gamesLastMonth = Game::where('created_at', '>=', Carbon::now()->subMonth())->count();
            $averageGameDuration = Game::whereNotNull('total_time')->avg('total_time');
            
            $topPlayersByWins = Game::select('users.name', DB::raw('COUNT(games.winner_user_id) as wins'))
                ->join('users', 'games.winner_user_id', '=', 'users.id')
                ->whereNotNull('games.winner_user_id')
                ->groupBy('users.name')
                ->orderByDesc('wins')
                ->limit(5)
                ->get();
            

            return response()->json([
                'totalPlayers' => $totalPlayers,
                'totalGames' => $totalGames,
                'gamesLastWeek' => $gamesLastWeek,
                'gamesLastMonth' => $gamesLastMonth,
                'averageGameDuration' => $averageGameDuration,
                'topPlayersByWins' => $topPlayersByWins,
                
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred while fetching the generic stats',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getAdminStats()
{
    try {
        $totalPurchases = Transaction::where('type', 'P')->sum('euros');
        $purchasesByPlayer = Transaction::where('type', 'P')
            ->select('user_id', DB::raw('SUM(euros) as total'))
            ->groupBy('user_id')
            ->get();
        $blockedUsers = User::where('blocked', 1)->count();
        $totalRevenue = Transaction::where('type', 'P')->sum('euros');
        $lastMonthRevenue = Transaction::where('type', 'P')
            ->whereYear('transaction_datetime', Carbon::now()->subMonth()->year)
            ->whereMonth('transaction_datetime', Carbon::now()->subMonth()->month)
            ->sum('euros');
        $topSpendingUsers = Transaction::where('type', 'P')
            ->select('user_id', DB::raw('SUM(euros) as total'))
            ->groupBy('user_id')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        return response()->json([
            'totalPurchases' => $totalPurchases,
            'purchasesByPlayer' => $purchasesByPlayer,
            'blockedUsers' => $blockedUsers,
            'totalRevenue' => $totalRevenue,
            'lastMonthRevenue' => $lastMonthRevenue,
            'topSpendingUsers' => $topSpendingUsers,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'An error occurred while fetching the admin stats',
            'message' => $e->getMessage(),
        ], 500);
    }
}
}