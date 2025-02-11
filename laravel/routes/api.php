<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\GameController;
use App\Http\Controllers\api\UserController;
use App\Http\Controllers\api\ScoreboardController;
use App\Models\User;
use App\Http\Controllers\api\TransactionController;
use App\Http\Controllers\api\StatisticsController;

Route::get('/stats/generic', [StatisticsController::class, 'getGenericStats']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('users/me', function (Request $request) {
        return $request->user();
    });

    Route::put('/users/{id}', [AuthController::class, 'updateUser']);
    Route::put('/users/{user}/coins', [UserController::class, 'updateCoins']);
    Route::patch('users/{user}/blocked', [UserController::class, 'updateBlocked']);
    Route::delete('users/{user}/delete', [UserController::class, 'destroy']);
    Route::get('users/{user}', [UserController::class, 'show']);

    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::delete('auth/delete-account', [AuthController::class, 'deleteAccount']);
    Route::post('auth/upload-photo', [AuthController::class, 'uploadPhoto']);
    Route::post('auth/refreshtoken', [AuthController::class, 'refreshToken']);
    Route::post('/auth/registerAdmin', [AuthController::class, "registerAdmin"])->can('viewAny', User::class);

    Route::get('games/history', [GameController::class, 'getUserGameHistory']);
    Route::post('/games', [GameController::class, 'store']);
    Route::put('/games/{game}', [GameController::class, 'update']);
    Route::delete('/games/{game}', [GameController::class, 'destroy']);
    Route::post('games/multiplayer', [GameController::class, 'storeMultiplayerGame']);
    Route::get('/users', [UserController::class, 'index'])->can('viewAny', User::class);

    Route::get('/scoreboard/users-stats/{id}/{cols}/{rows}', [ScoreboardController::class, 'getUserStats']);

    Route::get('/scoreboard/users-stats/best-times/{id}', [ScoreboardController::class, 'getUserBestTimes']);
    Route::get('/scoreboard/users-stats/min-turns/{id}', [ScoreboardController::class, 'getUserMinTurns']);

    Route::get('/stats/admin', [StatisticsController::class, 'getAdminStats'])->can('viewAny', User::class);

    Route::get('/transactions/history', [TransactionController::class, 'getTransactionHistory']);
    Route::post('/transactions/purchase', [TransactionController::class, 'purchaseBrainCoins']);
});


Route::post('/auth/login', [AuthController::class, "login"]);
Route::post('/auth/register', [AuthController::class, "register"]);

Route::get('/scoreboard/single-player-best-times/{cols}/{rows}', [ScoreboardController::class, 'getTopSinglePlayerBestTimes']);
Route::get('/scoreboard/single-player-min-turns/{cols}/{rows}', [ScoreboardController::class, 'getTopSinglePlayerMinTurns']);
Route::get('/scoreboard/top-multiplayer-victories', [ScoreboardController::class, 'getTopMultiplayerVictories']);

Route::get('/games', [GameController::class, 'index']);
Route::get('/games/{game}', [GameController::class, 'show']);
Route::put('/games/{game}', [GameController::class, 'update']);
Route::delete('/games/{game}', [GameController::class, 'destroy']);
