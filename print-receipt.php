<?php
require_once 'includes/config.php';
$pageTitle = 'Print Rescuer Receipt - Animal Rescue Management';

$request_id = intval($_GET['id'] ?? 0);

if (!$request_id) {
    echo "Invalid request ID";
    exit;
}

// Get request details
try {
    $pdo = getDB();
    
    $sql = "SELECT rr.*, u.name as user_name, u.phone as user_phone, u.user_code,
                   r.name as rescuer_name, r.phone as rescuer_phone, r.nid as rescuer_nid
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
    <title>Rescuer Receipt - Request #<?php echo $request['id']; ?></title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>

<div class="print-container compact-receipt">
    <div class="print-header">
        <h1>🐾 Animal Rescue Management System</h1>
        <h2>RESCUER ASSIGNMENT RECEIPT</h2>
        <div class="header-info">
            <span><strong>Request ID:</strong> #<?php echo $request['id']; ?></span>
            <span><strong>Generated:</strong> <?php echo date('M j, Y g:i A'); ?></span>
        </div>
    </div>
    
    <div class="print-content">
        <div class="info-section">
            <div class="info-column">
                <h3>🚑 Rescuer Information</h3>
                <p><strong>Name:</strong> <?php echo htmlspecialchars($request['rescuer_name']); ?></p>
                <p><strong>ID:</strong> #<?php echo $request['assigned_rescuer_id']; ?></p>
                <p><strong>Phone:</strong> <?php echo htmlspecialchars($request['rescuer_phone']); ?></p>
                <p><strong>National ID:</strong> <?php echo htmlspecialchars($request['rescuer_nid']); ?></p>
            </div>
            <div class="info-column">
                <h3>👤 User Information</h3>
                <p><strong>Name:</strong> <?php echo htmlspecialchars($request['user_name']); ?></p>
                <p><strong>Code:</strong> <?php echo htmlspecialchars($request['user_code']); ?></p>
                <p><strong>Phone:</strong> <?php echo htmlspecialchars($request['user_phone']); ?></p>
            </div>
        </div>
        
        <div class="info-section">
            <div class="info-column">
                <h3>🐾 Pet Details</h3>
                <p><strong>Type:</strong> <?php echo htmlspecialchars($request['pet_type']); ?></p>
                <p><strong>Condition:</strong> <?php echo htmlspecialchars($request['pet_condition']); ?></p>
                <p><strong>Location:</strong> <?php echo htmlspecialchars($request['location']); ?></p>
            </div>
            <div class="info-column">
                <h3>📋 Assignment Info</h3>
                <p><strong>Date:</strong> <?php echo date('M j, Y g:i A', strtotime($request['assigned_at'])); ?></p>
                <p><strong>Donation:</strong> <?php echo $request['donation_amount'] ? '৳' . number_format($request['donation_amount'], 2) : 'N/A'; ?></p>
                
                <div class="priority-box">
                    <strong>🚨 Priority Level:</strong><br>
                    <?php 
                    switch($request['pet_condition']) {
                        case 'Serious':
                            echo 'HIGH - Immediate Action';
                            break;
                        case 'Moderate':
                            echo 'MEDIUM - Prompt Action';
                            break;
                        default:
                            echo 'NORMAL - Standard Protocol';
                    }
                    ?>
                </div>
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
                <h3>⚠️ Special Instructions</h3>
                <div class="notes-text"><?php echo nl2br(htmlspecialchars($request['additional_note'])); ?></div>
            </div>
        <?php endif; ?>
    </div>
    
    <div class="print-footer">
        <p>Thank you for your service in animal rescue!</p>
        <hr>
        <small>Please contact the user before proceeding to the location. Ensure proper safety equipment and transportation for the animal.</small>
    </div>
</div>
    
    <div class="print-footer">
        <p>Animal Rescue Management System | Anamika Sarker Keya - ID: 23203128</p>
        <p>Thank you for your service in animal rescue!</p>
        <hr>
        <small>Please contact the user before proceeding to the location. Ensure proper safety equipment and transportation for the animal.</small>
    </div>
</div>

<div style="text-align: center; margin: 20px; display: block;" class="no-print">
    <button onclick="window.print()" class="btn btn-primary">Print Receipt</button>
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
    
    .compact-receipt {
        font-size: 12px !important;
        padding: 20px !important;
        max-width: 190mm;
        min-height: 250mm;
        margin: 0 auto;
        border: 2px solid #333;
        border-radius: 8px;
        background: white;
    }
    
    .compact-receipt h1 {
        font-size: 18px !important;
        margin: 0 0 8px 0 !important;
        text-align: center;
        color: #2c3e50;
    }
    
    .compact-receipt h2 {
        font-size: 15px !important;
        margin: 0 0 15px 0 !important;
        text-align: center;
        background: #e74c3c;
        color: white;
        padding: 8px;
        border-radius: 5px;
    }
    
    .compact-receipt h3 {
        font-size: 13px !important;
        margin: 15px 0 8px 0 !important;
        color: #2c3e50;
        border-bottom: 2px solid #e74c3c;
        padding-bottom: 3px;
        font-weight: bold;
    }
    
    .compact-receipt p {
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
        border-left: 4px solid #e74c3c;
    }
    
    .full-width-section {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 5px;
        border-left: 4px solid #f39c12;
        margin: 15px 0;
    }
    
    .priority-box {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        padding: 8px;
        border-radius: 5px;
        margin-top: 8px;
        font-size: 11px;
        font-weight: bold;
        text-align: center;
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
        margin: 5px 0 !important;
        font-weight: bold;
    }
    
    .print-footer hr {
        margin: 8px 0;
        border: none;
        border-top: 1px solid #7f8c8d;
    }
    
    .print-footer small {
        font-size: 10px !important;
        line-height: 1.3 !important;
        font-weight: normal;
    }
}
</style>

</body>
</html>
