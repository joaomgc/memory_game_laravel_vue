<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGameRequest extends FormRequest
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
            'winner_user_id' => 'nullable|exists:users,id', // Optional but if provided, must be valid user ID
            'status' => 'required|in:PE,PL,E,I',
            'ended_at' => 'nullable|date',
            'total_time' => 'nullable|integer|min:0',
            'total_turns_winner' => 'nullable|integer|min:0',
        ];
    }
}
