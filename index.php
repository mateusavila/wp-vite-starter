<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a class="skip-link" href="#main-content"><?php esc_html_e('Skip to content', 'wp-vite-starter'); ?></a>

<header class="site-header">
    <a href="<?php echo esc_url(home_url('/')); ?>"><?php bloginfo('name'); ?></a>
</header>

<main id="main-content" tabindex="-1">
    <?php get_template_part('blocks/searchform'); ?>
    <?php if (have_posts()) : ?>
        <?php while (have_posts()) : the_post(); ?>
            <article <?php post_class(); ?>>
                <?php if (is_singular()) : ?>
                    <h1><?php the_title(); ?></h1>
                    <?php the_content(); ?>
                    <?php wp_link_pages(); ?>
                <?php else : ?>
                    <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                    <?php the_excerpt(); ?>
                <?php endif; ?>
            </article>
        <?php endwhile; ?>

        <?php get_template_part('blocks/pagination'); ?>
    <?php else : ?>
        <h1><?php esc_html_e('No content found', 'wp-vite-starter'); ?></h1>
    <?php endif; ?>
</main>

<?php wp_footer(); ?>
</body>
</html>
