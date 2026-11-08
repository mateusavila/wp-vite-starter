<?php get_template_part('blocks/token/label', null, $args); ?>
<textarea
    id="<?php echo esc_attr($args['id']); ?>"
    name="<?php echo esc_attr($args['name']); ?>"
    <?php if (!empty($args['required'])) : ?>required<?php endif; ?>
><?php echo esc_textarea($args['value'] ?? ''); ?></textarea>
