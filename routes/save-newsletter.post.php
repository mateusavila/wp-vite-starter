<?php

function save_newsletter(WP_REST_Request $request) {
    $email = $request->get_param('email');

    if (!is_string($email) || !is_email(trim($email))) {
        return new WP_Error(
            'invalid_email',
            __('Enter a valid email address.', 'wp-vite-starter'),
            ['status' => 422]
        );
    }

    $signup = wp_insert_post([
        'post_type' => 'starter_newsletter',
        'post_title' => sanitize_email(trim($email)),
        'post_status' => 'private',
    ], true);

    if (!$signup || is_wp_error($signup)) {
        return new WP_Error(
            'signup_failed',
            __('Could not save your signup.', 'wp-vite-starter'),
            ['status' => 500]
        );
    }

    return new WP_REST_Response([
        'message' => __('Thanks for signing up.', 'wp-vite-starter'),
    ], 201);
}
