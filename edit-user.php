<?php
require_once 'includes/config.php';
$pageTitle = 'Edit User - Animal Rescue Management';

$user_id = intval($_GET['id'] ?? 0);

if (!$user_id) {
    header('Location: users.php');
    exit;
}

// Get user details
try {
    $pdo = getDB();
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();
    
    if (!$user) {
        header('Location: users.php');
        exit;
    }
    
} catch (Exception $e) {
    $error_message = "Error fetching user details: " . $e->getMessage();
}

include 'includes/header.php';
?>

<?php if (isset($error_message)): ?>
    <div class="alert alert-danger"><?php echo $error_message; ?></div>
<?php endif; ?>

<div class="form-container">
    <h2>Edit User</h2>
    <p>Update user information. User code cannot be changed.</p>
    
    <form action="api/update-user.php" method="POST" data-ajax="true">
        <input type="hidden" name="user_id" value="<?php echo $user['id']; ?>">
        
        <div class="form-group">
            <label for="user_code" class="form-label">User Code</label>
            <input type="text" id="user_code" name="user_code" class="form-control" 
                   value="<?php echo htmlspecialchars($user['user_code']); ?>" readonly>
        </div>
        
        <div class="form-group">
            <label for="name" class="form-label">Full Name *</label>
            <input type="text" id="name" name="name" class="form-control" 
                   value="<?php echo htmlspecialchars($user['name']); ?>" required>
        </div>
        
        <div class="form-group">
            <label for="phone" class="form-label">Phone Number *</label>
            <input type="tel" id="phone" name="phone" class="form-control" 
                   value="<?php echo htmlspecialchars($user['phone']); ?>" required>
        </div>
        
        <button type="submit" class="btn btn-primary">Update User</button>
        <a href="users.php" class="btn btn-secondary">Cancel</a>
    </form>
</div>

<?php include 'includes/footer.php'; ?>
