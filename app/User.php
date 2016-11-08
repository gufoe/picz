<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class User extends Model
{
    protected $guarded = ['id'];
    protected $visible = ['id', 'email'];

    public static $rules = [
        'email'    => 'required|unique:users',
        'name'    => 'required|unique:users',
        'password' => 'required|min:7',
    ];

    public function articles()
    {
        return $this->hasMany('App\Article');
    }

    public function chairs()
    {
        return $this->belongsToMany('App\Conference', 'chairs');
    }

    public function reviews()
    {
        return $this->belongsToMany('App\Article', 'reviews');
    }

    public function generateSession()
    {
        $session = Session::create([
            'user_id' => $this->id,
            'token' => str_random(10),
        ]);
        return $session;
    }
    public function destroySession($token)
    {
        $this->sessions()->whereToken($token)->delete();
    }

    public function sessions()
    {
        return $this->hasMany('App\Session');
    }

    public function setPasswordAttribute($password)
    {
        $this->attributes['password'] = Hash::make($password);
    }

    public function login($password)
    {
        return Hash::check($password, $this->password);
    }

    public static function byToken($token)
    {
        $session = Session::whereToken($token)->first();
        return $session ? $session->user : null;
    }
}
