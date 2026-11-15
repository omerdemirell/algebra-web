<?php
declare(strict_types=1);

const ALGEBRA_MAIL_DIR = '/home/sar367nsaacomtr/algebra-mail-config';
const ALGEBRA_MAIL_ORIGINS = ['https://algebrateknoloji.com', 'https://www.algebrateknoloji.com'];
const ALGEBRA_MAIL_INTERESTS = [
    'Yazılım ve Dijital Teknolojiler',
    'Bilişim ve Veri Merkezi',
    'Enerji ve Yenilenebilir Enerji',
    'Mühendislik ve Danışmanlık',
    'İş Birliği',
    'Diğer',
];

function algebra_reply(int $status, string $code): array
{
    return ['status' => $status, 'ok' => $status === 200, 'code' => $code];
}

function algebra_valid_text($value, int $min, int $max, bool $allowLines = false): bool
{
    if (!is_string($value) || !preg_match('//u', $value)) return false;
    $value = trim($value);
    $length = function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : preg_match_all('/./us', $value);
    if ($length < $min || $length > $max) return false;
    return !preg_match($allowLines ? '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/' : '/[\x00-\x1F\x7F]/', $value);
}

function algebra_rate_limit(string $ip, string $rateFile): ?bool
{
    $handle = @fopen($rateFile, 'c+');
    if ($handle === false) return null;
    @chmod($rateFile, 0600);
    if (!flock($handle, LOCK_EX)) { fclose($handle); return null; }
    $raw = stream_get_contents($handle);
    $stored = json_decode($raw ?: '{}', true);
    if (!is_array($stored)) $stored = [];
    $now = time();
    $fresh = [];
    foreach ($stored as $key => $times) {
        if (!is_array($times)) continue;
        $times = array_values(array_filter($times, static fn($time) => is_int($time) && $time > $now - 900));
        if ($times) $fresh[$key] = $times;
    }
    $key = hash('sha256', $ip);
    $total = array_sum(array_map('count', $fresh));
    $allowed = count($fresh[$key] ?? []) < 5 && $total < 100;
    if ($allowed) $fresh[$key][] = $now;
    $encoded = json_encode($fresh, JSON_THROW_ON_ERROR);
    rewind($handle);
    $truncated = ftruncate($handle, 0);
    $written = $truncated ? fwrite($handle, $encoded) : false;
    $flushed = fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    return $written === strlen($encoded) && $flushed ? $allowed : null;
}

