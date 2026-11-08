<?php

require_once __DIR__ . '/inc/assets.php';
require_once __DIR__ . '/inc/mime.php';
require_once __DIR__ . '/inc/add_to_head.php';
require_once __DIR__ . '/inc/remove-emoji.php';
require_once __DIR__ . '/inc/verify_recaptcha.php';
require_once __DIR__ . '/inc/gutemberg.php';
require_once __DIR__ . '/inc/admin.php';
require_once __DIR__ . '/inc/schema-seo.php';
require_once __DIR__ . '/inc/partytown-proxy.php';
require_once __DIR__ . '/inc/email.php';
require_once __DIR__ . '/routes/routes.php';

add_action('after_setup_theme', static function (): void {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form']);
    register_nav_menu('primary', __('Primary Menu', 'wp-vite-starter'));
});
