<section>
    <h2><?php echo esc_html($args['title'] ?? __('Newsletter', 'wp-vite-starter')); ?></h2>
    <?php get_template_part('blocks/form-newsletter'); ?>
</section>
