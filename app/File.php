<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    protected $guarded = ['id'];

    private static $safe_extensions = [
        'jpg', 'png', 'jpeg', 'gif',
    ];
    private static $error;

    ///////////////////////
    //  Static functions //
    ///////////////////////

    public static function folder()
    {
        $folder = storage_path().'/uploads';
        if (!is_dir($folder)) {
            mkdir($folder);
        }
        return $folder;
    }
    public static function getError()
    {
        return self::$error;
    }

    public static function upload($f)
    {
        if (is_string($f)) {
            $f = \Request::file($f);
        }

        if ($f == null) {
            self::$error = 'No file has been uploaded.';
            return;
        }

        if (!$f->isValid()) {
            self::$error = 'Error while uploading the file.';
            return false;
        }
        $ext = strtolower($f->getClientOriginalExtension());
        $name = $f->getClientOriginalName();
        $token = str_random(40);

        if (!in_array($ext, self::$safe_extensions)) {
            self::$error = 'Invalid extension, please use one of the following: .'.implode(', .', self::$safe_extensions);
            return false;
        }

        $f->move(self::folder(), $token);

        $f = new self([
            'name' => $name,
            'token' => $token,
        ]);
        $f->save();

        return $f;
    }

    public function ext()
    {
        $chunks = explode('.', $this->name);
        return end($chunks);
    }

    ////////////////////////
    //  Dynamic functions //
    ////////////////////////

    public function getSafeNameAttribute()
    {
        $name = $this->name;
        $name = str_replace('/', '|', $name);
        $name = str_replace('\\', '|', $name);
        return $name;
    }

    public function link($absolute = false)
    {
        return ($absolute ? baseurl() : '').act('file.download', $this->token);
    }

    public function path()
    {
        return self::folder()."/{$this->token}";
    }

    public function fullName()
    {
        return $this->name;
    }

    public function size()
    {
        if (!is_file($this->path())) {
            return 0;
        } else {
            return filesize($this->path());
        }
    }
}
