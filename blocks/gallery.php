<?php if (!empty($args['ids'])) : ?>
    <ul>
        <?php foreach ($args['ids'] as $attachment_id) : ?>
            <li><?php echo wp_get_attachment_image((int) $attachment_id, 'large'); ?></li>
        <?php endforeach; ?>
    </ul>
<?php endif; ?>
