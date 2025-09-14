<?php
require_once '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Location: ../pet-history.php');
    exit;
}

$id = intval($_GET['id'] ?? 0);

if (!$id) {
    header('Location: ../pet-history.php');
    exit;
}

try {
    $pdo = getDB();
    
    // Check if request exists
    $stmt = $pdo->prepare("SELECT id FROM rescue_requests WHERE id = ?");
    $stmt->execute([$id]);
    $request = $stmt->fetch();
    
    if ($request) {
        // Delete the rescue request
        $stmt = $pdo->prepare("DELETE FROM rescue_requests WHERE id = ?");
        $result = $stmt->execute([$id]);
        
        if ($result) {
            $_SESSION['success_message'] = "Rescue request deleted successfully.";
        } else {
            $_SESSION['error_message'] = "Failed to delete rescue request.";
        }
    } else {
        $_SESSION['error_message'] = "Rescue request not found.";
    }
    
} catch (Exception $e) {
    $_SESSION['error_message'] = "Error: " . $e->getMessage();
}

header('Location: ../pet-history.php');
exit;
?>
