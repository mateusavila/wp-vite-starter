<?php

$args['classes'] = trim('rounded bg-slate-900 px-4 py-2 text-white ' . ($args['classes'] ?? ''));
get_template_part('blocks/button/base', null, $args);
