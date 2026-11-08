<?php

function verify_recaptcha(string $token): bool {
    $secret = getenv('RECAPTCHA_SECRET_KEY');

    if (!$secret || $token === '') {
        return false;
    }

    $response = wp_remote_post('https://www.google.com/recaptcha/api/siteverify', [
        'body' => ['secret' => $secret, 'response' => $token],
    ]);
    $body = json_decode(wp_remote_retrieve_body($response), true);

    return ($body['success'] ?? false) === true && ($body['score'] ?? 0) >= 0.5;
}
