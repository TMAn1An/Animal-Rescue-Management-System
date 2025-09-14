<?php
require_once '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Location: ../users.php');
    exit;
}

$id = intval($_GET['id'] ?? 0);

if (!$id) {
    header('Location: ../users.php');
    exit;
}

try {
    $pdo = getDB();
    
    // Delete the user (this will cascade delete rescue requests due to foreign key)
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $result = $stmt->execute([$id]);
    
    if ($result && $stmt->rowCount() > 0) {
        $_SESSION['success_message'] = "User deleted successfully.";
    } else {
        $_SESSION['error_message'] = "User not found or failed to delete.";
    }
    
} catch (Exception $e) {
    $_SESSION['error_message'] = "Error: " . $e->getMessage();
}

header('Location: ../users.php');
exit;
?>
