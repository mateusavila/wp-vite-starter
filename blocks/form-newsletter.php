<form method="post" action="<?php echo esc_url(rest_url('wp-vite-starter/v1/save-newsletter')); ?>" data-newsletter-form>
    <?php get_template_part('blocks/token/input', null, [
        'id' => wp_unique_id('newsletter-email-'),
        'label' => __('Email address', 'wp-vite-starter'),
        'name' => 'email',
        'type' => 'email',
        'required' => true,
    ]); ?>
    <button type="submit"><?php esc_html_e('Sign up', 'wp-vite-starter'); ?></button>
    <p role="status"
        data-newsletter-status
        data-error="<?php esc_attr_e('Could not save your signup.', 'wp-vite-starter'); ?>"></p>
</form>
