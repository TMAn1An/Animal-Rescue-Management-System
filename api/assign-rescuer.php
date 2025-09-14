<?php
require_once '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

$request_id = intval($_POST['request_id'] ?? 0);
$user_id = intval($_POST['user_id'] ?? 0);
$rescuer_id = intval($_POST['rescuer_id'] ?? 0);
$estimated_arrival = sanitizeInput($_POST['estimated_arrival'] ?? '');

// Validate input
if (empty($rescuer_id) || empty($user_id) || empty($estimated_arrival)) {
    jsonResponse(false, 'Rescuer ID, User ID, and estimated arrival time are required');
}

// Validate that estimated_arrival is not in the past (server-side guard)
try {
    // Input format expected: YYYY-MM-DDTHH:MM (local) or with seconds
    $eta = new DateTime($estimated_arrival);
    $now = new DateTime('now');
    if ($eta < $now) {
        jsonResponse(false, 'Estimated arrival time cannot be in the past');
    }
} catch (Exception $e) {
    jsonResponse(false, 'Invalid estimated arrival time format');
}

try {
    $pdo = getDB();
    $pdo->beginTransaction();
    
    // Verify rescuer exists
    $stmt = $pdo->prepare("SELECT name, phone FROM rescuers WHERE id = ?");
    $stmt->execute([$rescuer_id]);
    $rescuer = $stmt->fetch();
    
    if (!$rescuer) {
        $pdo->rollback();
        jsonResponse(false, 'Rescuer not found');
    }
    
    // Get user's latest pending request (business rule)
    $stmt = $pdo->prepare("
        SELECT id, pet_type, pet_condition, location, donation_amount, situation_description 
        FROM rescue_requests 
        WHERE user_id = ? AND status = 'Pending' 
        ORDER BY created_at DESC 
        LIMIT 1
    ");
    $stmt->execute([$user_id]);
    $latestRequest = $stmt->fetch();
    
    if (!$latestRequest) {
        $pdo->rollback();
        jsonResponse(false, 'No pending rescue request found for this user');
    }
    
    // Update the latest pending request with rescuer assignment
    $stmt = $pdo->prepare("
        UPDATE rescue_requests 
        SET assigned_rescuer_id = ?, 
            assigned_at = NOW(), 
            status = 'Assigned',
            approved = TRUE
        WHERE id = ? AND status = 'Pending'
    ");
    
    $result = $stmt->execute([$rescuer_id, $latestRequest['id']]);
    
    if ($result && $stmt->rowCount() > 0) {
        $pdo->commit();
        
        // Get updated request with user info for response
        $stmt = $pdo->prepare("
            SELECT rr.*, u.name as user_name, u.phone as user_phone, u.user_code,
                   r.name as rescuer_name, r.phone as rescuer_phone
            FROM rescue_requests rr
            LEFT JOIN users u ON rr.user_id = u.id
            LEFT JOIN rescuers r ON rr.assigned_rescuer_id = r.id
            WHERE rr.id = ?
        ");
        $stmt->execute([$latestRequest['id']]);
        $assignedRequest = $stmt->fetch();
        
        jsonResponse(true, "Rescuer assigned successfully to request ID: {$latestRequest['id']}", [
            'request' => $assignedRequest,
            'estimated_arrival' => $estimated_arrival
        ]);
    } else {
        $pdo->rollback();
        jsonResponse(false, 'Failed to assign rescuer. Request may have been already assigned.');
    }
    
} catch (PDOException $e) {
    $pdo->rollback();
    jsonResponse(false, 'Database error: ' . $e->getMessage());
} catch (Exception $e) {
    $pdo->rollback();
    jsonResponse(false, 'Error: ' . $e->getMessage());
}
?>
