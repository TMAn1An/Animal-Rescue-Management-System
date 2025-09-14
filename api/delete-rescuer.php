<?php
require_once '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Location: ../rescuers.php');
    exit;
}

$id = intval($_GET['id'] ?? 0);

if (!$id) {
    header('Location: ../rescuers.php');
    exit;
}

try {
    $pdo = getDB();
    
    // Delete the rescuer (this will set assigned_rescuer_id to NULL in rescue_requests due to foreign key)
    $stmt = $pdo->prepare("DELETE FROM rescuers WHERE id = ?");
    $result = $stmt->execute([$id]);
    
    if ($result && $stmt->rowCount() > 0) {
        $_SESSION['success_message'] = "Rescuer deleted successfully.";
    } else {
        $_SESSION['error_message'] = "Rescuer not found or failed to delete.";
    }
    
} catch (Exception $e) {
    $_SESSION['error_message'] = "Error: " . $e->getMessage();
}

header('Location: ../rescuers.php');
exit;
?>
