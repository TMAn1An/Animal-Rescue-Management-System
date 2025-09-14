<?php
require_once 'includes/config.php';
$pageTitle = 'All Rescuers - Animal Rescue Management';

// Get all rescuers
try {
    $pdo = getDB();
    
    $sql = "SELECT r.*, 
                   COUNT(rr.id) as total_assignments,
                   COUNT(CASE WHEN rr.status = 'Completed' THEN 1 END) as completed_rescues
            FROM rescuers r
            LEFT JOIN rescue_requests rr ON r.id = rr.assigned_rescuer_id
            GROUP BY r.id
            ORDER BY r.created_at DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $rescuers = $stmt->fetchAll();
    
} catch (Exception $e) {
    $rescuers = [];
    $error_message = "Error fetching rescuers: " . $e->getMessage();
}

include 'includes/header.php';
?>

<?php if (isset($error_message)): ?>
    <div class="alert alert-danger"><?php echo $error_message; ?></div>
<?php endif; ?>

<div class="flex justify-between align-center mb-3">
    <h2>All Registered Rescuers</h2>
    <a href="register-rescuer.php" class="btn btn-success">Register New Rescuer</a>
</div>

<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>National ID</th>
                <th>Phone</th>
                <th>Total Assignments</th>
                <th>Completed Rescues</th>
                <th>Registered</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($rescuers)): ?>
                <tr>
                    <td colspan="8" class="text-center">No rescuers found.</td>
                </tr>
            <?php else: ?>
                <?php foreach ($rescuers as $rescuer): ?>
                    <tr>
                        <td><?php echo $rescuer['id']; ?></td>
                        <td><strong><?php echo htmlspecialchars($rescuer['name']); ?></strong></td>
                        <td><?php echo htmlspecialchars($rescuer['nid']); ?></td>
                        <td><?php echo htmlspecialchars($rescuer['phone']); ?></td>
                        <td><?php echo $rescuer['total_assignments']; ?></td>
                        <td><?php echo $rescuer['completed_rescues']; ?></td>
                        <td><?php echo date('M j, Y', strtotime($rescuer['created_at'])); ?></td>
                        <td>
                            <div class="flex flex-col gap-1">
                                <a href="edit-rescuer.php?id=<?php echo $rescuer['id']; ?>" 
                                   class="btn btn-secondary" style="font-size: 0.8rem; padding: 5px 10px;">Edit</a>
                                <a href="api/delete-rescuer.php?id=<?php echo $rescuer['id']; ?>" 
                                   class="btn btn-danger" style="font-size: 0.8rem; padding: 5px 10px;"
                                   data-action="delete" 
                                   data-confirm="Are you sure you want to delete this rescuer? This will unassign them from any current requests.">Delete</a>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<div class="info-card mt-3">
    <h3>Rescuer Statistics</h3>
    <p><strong>Total Rescuers:</strong> <?php echo count($rescuers); ?></p>
    <p>Rescuers can be assigned to multiple rescue requests and help save animals in need.</p>
</div>

<?php include 'includes/footer.php'; ?>
