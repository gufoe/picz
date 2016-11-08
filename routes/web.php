<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

// Sessions
$app->post('sessions', 'SessionController@login');
$app->delete('sessions', 'SessionController@logout');

// Users
$app->get('users', 'UserController@list');
$app->post('users', 'UserController@signup');
$app->get('users/self', 'UserController@self');

$app->get('pics', 'PicController@list');
$app->post('pics', 'PicController@upload');
$app->delete('pics/{id}', 'PicController@delete');

$app->get('/{path:.*}', function () use ($app) {
    return file_get_contents(base_path().'/public/app.html');
});
