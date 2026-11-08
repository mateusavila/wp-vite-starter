<?php
$type = $args['type'] ?? 'button';
$type = in_array($type, ['button', 'submit', 'reset'], true) ? $type : 'button';
?>
<button type="<?php echo esc_attr($type); ?>" class="<?php echo esc_attr($args['classes'] ?? ''); ?>">
    <?php echo esc_html($args['label'] ?? ''); ?>
</button>
