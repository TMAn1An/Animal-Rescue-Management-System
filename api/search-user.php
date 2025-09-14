<?php
require_once '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

$phone = sanitizeInput($_POST['phone'] ?? '');

// Validate input
if (empty($phone)) {
    jsonResponse(false, 'Phone number is required');
}

try {
    $pdo = getDB();
    
    // Search for user by phone
    $stmt = $pdo->prepare("SELECT * FROM users WHERE phone = ?");
    $stmt->execute([$phone]);
    $user = $stmt->fetch();
    
    if ($user) {
        jsonResponse(true, 'User found', $user);
    } else {
        jsonResponse(false, 'No user found with this phone number');
    }
    
} catch (PDOException $e) {
    jsonResponse(false, 'Database error: ' . $e->getMessage());
} catch (Exception $e) {
    jsonResponse(false, 'Error: ' . $e->getMessage());
}
?>
