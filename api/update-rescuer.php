<?php
require_once '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

$rescuer_id = intval($_POST['rescuer_id'] ?? 0);
$name = sanitizeInput($_POST['name'] ?? '');
$nid = sanitizeInput($_POST['nid'] ?? '');
$phone = sanitizeInput($_POST['phone'] ?? '');

// Validate input
if (!$rescuer_id || empty($name) || empty($nid) || empty($phone)) {
    jsonResponse(false, 'All fields are required');
}

// Validate phone format
if (!preg_match('/^01[0-9]{9}$/', $phone)) {
    jsonResponse(false, 'Invalid phone number format');
}

// Validate NID format
if (!preg_match('/^[0-9]{10,17}$/', $nid)) {
    jsonResponse(false, 'Invalid National ID format');
}

try {
    $pdo = getDB();
    
    // Check if NID already exists for other rescuers
    $stmt = $pdo->prepare("SELECT id FROM rescuers WHERE nid = ? AND id != ?");
    $stmt->execute([$nid, $rescuer_id]);
    
    if ($stmt->fetch()) {
        jsonResponse(false, 'National ID already exists for another rescuer');
    }
    
    // Update rescuer
    $stmt = $pdo->prepare("UPDATE rescuers SET name = ?, nid = ?, phone = ? WHERE id = ?");
    $result = $stmt->execute([$name, $nid, $phone, $rescuer_id]);
    
    if ($result && $stmt->rowCount() > 0) {
        jsonResponse(true, "Rescuer updated successfully!", [
            'rescuer_id' => $rescuer_id,
            'name' => $name,
            'nid' => $nid,
            'phone' => $phone
        ]);
    } else {
        jsonResponse(false, 'No changes made or rescuer not found');
    }
    
} catch (PDOException $e) {
    jsonResponse(false, 'Database error: ' . $e->getMessage());
} catch (Exception $e) {
    jsonResponse(false, 'Error: ' . $e->getMessage());
}
?>
