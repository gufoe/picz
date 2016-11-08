<?php

namespace App;

class FileImage extends File
{
    private static $safe_extensions = [
        'jpg', 'png', 'jpeg', 'gif', 'bmp',
    ];

    protected $table = 'files';

    public function res()
    {
        $info = getimagesize($this->path());
        return [
            $info[0],
            $info[1],
        ];
    }

    public function link($abs = false)
    {
        $link = "/images/cache/{$this->token}.{$this->extension}";
        $newpath = public_path($link);

        if (!is_dir(dirname($newpath))) {
            mkdir(dirname($newpath), 0772, true);
        }

        if (!file_exists($newpath)) {
            symlink($this->path(), $newpath);
        }

        return $link;
    }

    public function thumb($w, $h)
    {
        $link = "/images/cache/{$this->token}-{$w}x{$h}.{$this->ext()}";
        $newpath = public_path($link);

        if (!is_dir(dirname($newpath))) {
            mkdir(dirname($newpath), 0772, true);
        }

        if (!file_exists($newpath)) {
            $k = self::resize($this->path(), $newpath, [
                'width' => $w,
                'height' => $h,
                'crop' => true,
            ]);
        }

        return $link;
    }

    /**
     * Images scaling.
     * @param string  $ini_path Path to initial image.
     * @param string $dest_path Path to save new image.
     * @param array $params [optional] Must be an associative array of params
     * $params['width'] int New image width.
     * $params['height'] int New image height.
     * $params['constraint'] array.$params['constraint']['width'], $params['constraint'][height]
     * If specified the $width and $height params will be ignored.
     * New image will be resized to specified value either by width or height.
     * $params['aspect_ratio'] bool If false new image will be stretched to specified values.
     * If true aspect ratio will be preserved an empty space filled with color $params['rgb']
     * It has no sense for $params['constraint'].
     * $params['crop'] bool If true new image will be cropped to fit specified dimensions. It has no sense for $params['constraint'].
     * $params['rgb'] Hex code of background color. Default 0xFFFFFF.
     * $params['quality'] int New image quality (0 - 100). Default 100.
     * @return bool True on success.
     */
    public static function resize($ini_path, $dest_path, $params = [])
    {
        $width = !empty($params['width']) ? $params['width'] : null;
        $height = !empty($params['height']) ? $params['height'] : null;
        $constraint = !empty($params['constraint']) ? $params['constraint'] : false;
        $rgb = !empty($params['rgb']) ? $params['rgb'] : 0xFFFFFF;
        $quality = !empty($params['quality']) ? $params['quality'] : 100;
        $aspect_ratio = isset($params['aspect_ratio']) ? $params['aspect_ratio'] : true;
        $crop = isset($params['crop']) ? $params['crop'] : true;

        if (!file_exists($ini_path)) {
            return false;
        }

        if (!is_dir($dir = dirname($dest_path))) {
            mkdir($dir);
        }

        $img_info = getimagesize($ini_path);
        if ($img_info === false) {
            return false;
        }

        $ini_p = $img_info[0] / $img_info[1];
        if ($constraint) {
            $con_p = $constraint['width'] / $constraint['height'];
            $calc_p = $constraint['width'] / $img_info[0];

            if ($ini_p < $con_p) {
                $height = $constraint['height'];
                $width = $height * $ini_p;
            } else {
                $width = $constraint['width'];
                $height = $img_info[1] * $calc_p;
            }
        } else {
            if (!$width && $height) {
                $width = ($height * $img_info[0]) / $img_info[1];
            } elseif (!$height && $width) {
                $height = ($width * $img_info[1]) / $img_info[0];
            } elseif (!$height && !$width) {
                $width = $img_info[0];
                $height = $img_info[1];
            }
        }

        preg_match('/\.([^\.]+)$/i', basename($dest_path), $match);
        $ext = strtolower(@$match[1]);
        $output_format = ($ext == 'jpg') ? 'jpeg' : $ext;

        $format = strtolower(substr($img_info['mime'], strpos($img_info['mime'], '/') + 1));
        $icfunc = 'imagecreatefrom'.$format;

        $iresfunc = 'image'.$output_format;

        if (!function_exists($icfunc)) {
            return false;
        }

        $dst_x = $dst_y = 0;
        $src_x = $src_y = 0;
        $res_p = $width / $height;
        if ($crop && !$constraint) {
            $dst_w = $width;
            $dst_h = $height;
            if ($ini_p > $res_p) {
                $src_h = $img_info[1];
                $src_w = $img_info[1] * $res_p;
                $src_x = ($img_info[0] >= $src_w) ? floor(($img_info[0] - $src_w) / 2) : $src_w;
            } else {
                $src_w = $img_info[0];
                $src_h = $img_info[0] / $res_p;
                $src_y = ($img_info[1] >= $src_h) ? floor(($img_info[1] - $src_h) / 2) : $src_h;
            }
        } else {
            if ($ini_p > $res_p) {
                $dst_w = $width;
                $dst_h = $aspect_ratio ? floor($dst_w / $img_info[0] * $img_info[1]) : $height;
                $dst_y = $aspect_ratio ? floor(($height - $dst_h) / 2) : 0;
            } else {
                $dst_h = $height;
                $dst_w = $aspect_ratio ? floor($dst_h / $img_info[1] * $img_info[0]) : $width;
                $dst_x = $aspect_ratio ? floor(($width - $dst_w) / 2) : 0;
            }
            $src_w = $img_info[0];
            $src_h = $img_info[1];
        }

        $isrc = $icfunc($ini_path);
        $idest = imagecreatetruecolor($width, $height);
        if (($format == 'png' || $format == 'gif') && $output_format == $format) {
            imagealphablending($idest, false);
            imagesavealpha($idest, true);
            imagefill($idest, 0, 0, IMG_COLOR_TRANSPARENT);
            imagealphablending($isrc, true);
            $quality = 0;
        } else {
            imagefill($idest, 0, 0, $rgb);
        }
        imagecopyresampled($idest, $isrc, $dst_x, $dst_y, $src_x, $src_y, $dst_w, $dst_h, $src_w, $src_h);
        $res = $iresfunc($idest, $dest_path, $quality);

        imagedestroy($isrc);
        imagedestroy($idest);

        return $res;
    }
}
