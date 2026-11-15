<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/deployment/php/contact-core.php';

function check(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
}

$rateFile = tempnam(sys_get_temp_dir(), 'algebra-rate-');
if ($rateFile === false) throw new RuntimeException('Temporary file unavailable');
$server = [
    'REQUEST_METHOD' => 'POST',
    'HTTPS' => 'on',
    'HTTP_ORIGIN' => 'https://algebrateknoloji.com',
    'HTTP_SEC_FETCH_SITE' => 'same-origin',
    'CONTENT_TYPE' => 'application/json',
    'REMOTE_ADDR' => '192.0.2.1',
];
$form = [
    'type' => 'quote',
    'name' => 'Ayşe Yılmaz',
    'email' => 'ayse@example.com',
    'company' => 'Örnek AŞ',
    'interest' => 'Bilişim ve Veri Merkezi',
    'message' => 'Veri merkezimiz için kapsamlı bir teklif istiyoruz.',
    'notice' => true,
    'website' => '',
];
$captured = [];
$send = static function (array $submission) use (&$captured): void { $captured[] = $submission; };
$call = static fn(array $payload, array $headers = [], ?callable $sender = null) =>
    algebra_handle_contact(array_merge($server, $headers), json_encode($payload, JSON_UNESCAPED_UNICODE), $sender ?? $send, $rateFile);

