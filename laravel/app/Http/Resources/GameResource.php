<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GameResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'type' => $this->type == 'S' ? 'Single Player' : 'Multiplayer',
            'board_size' => $this->board->board_cols . 'x' . $this->board->board_rows,
            'status' => $this->getGameStatusLabel($this->status),
            'began_at' => $this->began_at,
            'ended_at' => $this->ended_at,
            'total_time' => $this->convertSecondsToMinutesAndSeconds($this->total_time),
            'creator' => $this->created_user ? $this->created_user->nickname : null,
            'winner' => $this->winner_user ? $this->winner_user->nickname : '-',
            'total_turns_winner' => $this->total_turns_winner,
        ];
    }

    protected function getGameStatusLabel($status)
    {
        $statusLabels = [
            'PE' => 'Pending',
            'PL' => 'In Progress',
            'E' => 'Ended',
            'I' => 'Interrupted',
        ];

        return $statusLabels[$status] ?? 'Unknown';
    }

    protected function convertSecondsToMinutesAndSeconds($seconds)
    {
        $minutes = floor($seconds / 60);
        $remainingSeconds = $seconds % 60;
        return sprintf('%d min %d sec', $minutes, $remainingSeconds);
    }
}
