<?php
require_once '../includes/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $method === 'POST' ? intval($_POST['id'] ?? 0) : intval($_GET['id'] ?? 0);
$post_health_condition = $method === 'POST' ? trim($_POST['post_health_condition'] ?? '') : '';

if (!$id) {
    header('Location: ../pet-history.php?error=invalid_id');
    exit;
}

try {
    $pdo = getDB();
    
    // Check if request exists and is in correct status
    $stmt = $pdo->prepare("SELECT status, approved FROM rescue_requests WHERE id = ?");
    $stmt->execute([$id]);
    $request = $stmt->fetch();
    
    if (!$request) {
        header('Location: ../pet-history.php?error=request_not_found');
        exit;
    }
    
    if ($request['status'] !== 'Approved' && !($request['status'] === 'Assigned' && $request['approved'])) {
        header('Location: ../pet-history.php?error=invalid_status');
        exit;
    }
    
    if ($method === 'POST') {
        if ($post_health_condition === '') {
            header('Location: ../pet-history.php?error=completion_failed');
            exit;
        }
        // Check if column post_health_condition exists
        $colStmt = $pdo->prepare("SHOW COLUMNS FROM rescue_requests LIKE 'post_health_condition'");
        $colStmt->execute();
        $hasColumn = (bool)$colStmt->fetch();

        if ($hasColumn) {
            $stmt = $pdo->prepare("\n                UPDATE rescue_requests \n                SET status = 'Completed', post_health_condition = ?, updated_at = NOW() \n                WHERE id = ?\n            ");
            $result = $stmt->execute([$post_health_condition, $id]);
        } else {
            // Fallback: complete without saving health if column not present
            $stmt = $pdo->prepare("\n                UPDATE rescue_requests \n                SET status = 'Completed', updated_at = NOW() \n                WHERE id = ?\n            ");
            $result = $stmt->execute([$id]);
        }
        if ($result) {
            header('Location: ../pet-history.php?success=request_completed');
        } else {
            header('Location: ../pet-history.php?error=completion_failed');
        }
        exit;
    }

    // GET fallback: complete without health text
    $stmt = $pdo->prepare("\n        UPDATE rescue_requests \n        SET status = 'Completed', updated_at = NOW() \n        WHERE id = ?\n    ");
    $result = $stmt->execute([$id]);
    
    if ($result) {
        header('Location: ../pet-history.php?success=request_completed');
    } else {
        header('Location: ../pet-history.php?error=completion_failed');
    }
    
} catch (PDOException $e) {
    header('Location: ../pet-history.php?error=database_error');
} catch (Exception $e) {
    header('Location: ../pet-history.php?error=general_error');
}
?>
