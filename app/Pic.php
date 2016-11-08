<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class Pic extends Model
{
    protected $guarded = ['id'];
    protected $visible = ['id', 'title', 'caption', 'created_at', 'src', 'resolution'];
    protected $appends = ['src', 'resolution'];

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
        $res = $this->image->res();
        return [
            'md' => $this->image->thumb($res[0] / 2, $res[1] / 2),
            'sm' => $this->image->thumb($res[0] / 4, $res[1] / 4),
        ];
    }

    public function getResolutionAttribute()
    {
        $res = $this->image->res();
        return "{$res[0]}x{$res[1]}";
    }
}
