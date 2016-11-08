<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth', ['except' => ['signup']]);
    }

    public function list(Request $request)
    {
        return User::where('email', 'like', "%{$request->input('q')}%")->get();
    }

    public function self()
    {
        return user();
    }

    public function signup(Request $req)
    {
        $data = [
            'email'    => $req->input('email'),
            'name'     => $req->input('name'),
            'password' => $req->input('password'),
        ];

        validate(User::$rules, $data);

        if (User::where('email', $data['email'])->exists()) {
            return error('This email address has already been used');
        }
        $user = User::create($data);
        return success('user', $user);
    }
}
