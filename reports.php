<?php
require_once 'includes/config.php';
$pageTitle = 'Reports - Animal Rescue Management';

// Get various statistics
try {
    $pdo = getDB();
    
    // Overall stats
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $totalUsers = $stmt->fetch()['count'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM rescuers");
    $totalRescuers = $stmt->fetch()['count'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM rescue_requests");
    $totalRequests = $stmt->fetch()['count'];
    
    // Status breakdown
    $stmt = $pdo->query("
        SELECT status, COUNT(*) as count 
        FROM rescue_requests 
        GROUP BY status 
        ORDER BY FIELD(status, 'Pending', 'Assigned', 'Approved', 'Completed')
    ");
    $statusStats = $stmt->fetchAll();
    
    // Condition breakdown
    $stmt = $pdo->query("
        SELECT pet_condition, COUNT(*) as count 
        FROM rescue_requests 
        GROUP BY pet_condition 
        ORDER BY FIELD(pet_condition, 'Serious', 'Moderate', 'Normal')
    ");
    $conditionStats = $stmt->fetchAll();
    
    // Pet type breakdown
    $stmt = $pdo->query("
        SELECT pet_type, COUNT(*) as count 
        FROM rescue_requests 
        GROUP BY pet_type 
        ORDER BY count DESC
    ");
    $petTypeStats = $stmt->fetchAll();
    
    // Recent requests
    $stmt = $pdo->query("
        SELECT rr.*, u.user_code, u.name as user_name, r.name as rescuer_name
        FROM rescue_requests rr
        LEFT JOIN users u ON rr.user_id = u.id
        LEFT JOIN rescuers r ON rr.assigned_rescuer_id = r.id
        ORDER BY rr.created_at DESC
        LIMIT 10
    ");
    $recentRequests = $stmt->fetchAll();
    
    // Top rescuers
    $stmt = $pdo->query("
        SELECT r.name, r.phone, COUNT(rr.id) as total_rescues,
               COUNT(CASE WHEN rr.status = 'Completed' THEN 1 END) as completed_rescues
        FROM rescuers r
        LEFT JOIN rescue_requests rr ON r.id = rr.assigned_rescuer_id
        GROUP BY r.id
        HAVING total_rescues > 0
        ORDER BY completed_rescues DESC, total_rescues DESC
        LIMIT 5
    ");
    $topRescuers = $stmt->fetchAll();
    
} catch (Exception $e) {
    $error_message = "Error generating reports: " . $e->getMessage();
}

include 'includes/header.php';
?>

<?php if (isset($error_message)): ?>
    <div class="alert alert-danger"><?php echo $error_message; ?></div>
<?php endif; ?>

<h2>System Reports & Statistics</h2>

<div class="info-cards">
    <div class="info-card">
        <div class="card-icon">📊</div>
        <h3>Overall Statistics</h3>
        <p><strong>Total Users:</strong> <?php echo $totalUsers; ?></p>
        <p><strong>Total Rescuers:</strong> <?php echo $totalRescuers; ?></p>
        <p><strong>Total Requests:</strong> <?php echo $totalRequests; ?></p>
    </div>
    
    <div class="info-card">
        <h3>Request Status Breakdown</h3>
        <?php foreach ($statusStats as $stat): ?>
            <p><strong><?php echo $stat['status']; ?>:</strong> <?php echo $stat['count']; ?></p>
        <?php endforeach; ?>
    </div>
    
    <div class="info-card">
        <h3>Pet Condition Breakdown</h3>
        <?php foreach ($conditionStats as $stat): ?>
            <p><strong><?php echo $stat['pet_condition']; ?>:</strong> <?php echo $stat['count']; ?></p>
        <?php endforeach; ?>
    </div>
</div>

<div class="info-cards">
    <div class="info-card">
        <h3>Pet Type Statistics</h3>
        <?php foreach ($petTypeStats as $stat): ?>
            <p><strong><?php echo $stat['pet_type']; ?>:</strong> <?php echo $stat['count']; ?> requests</p>
        <?php endforeach; ?>
    </div>
    
    <div class="info-card">
        <h3>Top Performing Rescuers</h3>
        <?php if (empty($topRescuers)): ?>
            <p>No rescuer assignments yet.</p>
        <?php else: ?>
            <?php foreach ($topRescuers as $rescuer): ?>
                <p><strong><?php echo htmlspecialchars($rescuer['name']); ?></strong><br>
                   Completed: <?php echo $rescuer['completed_rescues']; ?> | 
                   Total: <?php echo $rescuer['total_rescues']; ?>
                </p>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>

<h3>Recent Rescue Requests</h3>
<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>User Code</th>
                <th>User Name</th>
                <th>Pet Type</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Assigned Rescuer</th>
                <th>Created</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($recentRequests)): ?>
                <tr>
                    <td colspan="8" class="text-center">No requests found.</td>
                </tr>
            <?php else: ?>
                <?php foreach ($recentRequests as $request): ?>
                    <tr>
                        <td><?php echo $request['id']; ?></td>
                        <td><?php echo htmlspecialchars($request['user_code']); ?></td>
                        <td><?php echo htmlspecialchars($request['user_name']); ?></td>
                        <td><?php echo htmlspecialchars($request['pet_type']); ?></td>
                        <td>
                            <span class="status-badge status-<?php echo strtolower($request['pet_condition']); ?>">
                                <?php echo $request['pet_condition']; ?>
                            </span>
                        </td>
                        <td>
                            <span class="status-badge status-<?php echo strtolower($request['status']); ?>">
                                <?php echo $request['status']; ?>
                            </span>
                        </td>
                        <td><?php echo $request['rescuer_name'] ? htmlspecialchars($request['rescuer_name']) : 'Not assigned'; ?></td>
                        <td><?php echo date('M j, Y', strtotime($request['created_at'])); ?></td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<?php include 'includes/footer.php'; ?>
