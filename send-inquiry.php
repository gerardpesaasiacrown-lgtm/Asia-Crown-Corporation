<?php
/**
 * Asia Crown Corporation - Website Inquiry Email Handler
 *
 * HTML form must use:
 * <form action="send-inquiry.php" method="post">
 *
 * Hosting must support PHP and PHP mail().
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html');
    exit;
}

$to = 'info@asiacrowncorporation.com';

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$phone   = trim($_POST['phone'] ?? '');
$model   = trim($_POST['model'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $phone === '' || $model === '' || $message === '') {
    showResult('Incomplete Information', 'Please complete all required fields before sending your inquiry.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    showResult('Invalid Email Address', 'Please enter a valid email address.');
}

// Prevent email-header injection.
$name  = str_replace(["\r", "\n"], ' ', $name);
$email = str_replace(["\r", "\n"], ' ', $email);

$subject = 'New Website Inquiry - Asia Crown Corporation';

$body  = "ASIA CROWN CORPORATION\n";
$body .= "NEW WEBSITE INQUIRY\n";
$body .= "========================================\n\n";
$body .= "Full Name:\n" . $name . "\n\n";
$body .= "Email Address:\n" . $email . "\n\n";
$body .= "Phone Number:\n" . $phone . "\n\n";
$body .= "Interested House Model:\n" . $model . "\n\n";
$body .= "Message:\n" . $message . "\n\n";
$body .= "========================================\n";
$body .= "Submitted through the Asia Crown Corporation website.\n";

$headers  = "From: Asia Crown Website <info@asiacrowncorporation.com>\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

if (mail($to, $subject, $body, $headers)) {
    showResult('Thank You!', 'Your inquiry has been successfully sent to Asia Crown Corporation. Our team will contact you soon.');
} else {
    showResult('Unable to Send Inquiry', 'The website could not send your inquiry at this time. Please contact info@asiacrowncorporation.com directly.');
}

function showResult($title, $message) {
    $title = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    echo '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>' . $title . ' | Asia Crown Corporation</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:30px;background:#f7f6f3;font-family:Arial,Helvetica,sans-serif}.result-box{width:100%;max-width:620px;padding:50px 40px;background:#fff;text-align:center;border-radius:10px;box-shadow:0 8px 35px rgba(0,0,0,.08)}h1{margin:0 0 20px;color:#19337d;font-size:38px}.result-box p{margin:0 auto;max-width:500px;color:#526174;font-size:18px;line-height:1.7}.back-button{display:inline-block;margin-top:28px;padding:15px 28px;background:#19337d;color:#fff;text-decoration:none;font-weight:700}.back-button:hover{background:#ffb304;color:#19337d}
</style>
</head><body><div class="result-box"><h1>' . $title . '</h1><p>' . nl2br($message) . '</p><a class="back-button" href="index.html">BACK TO WEBSITE</a></div></body></html>';
    exit;
}
?>
