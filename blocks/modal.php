<?php $id = wp_unique_id('modal-'); ?>
<button type="button" data-modal="<?php echo esc_attr($id); ?>" aria-haspopup="dialog">
    <?php echo esc_html($args['trigger'] ?? __('Open', 'wp-vite-starter')); ?>
</button>

<dialog id="<?php echo esc_attr($id); ?>" aria-labelledby="<?php echo esc_attr($id . '-title'); ?>">
    <h2 id="<?php echo esc_attr($id . '-title'); ?>">
        <?php echo esc_html($args['title'] ?? __('Dialog', 'wp-vite-starter')); ?>
    </h2>
    <?php echo wp_kses_post($args['text'] ?? ''); ?>
    <form method="dialog">
        <button type="submit"><?php esc_html_e('Close', 'wp-vite-starter'); ?></button>
    </form>
</dialog>
