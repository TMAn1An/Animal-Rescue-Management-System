<?php
require_once '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Location: ../pet-history.php');
    exit;
}

$id = intval($_GET['id'] ?? 0);

if (!$id) {
    header('Location: ../pet-history.php?error=invalid_id');
    exit;
}

try {
    $pdo = getDB();
    
    // Check if request exists and is in correct status
    $stmt = $pdo->prepare("SELECT status FROM rescue_requests WHERE id = ?");
    $stmt->execute([$id]);
    $request = $stmt->fetch();
    
    if (!$request) {
        header('Location: ../pet-history.php?error=request_not_found');
        exit;
    }
    
    if ($request['status'] !== 'Assigned') {
        header('Location: ../pet-history.php?error=invalid_status');
        exit;
    }
    
    // Update request to approved status
    $stmt = $pdo->prepare("
        UPDATE rescue_requests 
        SET status = 'Approved', approved = TRUE, updated_at = NOW() 
        WHERE id = ?
    ");
    
    $result = $stmt->execute([$id]);
    
    if ($result) {
        header('Location: ../pet-history.php?success=request_approved');
    } else {
        header('Location: ../pet-history.php?error=approval_failed');
    }
    
} catch (PDOException $e) {
    header('Location: ../pet-history.php?error=database_error');
} catch (Exception $e) {
    header('Location: ../pet-history.php?error=general_error');
}
?>
