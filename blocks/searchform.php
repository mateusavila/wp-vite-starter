<form role="search" method="get" action="<?php echo esc_url(home_url('/')); ?>">
    <?php get_template_part('blocks/token/input', null, [
        'id' => wp_unique_id('search-'),
        'label' => __('Search', 'wp-vite-starter'),
        'name' => 's',
        'type' => 'search',
        'value' => get_search_query(false),
    ]); ?>
    <?php get_template_part('blocks/button/base', null, [
        'label' => __('Search', 'wp-vite-starter'),
        'type' => 'submit',
    ]); ?>
</form>
