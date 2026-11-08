<?php

add_filter('upload_mimes', static function (array $mimes): array {
    $mimes['avif'] = 'image/avif';
    $mimes['webp'] = 'image/webp';

    return $mimes;
});
