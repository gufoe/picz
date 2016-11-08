<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;
use App\FileImage;
use App\Pic;

class PicController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth', ['except' => 'list']);
    }

    public function list(Request $request)
    {
        return Pic::orderBy('id', 'desc')->get();
    }

    public function upload(Request $req)
    {
        \DB::beginTransaction();

        $image = FileImage::upload($req->file('image'));
        if (!$image) {
            return error(FileImage::getError());
        }

        $data = [
            'title'    => $req->input('title'),
            'caption'  => (string) $req->input('caption'),
            'image_id' => @$image->id,
            'user_id'  => user()->id,
        ];

        validate(Pic::$rules, $data);
        $image = Pic::create($data);

        \DB::commit();

        return success('pic', $image);
    }
}
