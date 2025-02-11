<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCoinsRequest;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use Notification;
use App\Notifications\CoinsUpdatedNotification;
use App\Http\Requests\UpdateBlockUserRequest;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $queryParameters = $request->all();
        $users = User::query();

        if (array_key_exists('type', $queryParameters)) {
            $users->where('type', $queryParameters['type']);
        }
        if (array_key_exists('blocked', $queryParameters)) {
            $users->where('blocked', $queryParameters['blocked']);
        }

        return UserResource::collection($users->get());
    }

    public function show(User $user)
    {
        return new UserResource($user);
    }

    public function store(Request $request)
    {
        $user = User::create($request->validated());
        return new UserResource($user);
    }

    public function update(Request $request, User $user)
    {
        $user->fill($request->validated());
        $user->save();
        return new UserResource($user);
    }

    public function updateCoins(UpdateCoinsRequest $request, User $user)
    {
        $user->brain_coins_balance = $request->validated()['coins'];
        $user->save();

        return new UserResource($user);
    }

    public function updateBlocked(UpdateBlockUserRequest $request, User $user)
    {
        $user->blocked = $request->validated()['blocked'];
        $user->save();
        return new UserResource($user);
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(null, 204);
    }

    public function showMe(Request $request)
    {
        return new UserResource($request->user());
    }
}
