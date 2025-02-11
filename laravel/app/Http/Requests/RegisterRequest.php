<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'nickname' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:3|confirmed', // confirmed significa que requere um campo password_confirmation
            'photo' => 'nullable|image|max:2048',
            'type' => 'string|in:admin,user',
        ];
    }
}
