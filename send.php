<?php
/**
 * Obsługa formularza kontaktowego — Anioł Kompleksowe Usługi Pogrzebowe.
 * Lekki handler: walidacja + honeypot anty-spam + wysyłka e-mail.
 * Działa na dowolnym hostingu z PHP i skonfigurowaną funkcją mail().
 */

declare(strict_types=1);

$RECIPIENT = 'uslugipog.aniol@gmail.com';
$SUBJECT   = 'Wiadomość z formularza — uslugipogrzebowegdynia.com.pl';

function back(string $status): never {
    header('Location: kontakt.html?sent=' . $status . '#contactForm');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    back('0');
}

// Honeypot — pole "company" musi być puste (boty je wypełniają).
if (!empty($_POST['company'] ?? '')) {
    back('1'); // udajemy sukces, nic nie wysyłamy
}

$name    = trim((string)($_POST['name'] ?? ''));
$email   = trim((string)($_POST['email'] ?? ''));
$phone   = trim((string)($_POST['phone'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));
$agree   = ($_POST['agree'] ?? '') === 'tak';

// Walidacja wymaganych pól.
if ($name === '' || $message === '' || !$agree
    || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    back('0');
}

// Zabezpieczenie nagłówków przed wstrzyknięciem.
$clean = static fn(string $v): string => str_replace(["\r", "\n", "%0a", "%0d"], '', $v);
$name  = $clean($name);
$email = $clean($email);
$phone = $clean($phone);

$body  = "Nowa wiadomość z formularza kontaktowego:\n\n"
       . "Imię i nazwisko: {$name}\n"
       . "E-mail: {$email}\n"
       . "Telefon: " . ($phone !== '' ? $phone : '—') . "\n"
       . "Zgoda RODO: " . ($agree ? 'tak' : 'nie') . "\n\n"
       . "Wiadomość:\n{$message}\n";

$headers  = "From: Formularz WWW <no-reply@uslugipogrzebowegdynia.com.pl>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = @mail($RECIPIENT, '=?UTF-8?B?' . base64_encode($SUBJECT) . '?=', $body, $headers);

back($sent ? '1' : '0');
