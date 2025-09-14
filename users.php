<?php
require_once 'includes/config.php';
$pageTitle = 'All Users - Animal Rescue Management';

// Get all users
try {
    $pdo = getDB();
    
    $sql = "SELECT u.*, 
                   COUNT(rr.id) as total_requests,
                   COUNT(CASE WHEN rr.status = 'Completed' THEN 1 END) as completed_requests
            FROM users u
            LEFT JOIN rescue_requests rr ON u.id = rr.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $users = $stmt->fetchAll();
    
} catch (Exception $e) {
    $users = [];
    $error_message = "Error fetching users: " . $e->getMessage();
}

include 'includes/header.php';
?>

<?php if (isset($error_message)): ?>
    <div class="alert alert-danger"><?php echo $error_message; ?></div>
<?php endif; ?>

<div class="flex justify-between align-center mb-3">
    <h2>All Registered Users</h2>
    <a href="register-user.php" class="btn btn-primary">Register New User</a>
</div>

<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>User Code</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Total Requests</th>
                <th>Completed Rescues</th>
                <th>Registered</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($users)): ?>
                <tr>
                    <td colspan="8" class="text-center">No users found.</td>
                </tr>
            <?php else: ?>
                <?php foreach ($users as $user): ?>
                    <tr>
                        <td><?php echo $user['id']; ?></td>
                        <td><strong><?php echo htmlspecialchars($user['user_code']); ?></strong></td>
                        <td><?php echo htmlspecialchars($user['name']); ?></td>
                        <td><?php echo htmlspecialchars($user['phone']); ?></td>
                        <td><?php echo $user['total_requests']; ?></td>
                        <td><?php echo $user['completed_requests']; ?></td>
                        <td><?php echo date('M j, Y', strtotime($user['created_at'])); ?></td>
                        <td>
                            <div class="flex flex-col gap-1">
                                <a href="edit-user.php?id=<?php echo $user['id']; ?>" 
                                   class="btn btn-secondary" style="font-size: 0.8rem; padding: 5px 10px;">Edit</a>
                                <a href="api/delete-user.php?id=<?php echo $user['id']; ?>" 
                                   class="btn btn-danger" style="font-size: 0.8rem; padding: 5px 10px;"
                                   data-action="delete" 
                                   data-confirm="Are you sure you want to delete this user? This will also delete all their rescue requests.">Delete</a>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<div class="info-card mt-3">
    <h3>User Statistics</h3>
    <p><strong>Total Users:</strong> <?php echo count($users); ?></p>
    <p>Users can create multiple rescue requests using their unique user code.</p>
</div>

<?php include 'includes/footer.php'; ?>
