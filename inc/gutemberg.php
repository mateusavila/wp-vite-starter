<?php

add_action('init', static function (): void {
    // Optional entry point for native blocks added later with block.json.
    foreach (glob(__DIR__ . '/../gutemberg/*/block.json') ?: [] as $metadata) {
        register_block_type(dirname($metadata));
    }
});
