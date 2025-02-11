<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGameRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => 'required|in:S,M',
            'created_user_id' => 'required|exists:users,id',
            'winner_user_id' => 'nullable|exists:users,id', // Optional but if provided, must be valid user ID
            'status' => 'required|in:PE,PL,E,I',
            'began_at' => 'required|date',
            'ended_at' => 'nullable|date|after_or_equal:began_at', // If ended_at is provided, it must be after began_at
            'total_time' => 'nullable|integer|min:0',
            'board_id' => 'required|exists:boards,id', // Ensure the board exists
            'custom' => 'nullable|json',
        ];
    }
}
