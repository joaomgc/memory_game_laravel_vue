<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
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
            'nickname' => 'nullable|string|max:255|unique:users,nickname,' . auth()->id(),
            'name' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:3',
            'photo_filename' => 'nullable|string|max:255', // Add this line        
        ];
    }
}
