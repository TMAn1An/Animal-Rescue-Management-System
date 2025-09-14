<?php
require_once '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

$name = sanitizeInput($_POST['name'] ?? '');
$phone = sanitizeInput($_POST['phone'] ?? '');

// Validate input
if (empty($name) || empty($phone)) {
    jsonResponse(false, 'Name and phone are required');
}

// Validate phone format (basic validation)
if (!preg_match('/^01[0-9]{9}$/', $phone)) {
    jsonResponse(false, 'Invalid phone number format');
}

try {
    $pdo = getDB();
    
    // Check if phone already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE phone = ?");
    $stmt->execute([$phone]);
    
    if ($stmt->fetch()) {
        jsonResponse(false, 'Phone number already exists in the system');
    }
    
    // Generate next user code
    $userCode = generateNextUserCode($pdo);
    
    // Insert new user
    $stmt = $pdo->prepare("INSERT INTO users (user_code, name, phone) VALUES (?, ?, ?)");
    $result = $stmt->execute([$userCode, $name, $phone]);
    
    if ($result) {
        jsonResponse(true, "User registered successfully! User Code: $userCode", [
            'user_id' => $pdo->lastInsertId(),
            'user_code' => $userCode,
            'name' => $name,
            'phone' => $phone
        ]);
    } else {
        jsonResponse(false, 'Failed to register user');
    }
    
} catch (PDOException $e) {
    jsonResponse(false, 'Database error: ' . $e->getMessage());
} catch (Exception $e) {
    jsonResponse(false, 'Error: ' . $e->getMessage());
}
?>
