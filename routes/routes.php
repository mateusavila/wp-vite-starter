<?php

add_action('rest_api_init', function () {

  $dir = __DIR__;
  $files = glob("$dir/*.php");

  foreach ($files as $file) {
    $basename = basename($file, '.php');

    if (!preg_match('/^([a-z0-9\-]+)\.(get|post|put|delete|patch)$/i', $basename, $matches)) {
      continue;
    }

    [$_, $endpoint, $method] = $matches;

    $callback = str_replace('-', '_', $endpoint);

    require_once $file;

    register_rest_route(
      'wp-vite-starter/v1',
      '/' . $endpoint,
      [
        'methods' => strtoupper($method),
        'callback' => $callback,
        'permission_callback' => '__return_true',
      ]
    );
  }
});
