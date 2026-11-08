<?php

add_action('wp_enqueue_scripts', static function (): void {
    if (wp_get_environment_type() === 'local' && defined('WP_VITE_DEV_SERVER') && WP_VITE_DEV_SERVER) {
        $origin = 'http://127.0.0.1:5173';
        wp_enqueue_script_module('wp-vite-client', $origin . '/@vite/client', [], null);
        wp_enqueue_script_module('wp-vite-main', $origin . '/src/index.ts', [], null);

        return;
    }

    $manifest_path = get_theme_file_path('dist/.vite/manifest.json');

    if (!is_readable($manifest_path)) {
        return;
    }

    $manifest = json_decode((string) file_get_contents($manifest_path), true);
    $entry = $manifest['src/index.ts'] ?? [];

    foreach ($entry['css'] ?? [] as $index => $file) {
        wp_enqueue_style('wp-vite-style-' . $index, get_theme_file_uri('dist/' . $file), [], null);
    }

    if (!empty($entry['file'])) {
        wp_enqueue_script_module('wp-vite-main', get_theme_file_uri('dist/' . $entry['file']), [], null);
    }
});