function algebra_handle_contact(array $server, string $raw, callable $send, ?string $rateFile = null): array
{
    if (($server['REQUEST_METHOD'] ?? '') !== 'POST') return algebra_reply(405, 'method');
    $secure = ($server['HTTPS'] ?? '') === 'on' || (string)($server['SERVER_PORT'] ?? '') === '443';
    if (!$secure) return algebra_reply(403, 'https_required');
    if (!in_array($server['HTTP_ORIGIN'] ?? '', ALGEBRA_MAIL_ORIGINS, true)) return algebra_reply(403, 'origin');
    if (($server['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') return algebra_reply(403, 'origin');
    if (!preg_match('/^application\/json(?:\s*;|\s*$)/i', (string)($server['CONTENT_TYPE'] ?? ''))) return algebra_reply(415, 'content_type');
    if (strlen($raw) > 16000 || (int)($server['CONTENT_LENGTH'] ?? 0) > 16000) return algebra_reply(413, 'too_large');

    try { $data = json_decode($raw, true, 16, JSON_THROW_ON_ERROR); }
    catch (JsonException $error) { return algebra_reply(400, 'invalid_json'); }
    if (!is_array($data)) return algebra_reply(400, 'invalid_json');
    if (!empty($data['website'])) return algebra_reply(200, 'sent');

    $types = [
        'quote' => 'Teklif Talebi',
        'partner' => 'İş Birliği Başvurusu',
        'career' => (($data['careerTopic'] ?? '') === 'internship' ? 'Staj Başvurusu' : 'Genel Başvuru'),
    ];
    $type = $data['type'] ?? null;
    if (!is_string($type) || !array_key_exists($type, $types)) return algebra_reply(400, 'invalid_fields');
    if ($type === 'career' && !in_array($data['careerTopic'] ?? null, ['general', 'internship'], true)) return algebra_reply(400, 'invalid_fields');
    if (
        !algebra_valid_text($data['name'] ?? null, 2, 120) ||
        !algebra_valid_text($data['email'] ?? null, 5, 254) ||
        !filter_var($data['email'], FILTER_VALIDATE_EMAIL) ||
        !algebra_valid_text($data['company'] ?? '', 0, 160) ||
        !in_array($data['interest'] ?? null, ALGEBRA_MAIL_INTERESTS, true) ||
        !algebra_valid_text($data['message'] ?? null, 20, 5000, true) ||
        ($data['notice'] ?? null) !== true
    ) return algebra_reply(400, 'invalid_fields');

    $ip = (string)($server['REMOTE_ADDR'] ?? 'unknown');
    $rateAllowed = algebra_rate_limit($ip, $rateFile ?? ALGEBRA_MAIL_DIR . '/contact-rate.json');
    if ($rateAllowed === null) return algebra_reply(503, 'unavailable');
    if ($rateAllowed === false) return algebra_reply(429, 'rate_limited');

    $submission = [
        'type' => $types[$type],
        'name' => trim($data['name']),
        'email' => trim($data['email']),
        'company' => trim($data['company'] ?? ''),
        'interest' => $data['interest'],
        'message' => trim($data['message']),
        'date' => (new DateTimeImmutable('now', new DateTimeZone('Europe/Istanbul')))->format('d.m.Y H:i T'),
    ];
    $id = bin2hex(random_bytes(6));
    try {
        $send($submission);
        error_log('[algebra-mail] sent id=' . $id);
        return algebra_reply(200, 'sent');
    } catch (Throwable $error) {
        error_log('[algebra-mail] delivery_failed id=' . $id);
        return algebra_reply(502, 'delivery_failed');
    }
}

function algebra_load_config(string $path): array
{
    $values = (static function (string $path): array {
        $result = require $path;
        if (is_array($result)) return $result;
        foreach (['smtpConfig', 'smtp_config', 'config'] as $name) {
            if (isset($$name) && is_array($$name)) return $$name;
        }
        return array_intersect_key(get_defined_vars(), array_flip(['host', 'port', 'encryption', 'username', 'password', 'from_email', 'to_email']));
    })($path);
    foreach (['host', 'port', 'encryption', 'username', 'password', 'from_email', 'to_email'] as $key) {
        if (empty($values[$key])) throw new RuntimeException('Incomplete SMTP configuration');
    }
    if ((int)$values['port'] !== 465 || !in_array(strtolower((string)$values['encryption']), ['ssl', 'ssl/tls', 'smtps'], true)) {
        throw new RuntimeException('SMTP configuration does not match implicit TLS on port 465');
    }
    return $values;
}

function algebra_escape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function algebra_mail_contents(array $submission): array
{
    $rows = [
        'Form' => $submission['type'],
        'Tarih' => $submission['date'],
        'Ad Soyad' => $submission['name'],
        'E-posta' => $submission['email'],
        'Şirket / Kurum veya Uzmanlık' => $submission['company'] ?: 'Belirtilmedi',
        'İlgi Alanı' => $submission['interest'],
    ];
    $htmlRows = '';
    $textRows = [];
    foreach ($rows as $label => $value) {
        $htmlRows .= '<tr><th style="text-align:left;padding:10px 14px;border-bottom:1px solid #e7e8ec;color:#5d6470;vertical-align:top">' . algebra_escape($label) . '</th><td style="padding:10px 14px;border-bottom:1px solid #e7e8ec;color:#171a21">' . algebra_escape($value) . '</td></tr>';
        $textRows[] = $label . ': ' . $value;
    }
    $message = algebra_escape($submission['message']);
    return [
        'html' => '<!doctype html><html lang="tr"><head><meta charset="UTF-8"></head><body style="margin:0;padding:24px;background:#f4f5f7;font-family:Arial,sans-serif;color:#171a21"><div style="max-width:640px;margin:auto;background:#fff;border:1px solid #e7e8ec"><div style="padding:22px 24px;border-top:4px solid #c90025"><strong style="font-size:20px">Algebra Teknoloji</strong><div style="margin-top:6px;color:#5d6470">Web sitesi form bildirimi</div></div><table style="width:100%;border-collapse:collapse;font-size:14px">' . $htmlRows . '</table><div style="padding:20px 24px"><strong>Mesaj</strong><p style="line-height:1.6;white-space:pre-wrap">' . $message . '</p></div><div style="padding:16px 24px;background:#f4f5f7;color:#5d6470;font-size:12px">Bu e-posta Algebra Teknoloji web sitesi aracılığıyla size ulaşmıştır.</div></div></body></html>',
        'text' => implode("\n", $textRows) . "\n\nMesaj:\n" . $submission['message'] . "\n\nBu e-posta Algebra Teknoloji web sitesi aracılığıyla size ulaşmıştır.",
    ];
}

function algebra_send_mail(array $submission): void
{
    $base = ALGEBRA_MAIL_DIR;
    $config = algebra_load_config($base . '/smtp-config.php');
    require_once $base . '/phpmailer/src/Exception.php';
    require_once $base . '/phpmailer/src/PHPMailer.php';
    require_once $base . '/phpmailer/src/SMTP.php';

    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = (string)$config['host'];
    $mail->Port = (int)$config['port'];
    $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
    $mail->SMTPAuth = true;
    $mail->Username = (string)$config['username'];
    $mail->Password = (string)$config['password'];
    $mail->Timeout = 15;
    $mail->SMTPDebug = 0;
    $mail->CharSet = 'UTF-8';
    $mail->Encoding = 'base64';
    $mail->setFrom((string)$config['from_email'], 'Algebra Teknoloji Web Sitesi');
    $mail->addAddress((string)$config['to_email']);
    $mail->addReplyTo($submission['email'], $submission['name']);
    $mail->Subject = $submission['type'] . ' — ' . $submission['interest'];
    $contents = algebra_mail_contents($submission);
    $mail->isHTML(true);
    $mail->Body = $contents['html'];
    $mail->AltBody = $contents['text'];
    $mail->send();
}
