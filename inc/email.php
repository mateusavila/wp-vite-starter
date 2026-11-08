<?php

function wp_vite_send_email(string $to, string $subject, string $message): bool {
    return wp_mail($to, $subject, $message);
}
