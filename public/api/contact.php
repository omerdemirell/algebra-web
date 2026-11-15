<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

try {
    require_once '/home/sar367nsaacomtr/algebra-mail-config/contact-core.php';
    $raw = file_get_contents('php://input', false, null, 0, 16001);
    $result = algebra_handle_contact($_SERVER, $raw === false ? '' : $raw, 'algebra_send_mail');
    http_response_code($result['status']);
    if ($result['status'] === 429) {
        header('Retry-After: 900');
    }
    echo json_encode(['ok' => $result['ok'], 'code' => $result['code']], JSON_UNESCAPED_UNICODE);
} catch (Throwable $error) {
    error_log('[algebra-mail] endpoint_failure');
    http_response_code(503);
    echo '{"ok":false,"code":"unavailable"}';
}
