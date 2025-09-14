<?php
require_once 'includes/config.php';
$pageTitle = 'View Request Details - Animal Rescue Management';

$request_id = intval($_GET['id'] ?? 0);

if (!$request_id) {
    header('Location: pet-history.php');
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
            WHERE rr.id = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$request_id]);
    $request = $stmt->fetch();
    
    if (!$request) {
        header('Location: pet-history.php');
        exit;
    }
    
} catch (Exception $e) {
    $error_message = "Error fetching request details: " . $e->getMessage();
}

include 'includes/header.php';
?>

<?php if (isset($error_message)): ?>
    <div class="alert alert-danger"><?php echo $error_message; ?></div>
<?php endif; ?>

<div class="flex justify-between align-center mb-3">
    <h2>Request Details - ID #<?php echo $request['id']; ?></h2>
    <a href="pet-history.php" class="btn btn-secondary">Back to History</a>
</div>

<div class="info-cards">
    <div class="info-card">
        <h3>User Information</h3>
        <p><strong>User Code:</strong> <?php echo htmlspecialchars($request['user_code']); ?></p>
        <p><strong>Name:</strong> <?php echo htmlspecialchars($request['user_name']); ?></p>
        <p><strong>Phone:</strong> <?php echo htmlspecialchars($request['user_phone']); ?></p>
    </div>
    
    <div class="info-card">
        <h3>Pet Information</h3>
        <p><strong>Type:</strong> <?php echo htmlspecialchars($request['pet_type']); ?></p>
        <p><strong>Condition:</strong> 
            <span class="status-badge status-<?php echo strtolower($request['pet_condition']); ?>">
                <?php echo $request['pet_condition']; ?>
            </span>
        </p>
        <p><strong>Location:</strong> <?php echo htmlspecialchars($request['location']); ?></p>
        <p><strong>Donation:</strong> <?php echo $request['donation_amount'] ? '$' . number_format($request['donation_amount'], 2) : 'N/A'; ?></p>
    </div>
    
    <div class="info-card">
        <h3>Request Status</h3>
        <p><strong>Status:</strong> 
            <span class="status-badge status-<?php echo strtolower($request['status']); ?>">
                <?php echo $request['status']; ?>
            </span>
        </p>
        <p><strong>Created:</strong> <?php echo date('M j, Y g:i A', strtotime($request['created_at'])); ?></p>
        <?php if ($request['assigned_at']): ?>
            <p><strong>Assigned:</strong> <?php echo date('M j, Y g:i A', strtotime($request['assigned_at'])); ?></p>
        <?php endif; ?>
    </div>
</div>

<?php if ($request['rescuer_name']): ?>
<div class="info-card">
    <h3>Assigned Rescuer</h3>
    <p><strong>Name:</strong> <?php echo htmlspecialchars($request['rescuer_name']); ?></p>
    <p><strong>Phone:</strong> <?php echo htmlspecialchars($request['rescuer_phone']); ?></p>
    <p><strong>NID:</strong> <?php echo htmlspecialchars($request['rescuer_nid']); ?></p>
</div>
<?php endif; ?>

<div class="info-card">
    <h3>Animal Situation</h3>
    <p><?php echo nl2br(htmlspecialchars($request['situation_description'])); ?></p>
</div>

<?php if ($request['additional_note']): ?>
<div class="info-card">
    <h3>Additional Notes</h3>
    <p><?php echo nl2br(htmlspecialchars($request['additional_note'])); ?></p>
</div>
<?php endif; ?>



<div class="flex gap-2 mt-3" style="flex-wrap: wrap;">
    <?php if ($request['status'] === 'Pending'): ?>
        <button class="btn btn-success" 
                data-action="assign" 
                data-request-id="<?php echo $request['id']; ?>"
                data-user-id="<?php echo $request['user_id']; ?>">
            Assign Rescuer
        </button>
    <?php endif; ?>
    
    <?php if ($request['status'] === 'Assigned' && !$request['approved']): ?>
        <a href="api/approve-request.php?id=<?php echo $request['id']; ?>" 
           class="btn btn-warning"
           onclick="return confirm('Mark this request as approved?')">
            Approve Request
        </a>
    <?php endif; ?>
    
    <?php if ($request['status'] === 'Approved' || ($request['status'] === 'Assigned' && $request['approved'])): ?>
        <a href="api/complete-request.php?id=<?php echo $request['id']; ?>" 
           class="btn btn-success"
           onclick="return confirm('Mark this request as completed?')">
            Complete Request
        </a>
    <?php endif; ?>
    
    <?php if ($request['assigned_rescuer_id']): ?>
        <button class="btn btn-primary" onclick="printSlip('user', <?php echo $request['id']; ?>)">
            Print User Slip
        </button>
        <button class="btn btn-success" onclick="printSlip('rescuer', <?php echo $request['id']; ?>)">
            Print Rescuer Receipt
        </button>
    <?php endif; ?>
    
    <?php if ($request['status'] === 'Pending' || $request['status'] === 'Assigned'): ?>
        <a href="edit-request.php?id=<?php echo $request['id']; ?>" class="btn btn-secondary">
            Edit Request
        </a>
    <?php endif; ?>
    
    <a href="api/delete-request.php?id=<?php echo $request['id']; ?>" 
       class="btn btn-danger"
       data-action="delete" 
       data-confirm="Are you sure you want to delete this rescue request?">
        Delete Request
    </a>
</div>

<?php include 'includes/footer.php'; ?>
