<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Partytown proxy for specific Google gstatic resources.
 *
 * Some Google scripts loaded through GTM do not provide CORS headers.
 * Partytown loads third-party scripts through fetch(), which requires CORS.
 *
 * This proxy keeps those requests same-origin while only allowing
 * explicitly approved gstatic paths.
 */

if (!defined('WP_VITE_ENABLE_PARTYTOWN_PROXY') || !WP_VITE_ENABLE_PARTYTOWN_PROXY) {
    return;
}

add_action('rest_api_init', function () {
    register_rest_route('wp-vite-starter/v1', '/partytown/gstatic', [
        'methods'             => WP_REST_Server::READABLE,
        'callback'            => 'wp_vite_partytown_gstatic_proxy',
        'permission_callback' => '__return_true',
        'args'                => [
            'path' => [
                'required'          => true,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ],
        ],
    ]);
});

/**
 * Proxy approved www.gstatic.com resources for Partytown.
 *
 * @param WP_REST_Request $request
 *
 * @return WP_REST_Response|WP_Error
 */
function wp_vite_partytown_gstatic_proxy(WP_REST_Request $request)
{
    $path = (string) $request->get_param('path');

    // Normalize the path.
    $path = ltrim($path, '/');

    if ($path === '') {
        return new WP_Error(
            'partytown_missing_path',
            'Missing gstatic resource path.',
            [
                'status' => 400,
            ]
        );
    }

    /**
     * IMPORTANT:
     *
     * Do not turn this into a generic URL proxy.
     * Only resources under these specific gstatic directories
     * are allowed.
     */
    $allowed_prefixes = [
        'wcm/',
        'call-tracking/',
    ];

    $is_allowed = false;

    foreach ($allowed_prefixes as $prefix) {
        if (str_starts_with($path, $prefix)) {
            $is_allowed = true;
            break;
        }
    }

    if (!$is_allowed) {
        return new WP_Error(
            'partytown_path_not_allowed',
            'This gstatic resource is not allowed.',
            [
                'status' => 403,
            ]
        );
    }

    /**
     * Extra protection against path manipulation.
     */
    if (
        str_contains($path, '..') ||
        str_contains($path, '\\') ||
        str_contains($path, '://')
    ) {
        return new WP_Error(
            'partytown_invalid_path',
            'Invalid gstatic resource path.',
            [
                'status' => 400,
            ]
        );
    }

    $upstream_url = 'https://www.gstatic.com/' . $path;

    $response = wp_remote_get($upstream_url, [
        'timeout'     => 10,
        'redirection' => 0,
        'user-agent'  => 'WPViteStarter-Partytown-Proxy/1.0',
        'headers'     => [
            'Accept' => 'application/javascript,text/javascript,*/*;q=0.1',
        ],
    ]);

    if (is_wp_error($response)) {
        return new WP_Error(
            'partytown_upstream_error',
            'Unable to retrieve the gstatic resource.',
            [
                'status' => 502,
            ]
        );
    }

    $status = wp_remote_retrieve_response_code($response);

    if ($status !== 200) {
        return new WP_Error(
            'partytown_upstream_status',
            'Unexpected response from gstatic.',
            [
                'status' => 502,
            ]
        );
    }

    $body = wp_remote_retrieve_body($response);

    if ($body === '') {
        return new WP_Error(
            'partytown_empty_response',
            'The gstatic resource returned an empty response.',
            [
                'status' => 502,
            ]
        );
    }

    $rest_response = new WP_REST_Response($body, 200);

    $rest_response->header(
        'Content-Type',
        'application/javascript; charset=UTF-8'
    );

    $rest_response->header(
        'Cache-Control',
        'public, max-age=3600'
    );

    return $rest_response;
}

add_filter('rest_pre_serve_request', static function ($served, $result, $request) {
    if (!$served && $request->get_route() === '/wp-vite-starter/v1/partytown/gstatic'
        && $result->get_status() === 200 && $request->get_method() === 'GET') {
        echo $result->get_data();
        return true;
    }

    return $served;
}, 10, 3);
