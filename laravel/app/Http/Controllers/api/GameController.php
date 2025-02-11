<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGameRequest;
use App\Http\Requests\StoreMultiplayerGameRequest;
use App\Http\Requests\UpdateGameRequest;
use App\Http\Resources\MultiplayerGameResource;
use App\Models\MultiplayerGamesPlayed;
use Illuminate\Http\Request;
use App\Http\Resources\GameResource;
use App\Models\Game;
use Illuminate\Support\Facades\Auth;
use App\Services\TransactionService;
use Illuminate\Container\Attributes\Log;
use PhpParser\Error;

class GameController extends Controller
{
    protected $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }


    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return GameResource::collection(Game::paginate(50)); // se fizer Game::get() não aguenta
    }

    public function getUserGameHistory()
    {
        $user = Auth::user();

        if ($user->type === 'A') {
            $games = Game::with(['board', 'created_user', 'winner_user', 'multiplayer_players'])
                ->orderBy('began_at', 'desc')
                ->get();
        } else {
            $games = Game::where('created_user_id', $user->id)
                ->orWhereHas('multiplayer_players', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->with(['board', 'created_user', 'winner_user', 'multiplayer_players'])
                ->orderBy('began_at', 'desc')
                ->get();
        }
        return GameResource::collection($games);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGameRequest $request)
    {
        $user = $request->user();

        if ($user) {
            // Create the game and associate it with the user
            $game = Game::create($request->validated());

            // Check if the board_id is 2 or 3
            if (in_array($request->board_id, [2, 3])) {
                // Create a game transaction for -1 brain coin
                $this->transactionService->createGameTransaction($user, $game->id, -1);

                // Deduct 1 brain coin from the user's balance
                $user->brain_coins_balance -= 1;
                $user->save();
            }

            return new GameResource($game);
        } else {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
    }

    public function storeMultiplayerGame(StoreMultiplayerGameRequest $request)
    {
        $user = $request->user();
        if ($user) {
            // Create the game and associate it with the user
            try {
                if ($user->brain_coins_balance < 5) {
                    throw response()->json(['error' => 'Insufficient brain coins'], 400);
                }
                if (in_array($request->board_id, [2, 3])) {
                    return response()->json(['error' => 'This board does not support multiplayer mode'], 400);
                }
                $game = MultiplayerGamesPlayed::create($request->validated());

                // Create a game transaction for -1 brain coin
                $this->transactionService->createGameTransaction($user, $game->id, -5);

                // Deduct 1 brain coin from the user's balance
                $user->brain_coins_balance -= 5;
                $user->save();
                return new MultiplayerGameResource($game);
            } catch (\Exception $e) {
                \Log::error('Error creating multiplayer game: ' . $e->getMessage(), [
                    'user_id' => $user->id,
                    'request_data' => $request->all(),
                ]);
                return response()->json(['error' => $e->getMessage()], 400);
            }
        } else {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Game $game)
    {
        return new GameResource($game);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGameRequest $request, Game $game)
    {
        $game->fill($request->validated());
        $game->save();
        return new GameResource($game);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Game $game)
    {
        $game->delete();
        return response()->json(null, 204);
    }
}
