<section>
    <?php get_template_part('blocks/title/base', null, [
        't' => $args['title'] ?? get_bloginfo('name'),
        'tag' => $args['tag'] ?? 'h1',
    ]); ?>
    <?php if (!empty($args['text'])) : ?>
        <?php get_template_part('blocks/text/base', null, ['t' => $args['text']]); ?>
    <?php endif; ?>
</section>
