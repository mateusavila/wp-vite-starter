<?php
function remove_emojis_frontend() {
  if (!is_admin()) {
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_print_styles', 'print_emoji_styles');
    remove_filter('the_content_feed', 'wp_staticize_emoji');
    remove_filter('comment_text_rss', 'wp_staticize_emoji');
    remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
    add_filter('tiny_mce_plugins', 'disable_emojis_tinymce_frontend');
  }
}
add_action('init', 'remove_emojis_frontend');

function disable_emojis_tinymce_frontend($plugins) {
  if (!is_admin() && is_array($plugins)) {
    return array_diff($plugins, array('wpemoji'));
  }
  return $plugins;
}