try {
    foreach (['https://algebrateknoloji.com', 'https://attacker.example'] as $origin) {
        check(filter_var($origin, FILTER_VALIDATE_URL) !== false, 'Test Origin must be a valid URL');
    }
    check($call($form)['status'] === 200, 'Quote should be accepted');
    check(count($captured) === 1, 'Quote should reach sender once');
    check($captured[0]['email'] === 'ayse@example.com', 'Sender email must be retained for Reply-To');
    check($captured[0]['interest'] === 'Bilişim ve Veri Merkezi', 'Interest must be retained');
    check($captured[0]['date'] !== '', 'Submission date missing');
    $template = algebra_mail_contents(array_merge($captured[0], ['message' => '<script>alert(1)</script>']));
    check(strpos($template['html'], '<script>') === false, 'HTML message must be escaped');
    check(strpos($template['html'], '&lt;script&gt;') !== false, 'Escaped message missing');
    check(strpos($template['text'], '<script>') !== false, 'Plain text alternative missing');
    check($call(array_merge($form, ['type' => 'partner']))['status'] === 200, 'Partnership should be accepted');
    check($call(array_merge($form, ['type' => 'career', 'careerTopic' => 'internship']))['status'] === 200, 'Internship should be accepted');
    check($call(array_merge($form, ['type' => 'career', 'careerTopic' => 'general']), ['REMOTE_ADDR' => '192.0.2.4'])['status'] === 200, 'General career application should be accepted');
    check(end($captured)['type'] === 'Genel Başvuru', 'General career application must use the correct subject type');
    check($call(array_merge($form, ['type' => 'contact']), ['REMOTE_ADDR' => '192.0.2.5'])['status'] === 400, 'Unsupported contact type must be rejected');
    check($call(array_merge($form, ['type' => 'career']), ['REMOTE_ADDR' => '192.0.2.5'])['status'] === 400, 'Career topic is required');
    check($call(array_merge($form, ['email' => 'invalid']), ['REMOTE_ADDR' => '192.0.2.2'])['status'] === 400, 'Invalid email must be rejected');
    check($call(array_merge($form, ['message' => 'short']), ['REMOTE_ADDR' => '192.0.2.2'])['status'] === 400, 'Short message must be rejected');
    check($call(array_merge($form, ['notice' => false]), ['REMOTE_ADDR' => '192.0.2.2'])['status'] === 400, 'Missing consent must be rejected');
    check($call(array_merge($form, ['interest' => 'Unknown']), ['REMOTE_ADDR' => '192.0.2.2'])['status'] === 400, 'Unknown interest must be rejected');
    $beforeHoneypot = count($captured);
    check($call(array_merge($form, ['website' => 'spam.example']), ['REMOTE_ADDR' => '192.0.2.6'])['status'] === 200, 'Honeypot should return a harmless success');
    check(count($captured) === $beforeHoneypot, 'Honeypot must not call SMTP');
    check($call($form, ['HTTP_ORIGIN' => 'https://attacker.example'])['status'] === 403, 'Cross-origin must be rejected');
    check($call($form, ['HTTPS' => 'off', 'SERVER_PORT' => '80'])['status'] === 403, 'HTTP must be rejected');
    check($call($form, ['REMOTE_ADDR' => '192.0.2.3'], static function (array $submission): void { throw new RuntimeException('Mock SMTP failure'); })['status'] === 502, 'SMTP failure must be reported safely');
    check(algebra_handle_contact(array_merge($server, ['REMOTE_ADDR' => '192.0.2.7']), '{broken', $send, $rateFile)['status'] === 400, 'Malformed JSON must be rejected');
    check($call($form, ['REQUEST_METHOD' => 'GET'])['status'] === 405, 'GET must be rejected');
    check($call($form, ['CONTENT_TYPE' => 'text/plain'])['status'] === 415, 'Non-JSON request must be rejected');
    check($call($form, ['CONTENT_TYPE' => 'application/jsonp'])['status'] === 415, 'JSON-like media type must be rejected');
    check($call($form, ['CONTENT_LENGTH' => '16001'])['status'] === 413, 'Oversized body must be rejected');
    check($call($form)['status'] === 200, 'Fourth request should be accepted');
    check($call($form)['status'] === 200, 'Fifth request should be accepted');
    check($call($form)['status'] === 429, 'Sixth request must be rate limited');
    check(count($captured) === $beforeHoneypot + 2, 'Rejected and limited requests must not reach SMTP');
    $globalRateFile = tempnam(sys_get_temp_dir(), 'algebra-global-rate-');
    if ($globalRateFile === false) throw new RuntimeException('Global rate fixture unavailable');
    try {
        $globalCount = 0;
        $globalSend = static function (array $submission) use (&$globalCount): void { $globalCount++; };
        for ($i = 1; $i <= 100; $i++) {
            $uniqueServer = array_merge($server, ['REMOTE_ADDR' => '198.51.100.' . $i]);
            check(algebra_handle_contact($uniqueServer, json_encode($form), $globalSend, $globalRateFile)['status'] === 200, 'First 100 global requests should be accepted');
        }
        check(algebra_handle_contact(array_merge($server, ['REMOTE_ADDR' => '198.51.100.101']), json_encode($form), $globalSend, $globalRateFile)['status'] === 429, 'Global request 101 must be limited');
        check($globalCount === 100, 'Global rate limit must prevent sending');
    } finally {
        @unlink($globalRateFile);
    }
    $configFile = tempnam(sys_get_temp_dir(), 'algebra-config-');
    if ($configFile === false) throw new RuntimeException('Config fixture unavailable');
    try {
        $loadFixture = static function (string $source) use ($configFile): array {
            if (file_put_contents($configFile, $source) === false) throw new RuntimeException('Cannot write config fixture');
            if (function_exists('opcache_invalidate')) @opcache_invalidate($configFile, true);
            clearstatcache(true, $configFile);
            return algebra_load_config($configFile);
        };
        $fixture = [
            'host' => 'smtp.example.test', 'port' => 465, 'encryption' => 'SSL/TLS',
            'username' => 'sender@example.test', 'password' => 'dummy-test-value',
            'from_email' => 'sender@example.test', 'to_email' => 'recipient@example.test',
        ];
        check($loadFixture('<?php return ' . var_export($fixture, true) . ';')['port'] === 465, 'Returned-array config contract must load');
        check($loadFixture('<?php $smtpConfig = ' . var_export($fixture, true) . ';')['host'] === 'smtp.example.test', 'Variable-array config contract must load');
        check($loadFixture('<?php $config = ' . var_export($fixture, true) . ';')['host'] === 'smtp.example.test', 'Generic config-array contract must load');
        check($loadFixture('<?php $smtp_config = ' . var_export($fixture, true) . ';')['host'] === 'smtp.example.test', 'Snake-case config-array contract must load');
        $localVariables = '<?php ';
        foreach ($fixture as $key => $value) $localVariables .= '$' . $key . ' = ' . var_export($value, true) . '; ';
        check($loadFixture($localVariables)['host'] === 'smtp.example.test', 'Local-variable config contract must load');
        $invalidConfigRejected = false;
        try { $loadFixture('<?php return ' . var_export(array_merge($fixture, ['port' => 587]), true) . ';'); }
        catch (RuntimeException $error) { $invalidConfigRejected = true; }
        check($invalidConfigRejected, 'Non-465 SMTP configuration must be rejected');
        $startTlsRejected = false;
        try { $loadFixture('<?php return ' . var_export(array_merge($fixture, ['encryption' => 'tls']), true) . ';'); }
        catch (RuntimeException $error) { $startTlsRejected = true; }
        check($startTlsRejected, 'STARTTLS must not be accepted for implicit TLS on port 465');
    } finally {
        @unlink($configFile);
    }
    echo "PHP contact tests passed.\n";
} finally {
    @unlink($rateFile);
}
