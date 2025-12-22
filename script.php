<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

$data = json_decode(file_get_contents("php://input"), true);
$names = $data["names"] ?? null;

if (!is_array($names)) {
    echo json_encode(["ok" => false, "message" => "Invalid payload"]);
    exit;
}

function norm($s)
{
    $s = mb_strtolower(trim((string) $s), "UTF-8");
    // normalisasi whitespace (termasuk NBSP, tab, dll) -> 1 spasi
    $s = preg_replace('/\s+/u', ' ', $s);
    // buang karakter selain huruf/angka/spasi
    $s = preg_replace('/[^\p{L}\p{N} ]+/u', '', $s);
    // trim lagi
    $s = trim($s);
    return $s ?? "";
}

$blocked_raw = [
    "annisa umulfath",
    "iman",
    "firman",
    "virza",
    "rizki",
    "nisa",
    "pirja",
    "andika",
    "vierza vandifa",
    "vierza",
    "vandifa",
    "rizki andika setiadi",
    "setiadi",
    "persa",
    "firmansyah",
    "umulfath",
    "muhammad rizky firmansyah",
    "91124080",
    "91124079",
    "91124082",
    "91124077"
];

$blocked = array_map("norm", $blocked_raw);

$valid = [];

foreach ($names as $i => $n) {
    $cand = norm($n);
    if ($cand === "")
        continue;

    $ok = true;
    foreach ($blocked as $b) {
        if ($b === "")
            continue;

        // contains match
        if (mb_strpos($cand, $b, 0, "UTF-8") !== false) {
            $ok = false;
            break;
        }
    }

    if ($ok)
        $valid[] = $i;
}

if (count($valid) > 0) {
    $pickIndex = $valid[random_int(0, count($valid) - 1)];
} else {
    $pickIndex = random_int(0, count($names) - 1);
}

echo json_encode([
    "ok" => true,
    "index" => $pickIndex
], JSON_UNESCAPED_UNICODE);
exit;
