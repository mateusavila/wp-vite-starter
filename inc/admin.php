<?php

add_action('init', static function (): void {
    register_post_type('starter_newsletter', [
        'label' => __('Newsletter signups', 'wp-vite-starter'),
        'public' => false,
        'show_ui' => true,
        'capability_type' => 'page',
        'capabilities' => [
            'edit_posts' => 'manage_options',
            'edit_others_posts' => 'manage_options',
            'edit_post' => 'manage_options',
            'read_post' => 'manage_options',
            'read_private_posts' => 'manage_options',
            'delete_post' => 'manage_options',
            'delete_posts' => 'manage_options',
            'delete_others_posts' => 'manage_options',
            'delete_private_posts' => 'manage_options',
            'create_posts' => 'do_not_allow',
        ],
        'supports' => ['title'],
    ]);
});
