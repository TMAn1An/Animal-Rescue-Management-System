<?php
require_once 'includes/config.php';
$pageTitle = 'Print User Slip - Animal Rescue Management';

$request_id = intval($_GET['id'] ?? 0);

if (!$request_id) {
    echo "Invalid request ID";
    exit;
}

// Get request details
try {
    $pdo = getDB();
    
    $sql = "SELECT rr.*, u.name as user_name, u.phone as user_phone, u.user_code,
                   r.name as rescuer_name, r.phone as rescuer_phone
            FROM rescue_requests rr
            LEFT JOIN users u ON rr.user_id = u.id
            LEFT JOIN rescuers r ON rr.assigned_rescuer_id = r.id
            WHERE rr.id = ? AND rr.assigned_rescuer_id IS NOT NULL";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$request_id]);
    $request = $stmt->fetch();
    
    if (!$request) {
        echo "Request not found or no rescuer assigned";
        exit;
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Slip - Request #<?php echo $request['id']; ?></title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>

<div class="print-container compact-slip">
    <div class="print-header">
        <h1>🐾 Animal Rescue Management System</h1>
        <h2>USER RESCUE SLIP</h2>
        <div class="header-info">
            <span><strong>Request ID:</strong> #<?php echo $request['id']; ?></span>
            <span><strong>Generated:</strong> <?php echo date('M j, Y g:i A'); ?></span>
        </div>
    </div>
    
    <div class="print-content">
        <div class="info-section">
            <div class="info-column">
                <h3>👤 User Information</h3>
                <p><strong>Name:</strong> <?php echo htmlspecialchars($request['user_name']); ?></p>
                <p><strong>User Code:</strong> <?php echo htmlspecialchars($request['user_code']); ?></p>
                <p><strong>Phone:</strong> <?php echo htmlspecialchars($request['user_phone']); ?></p>
            </div>
            <div class="info-column">
                <h3>🚑 Assigned Rescuer</h3>
                <p><strong>Name:</strong> <?php echo htmlspecialchars($request['rescuer_name']); ?></p>
                <p><strong>Phone:</strong> <?php echo htmlspecialchars($request['rescuer_phone']); ?></p>
            </div>
        </div>
        
        <div class="info-section">
            <div class="info-column">
                <h3>🐾 Pet Information</h3>
                <p><strong>Type:</strong> <?php echo htmlspecialchars($request['pet_type']); ?></p>
                <p><strong>Condition:</strong> <?php echo htmlspecialchars($request['pet_condition']); ?></p>
                <p><strong>Location:</strong> <?php echo htmlspecialchars($request['location']); ?></p>
            </div>
            <div class="info-column">
                <h3>📋 Details</h3>
                <p><strong>Created:</strong> <?php echo date('M j, Y g:i A', strtotime($request['created_at'])); ?></p>
                <p><strong>Assigned:</strong> <?php echo date('M j, Y g:i A', strtotime($request['assigned_at'])); ?></p>
                <p><strong>Status:</strong> <?php echo htmlspecialchars($request['status']); ?></p>
                <p><strong>Donation:</strong> <?php echo $request['donation_amount'] ? '৳' . number_format($request['donation_amount'], 2) : 'N/A'; ?></p>
            </div>
        </div>
        
        <?php if ($request['situation_description']): ?>
            <div class="full-width-section">
                <h3>📝 Situation Description</h3>
                <div class="situation-text"><?php echo nl2br(htmlspecialchars($request['situation_description'])); ?></div>
            </div>
        <?php endif; ?>
        
        <?php if ($request['additional_note']): ?>
            <div class="full-width-section">
                <h3>📌 Additional Notes</h3>
                <div class="notes-text"><?php echo nl2br(htmlspecialchars($request['additional_note'])); ?></div>
            </div>
        <?php endif; ?>

        <div class="full-width-section">
            <h3>🩺 Post-Rescue Health Condition</h3>
            <div class="notes-text">
                <?php if (strtolower($request['status']) === 'completed'): ?>
                    <?php 
                        // If a dedicated field exists later, replace additional_note with that field
                        $health = trim((string)($request['post_health_condition'] ?? ''));
                        if ($health === '') { $health = (string)($request['additional_note'] ?? ''); }
                        echo $health ? nl2br(htmlspecialchars($health)) : 'Not provided';
                    ?>
                <?php else: ?>
                    Not updated yet
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <div class="print-footer">
        <p>Thank you for helping animals in need!</p>
    </div>
</div>

<div style="text-align: center; margin: 20px; display: block;" class="no-print">
    <button onclick="window.print()" class="btn btn-primary">Print Slip</button>
    <button onclick="window.close()" class="btn btn-secondary">Close</button>
</div>

<style>
@media print {
    .no-print { display: none !important; }
    
    body {
        margin: 0;
        padding: 10px;
        font-family: Arial, sans-serif;
    }
    
    .compact-slip {
        font-size: 12px !important;
        padding: 20px !important;
        max-width: 190mm;
        min-height: 250mm;
        margin: 0 auto;
        border: 2px solid #333;
        border-radius: 8px;
        background: white;
    }
    
    .compact-slip h1 {
        font-size: 18px !important;
        margin: 0 0 8px 0 !important;
        text-align: center;
        color: #2c3e50;
    }
    
    .compact-slip h2 {
        font-size: 15px !important;
        margin: 0 0 15px 0 !important;
        text-align: center;
        background: #3498db;
        color: white;
        padding: 8px;
        border-radius: 5px;
    }
    
    .compact-slip h3 {
        font-size: 13px !important;
        margin: 15px 0 8px 0 !important;
        color: #2c3e50;
        border-bottom: 2px solid #3498db;
        padding-bottom: 3px;
        font-weight: bold;
    }
    
    .compact-slip p {
        margin: 4px 0 !important;
        line-height: 1.4 !important;
    }
    
    .header-info {
        display: flex;
        justify-content: space-between;
        margin: 10px 0 20px 0;
        padding: 8px;
        background: #ecf0f1;
        border-radius: 5px;
        font-size: 11px;
        font-weight: bold;
    }
    
    .info-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 25px;
        margin-bottom: 15px;
    }
    
    .info-column {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 5px;
        border-left: 4px solid #3498db;
    }
    
    .full-width-section {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 5px;
        border-left: 4px solid #e74c3c;
        margin: 15px 0;
    }
    
    .situation-text, .notes-text {
        font-size: 11px !important;
        line-height: 1.3 !important;
        background: white;
        padding: 8px;
        border-radius: 3px;
        border: 1px solid #ddd;
        margin-top: 5px;
    }
    
    .print-footer {
        margin-top: 20px !important;
        padding: 15px !important;
        font-size: 11px !important;
        text-align: center;
        background: #2c3e50;
        color: white;
        border-radius: 5px;
    }
    
    .print-footer p {
        margin: 0 !important;
        font-weight: bold;
    }
}
</style>

</body>
</html>
