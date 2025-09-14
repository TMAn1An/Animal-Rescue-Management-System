<?php
require_once '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

$user_id = intval($_POST['user_id'] ?? 0);
$name = sanitizeInput($_POST['name'] ?? '');
$phone = sanitizeInput($_POST['phone'] ?? '');

// Validate input
if (!$user_id || empty($name) || empty($phone)) {
    jsonResponse(false, 'User ID, name, and phone are required');
}

// Validate phone format
if (!preg_match('/^01[0-9]{9}$/', $phone)) {
    jsonResponse(false, 'Invalid phone number format');
}

try {
    $pdo = getDB();
    
    // Check if phone already exists for other users
    $stmt = $pdo->prepare("SELECT id FROM users WHERE phone = ? AND id != ?");
    $stmt->execute([$phone, $user_id]);
    
    if ($stmt->fetch()) {
        jsonResponse(false, 'Phone number already exists for another user');
    }
    
    // Update user
    $stmt = $pdo->prepare("UPDATE users SET name = ?, phone = ? WHERE id = ?");
    $result = $stmt->execute([$name, $phone, $user_id]);
    
    if ($result && $stmt->rowCount() > 0) {
        jsonResponse(true, "User updated successfully!", [
            'user_id' => $user_id,
            'name' => $name,
            'phone' => $phone
        ]);
    } else {
        jsonResponse(false, 'No changes made or user not found');
    }
    
} catch (PDOException $e) {
    jsonResponse(false, 'Database error: ' . $e->getMessage());
} catch (Exception $e) {
    jsonResponse(false, 'Error: ' . $e->getMessage());
}
?>
