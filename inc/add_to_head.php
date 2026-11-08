<?php
function wp_vite_image_tag($image, string $sizes, array $attrs = []): string {
  $id = is_array($image) ? (int) ($image['ID'] ?? $image['id'] ?? 0) : (int) $image;

  if ($id && get_post_mime_type($id) !== 'image/svg+xml') {
    $html = wp_get_attachment_image($id, 'full', false, array_merge([
      'sizes'    => $sizes,
      'loading'  => 'lazy',
      'decoding' => 'async',
    ], $attrs));
    if ($html) return $html;
  }

  if (is_array($image) && !empty($image['url'])) {
    $a = array_merge([
      'src'      => $image['url'],
      'loading'  => 'lazy',
      'decoding' => 'async',
      'width'    => $image['width'] ?? null,
      'height'   => $image['height'] ?? null,
    ], $attrs);
    unset($a['sizes']);

    $out = '<img';
    foreach ($a as $k => $v) {
      if ($v === null || $v === false || !preg_match('/^(?:src|alt|width|height|loading|decoding|fetchpriority|class|id|title|(?:data|aria)-[a-z0-9-]+)$/D', $k)) continue;
      $out .= ' ' . $k . '="' . ($k === 'src' ? esc_url($v) : esc_attr($v)) . '"';
    }
    return $out . '>';
  }

  return '';
}

/**
 * @param int|array|string $image ID, ACF array, or URL (URL = without srcset)
 */
function add_image_preload($image, string $sizes = '100vw') {
  $id = null; $url = null;

  if (is_array($image)) {
    $id  = $image['ID'] ?? $image['id'] ?? null;
    $url = $image['url'] ?? null;
  } elseif (is_numeric($image)) {
    $id = (int) $image;
  } elseif (is_string($image) && filter_var($image, FILTER_VALIDATE_URL)) {
    $url = $image;
  }

  $srcset = '';
  if ($id) {
    $url    = wp_get_attachment_image_url($id, 'full') ?: $url;
    $srcset = (string) wp_get_attachment_image_srcset($id, 'full');
  }
  if (empty($url)) return;

  $GLOBALS['theme_image_preloads'] = $GLOBALS['theme_image_preloads'] ?? [];
  $GLOBALS['theme_image_preloads'][$url] = ['srcset' => $srcset, 'sizes' => $sizes];
}

function print_image_preloads() {
  foreach ($GLOBALS['theme_image_preloads'] ?? [] as $url => $o) {
    printf(
      '<link rel="preload" as="image" href="%s"%s fetchpriority="high" />' . "\n",
      esc_url($url),
      $o['srcset'] ? sprintf(' imagesrcset="%s" imagesizes="%s"', esc_attr($o['srcset']), esc_attr($o['sizes'])) : ''
    );
  }
}

add_action('wp_head', 'print_image_preloads', 1);
