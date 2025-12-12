<?php
header('Content-Type: application/json; charset=utf-8');

$keyHex = 'd5f89c0aa788473fbf917d9749d04a2616c2771d3f4aaf9de3e1b669acf057cd';
$key    = hex2bin($keyHex);

$iv = random_bytes(16);

$blocklist = [
    "Annisa Umulfath", "annisa umulfath", "ANNISA UMULFATH",
    "iman", "Iman", "Firman", "firman", "virza", "VIRZA", "Virza", "FIRMAN", "IMAN",
    "Rizki", "rizki", "Nisa", "Pirja", "pirja", "PIRJA", "NISA", "RIZKI",
    "Vierza Vandifa", "vierza vandifa", "VIERZA VANDIFA",
    "vierza", "vandifa", "Vierza", "Vandifa", "Andika", "andika", 
    "IMAN", "FIRMAN", "RIZKI", "NISA", "PIRJA", "ANDIKA",
    "RIZKI ANDIKA SETIADI", "rizki andika setiadi", "Rizki Andika Setiadi",
    "Setiadi", "setiadi", "SETIADI", "persa", "Persa", "PERSA",
    "firmansyah", "Firmansyah", "FIRMANSYAH", "umulfath", "Umulfath", "UMULFATH",
    "Muhammad Rizky Firmansyah", "muhammad rizky firmansyah", "MUHAMMAD RIZKY FIRMANSYAH",
    "91124080", "91124079", "91124082", "91124077"
];

$plaintext = json_encode($blocklist, JSON_UNESCAPED_UNICODE);

$cipherRaw = openssl_encrypt(
    $plaintext,
    'AES-256-CBC',
    $key,
    OPENSSL_RAW_DATA,
    $iv
);

if ($cipherRaw === false) {
    http_response_code(500);
    echo json_encode(['error' => 'encrypt_failed']);
    exit;
}

echo json_encode([
    'cipher' => base64_encode($cipherRaw),
    'iv'     => base64_encode($iv)
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
