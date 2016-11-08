<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class Pic extends Model
{
    protected $guarded = ['id'];
    protected $visible = ['id', 'title', 'caption', 'created_at', 'src', 'res'];
    protected $appends = ['src', 'res'];

    public static $rules = [
        'title'    => 'required',
        'caption'  => '',
        'image_id' => 'required|exists:files,id',
        'user_id'  => 'required|exists:users,id',
    ];

    public function image()
    {
        return $this->belongsTo('App\FileImage', 'image_id');
    }

    public function getSrcAttribute()
    {
        return [
            600 => $this->image->thumb(0, 600),
            500 => $this->image->thumb(0, 500),
            400 => $this->image->thumb(0, 400),
            300 => $this->image->thumb(0, 300),
            200 => $this->image->thumb(0, 200),
            100 => $this->image->thumb(0, 100),
        ];
    }

    public function getResAttribute()
    {
        $res = $this->image->res();
        return [
            'w' => $res[0],
            'h' => $res[1],
        ];
    }
}
