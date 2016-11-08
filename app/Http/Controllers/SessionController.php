<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;

class SessionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth', ['except' => 'login']);
    }

    public function login(Request $req)
    {
        $user = User::whereEmail($req->input('email'))->first();
        if (!$user || !$user->login($req->input('password'))) {
            return error('Invalid login.');
        }

        $session = $user->generateSession();

        return success([
            'user'  => $user,
            'token' => $session->token,
        ]);
    }

    public function logout(Request $req)
    {
        user()->destroySession(user()->token);
        return success();
    }
}
