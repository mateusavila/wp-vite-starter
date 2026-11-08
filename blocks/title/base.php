<?php
$tag = $args['tag'] ?? 'h2';
$tag = in_array($tag, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], true) ? $tag : 'h2';
?>
<<?php echo $tag; ?> class="<?php echo esc_attr($args['classes'] ?? ''); ?>">
    <?php echo esc_html($args['t'] ?? ''); ?>
</<?php echo $tag; ?>>
