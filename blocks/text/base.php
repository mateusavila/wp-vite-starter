<?php
$tag = $args['tag'] ?? 'p';
$tag = in_array($tag, ['p', 'span', 'div'], true) ? $tag : 'p';
?>
<<?php echo $tag; ?> class="<?php echo esc_attr($args['classes'] ?? ''); ?>">
    <?php echo wp_kses_post($args['t'] ?? ''); ?>
</<?php echo $tag; ?>>
