<details>
    <summary><?php echo esc_html($args['question'] ?? ''); ?></summary>
    <?php get_template_part('blocks/text/base', null, ['t' => $args['answer'] ?? '']); ?>
</details>
