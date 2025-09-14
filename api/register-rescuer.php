<?php
require_once '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

$name = sanitizeInput($_POST['name'] ?? '');
$nid = sanitizeInput($_POST['nid'] ?? '');
$phone = sanitizeInput($_POST['phone'] ?? '');

// Validate input
if (empty($name) || empty($nid) || empty($phone)) {
    jsonResponse(false, 'Name, NID, and phone are required');
}

// Validate phone format (basic validation)
if (!preg_match('/^01[0-9]{9}$/', $phone)) {
    jsonResponse(false, 'Invalid phone number format');
}

// Validate NID format (basic validation)
if (!preg_match('/^[0-9]{10,17}$/', $nid)) {
    jsonResponse(false, 'Invalid National ID format');
}

try {
    $pdo = getDB();
    
    // Check if NID already exists
    $stmt = $pdo->prepare("SELECT id FROM rescuers WHERE nid = ?");
    $stmt->execute([$nid]);
    
    if ($stmt->fetch()) {
        jsonResponse(false, 'National ID already exists in the system');
    }
    
    // Insert new rescuer
    $stmt = $pdo->prepare("INSERT INTO rescuers (name, nid, phone) VALUES (?, ?, ?)");
    $result = $stmt->execute([$name, $nid, $phone]);
    
    if ($result) {
        jsonResponse(true, "Rescuer registered successfully!", [
            'rescuer_id' => $pdo->lastInsertId(),
            'name' => $name,
            'nid' => $nid,
            'phone' => $phone
        ]);
    } else {
        jsonResponse(false, 'Failed to register rescuer');
    }
    
} catch (PDOException $e) {
    jsonResponse(false, 'Database error: ' . $e->getMessage());
} catch (Exception $e) {
    jsonResponse(false, 'Error: ' . $e->getMessage());
}
?>
