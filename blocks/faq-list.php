<?php foreach ($args['items'] ?? [] as $item) : ?>
    <?php get_template_part('blocks/faq', null, $item); ?>
<?php endforeach; ?>
