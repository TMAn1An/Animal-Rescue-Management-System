<?php
require_once '../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, 'Invalid request method');
}

try {
    $pdo = getDB();
    
    // Get all rescuers
    $stmt = $pdo->prepare("SELECT id, name, phone FROM rescuers ORDER BY name ASC");
    $stmt->execute();
    $rescuers = $stmt->fetchAll();
    
    jsonResponse(true, 'Rescuers retrieved successfully', $rescuers);
    
} catch (PDOException $e) {
    jsonResponse(false, 'Database error: ' . $e->getMessage());
} catch (Exception $e) {
    jsonResponse(false, 'Error: ' . $e->getMessage());
}
?>
