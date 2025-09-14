<?php
require_once '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
    exit;
}

$request_id = intval($_POST['request_id'] ?? 0);
$pet_type = sanitizeInput($_POST['pet_type'] ?? '');
$pet_condition = sanitizeInput($_POST['pet_condition'] ?? '');
$location = sanitizeInput($_POST['location'] ?? '');
$situation_description = sanitizeInput($_POST['situation_description'] ?? '');
$additional_note = sanitizeInput($_POST['additional_note'] ?? '');
$donation_amount = $_POST['donation_amount'] ?? null;

// Validate required fields
if (!$request_id || empty($pet_type) || empty($pet_condition) || empty($location) || empty($situation_description)) {
    jsonResponse(false, 'Request ID, pet type, pet condition, location, and situation description are required');
    exit;
}

// Validate pet condition
if (!in_array($pet_condition, ['Normal', 'Moderate', 'Serious'])) {
    jsonResponse(false, 'Invalid pet condition');
    exit;
}

// Validate donation amount
if ($donation_amount !== null && $donation_amount !== '') {
    $donation_amount = floatval($donation_amount);
    if ($donation_amount < 0) {
        jsonResponse(false, 'Donation amount cannot be negative');
        exit;
    }
} else {
    $donation_amount = null;
}

try {
    $pdo = getDB();
    
    // Check if request exists and is not approved
    $stmt = $pdo->prepare("SELECT id FROM rescue_requests WHERE id = ? AND approved = FALSE");
    $stmt->execute([$request_id]);
    $existingRequest = $stmt->fetch();
    
    if (!$existingRequest) {
        jsonResponse(false, 'Request not found or already approved (cannot edit approved requests)');
        exit;
    }

    // Update rescue request
    $stmt = $pdo->prepare("
        UPDATE rescue_requests 
        SET pet_type = ?, pet_condition = ?, location = ?, situation_description = ?, 
            additional_note = ?, donation_amount = ?, updated_at = NOW()
        WHERE id = ? AND approved = FALSE
    ");
    
    $result = $stmt->execute([
        $pet_type,
        $pet_condition,
        $location,
        $situation_description,
        $additional_note,
        $donation_amount,
        $request_id
    ]);
    
    if ($result && $stmt->rowCount() > 0) {
        jsonResponse(true, "Rescue request updated successfully!", [
            'request_id' => $request_id,
            'pet_type' => $pet_type,
            'pet_condition' => $pet_condition
        ]);
        exit;
    } else {
        jsonResponse(false, 'No changes made or request not found');
        exit;
    }
    
} catch (PDOException $e) {
    jsonResponse(false, 'Database error: ' . $e->getMessage());
    exit;
} catch (Exception $e) {
    jsonResponse(false, 'Error: ' . $e->getMessage());
    exit;
}
?>
