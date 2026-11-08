<?php if (!empty($args['items'])) : ?>
    <nav aria-label="<?php esc_attr_e('Breadcrumb', 'wp-vite-starter'); ?>">
        <ol>
            <?php foreach ($args['items'] as $item) : ?>
                <li>
                    <?php if (!empty($item['href'])) : ?>
                        <?php get_template_part('blocks/link/base', null, $item); ?>
                    <?php else : ?>
                        <span aria-current="page"><?php echo esc_html($item['t'] ?? ''); ?></span>
                    <?php endif; ?>
                </li>
            <?php endforeach; ?>
        </ol>
    </nav>
<?php endif; ?>
