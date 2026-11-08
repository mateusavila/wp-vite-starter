<?php get_template_part('blocks/token/label', null, $args); ?>
<input
    id="<?php echo esc_attr($args['id']); ?>"
    name="<?php echo esc_attr($args['name']); ?>"
    type="<?php echo esc_attr($args['type'] ?? 'text'); ?>"
    value="<?php echo esc_attr($args['value'] ?? ''); ?>"
    <?php if (!empty($args['required'])) : ?>required<?php endif; ?>
>
