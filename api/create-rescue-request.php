<?php
require_once '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

$user_code = sanitizeInput($_POST['user_code'] ?? '');
$pet_type = sanitizeInput($_POST['pet_type'] ?? '');
$pet_condition = sanitizeInput($_POST['pet_condition'] ?? '');
$location = sanitizeInput($_POST['location'] ?? '');
$situation_description = sanitizeInput($_POST['situation_description'] ?? '');
$additional_note = sanitizeInput($_POST['additional_note'] ?? '');
$donation_amount = $_POST['donation_amount'] ?? null;

// Validate required fields
if (empty($user_code) || empty($pet_type) || empty($pet_condition) || empty($location) || empty($situation_description)) {
    jsonResponse(false, 'User code, pet type, pet condition, location, and situation description are required');
}

// Validate pet condition
if (!in_array($pet_condition, ['Normal', 'Moderate', 'Serious'])) {
    jsonResponse(false, 'Invalid pet condition');
}

// Validate service area: Dhaka-only
$locLower = mb_strtolower($location, 'UTF-8');
if (strpos($locLower, 'dhaka') === false) {
    jsonResponse(false, 'We currently serve only within Dhaka. Please provide a Dhaka location.');
}

// Validate donation amount
if ($donation_amount !== null && $donation_amount !== '') {
    $donation_amount = floatval($donation_amount);
    if ($donation_amount < 0) {
        jsonResponse(false, 'Donation amount cannot be negative');
    }
} else {
    $donation_amount = null;
}

try {
    $pdo = getDB();
    
    // Verify user exists and get user ID
    $stmt = $pdo->prepare("SELECT id FROM users WHERE user_code = ?");
    $stmt->execute([$user_code]);
    $user = $stmt->fetch();
    
    if (!$user) {
        jsonResponse(false, 'User code not found. Please check the user code or register first.');
    }
    
    $user_id = $user['id'];
    
    // Insert rescue request
    $stmt = $pdo->prepare("
        INSERT INTO rescue_requests 
        (user_id, pet_type, pet_condition, location, situation_description, additional_note, donation_amount) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $result = $stmt->execute([
        $user_id,
        $pet_type,
        $pet_condition,
        $location,
        $situation_description,
        $additional_note,
        $donation_amount
    ]);
    
    if ($result) {
        jsonResponse(true, "Rescue request created successfully! Request ID: " . $pdo->lastInsertId(), [
            'request_id' => $pdo->lastInsertId(),
            'user_code' => $user_code,
            'pet_type' => $pet_type,
            'pet_condition' => $pet_condition
        ]);
    } else {
        jsonResponse(false, 'Failed to create rescue request');
    }
    
} catch (PDOException $e) {
    jsonResponse(false, 'Database error: ' . $e->getMessage());
} catch (Exception $e) {
    jsonResponse(false, 'Error: ' . $e->getMessage());
}
?>
