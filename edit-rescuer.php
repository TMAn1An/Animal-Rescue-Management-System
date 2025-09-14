<?php
require_once 'includes/config.php';
$pageTitle = 'Edit Rescuer - Animal Rescue Management';

$rescuer_id = intval($_GET['id'] ?? 0);

if (!$rescuer_id) {
    header('Location: rescuers.php');
    exit;
}

// Get rescuer details
try {
    $pdo = getDB();
    
    $stmt = $pdo->prepare("SELECT * FROM rescuers WHERE id = ?");
    $stmt->execute([$rescuer_id]);
    $rescuer = $stmt->fetch();
    
    if (!$rescuer) {
        header('Location: rescuers.php');
        exit;
    }
    
} catch (Exception $e) {
    $error_message = "Error fetching rescuer details: " . $e->getMessage();
}

include 'includes/header.php';
?>

<?php if (isset($error_message)): ?>
    <div class="alert alert-danger"><?php echo $error_message; ?></div>
<?php endif; ?>

<div class="form-container">
    <h2>Edit Rescuer</h2>
    <p>Update rescuer information.</p>
    
    <form action="api/update-rescuer.php" method="POST" data-ajax="true">
        <input type="hidden" name="rescuer_id" value="<?php echo $rescuer['id']; ?>">
        
        <div class="form-group">
            <label for="name" class="form-label">Full Name *</label>
            <input type="text" id="name" name="name" class="form-control" 
                   value="<?php echo htmlspecialchars($rescuer['name']); ?>" required>
        </div>
        
        <div class="form-group">
            <label for="nid" class="form-label">National ID (NID) *</label>
            <input type="text" id="nid" name="nid" class="form-control" 
                   value="<?php echo htmlspecialchars($rescuer['nid']); ?>" required>
        </div>
        
        <div class="form-group">
            <label for="phone" class="form-label">Phone Number *</label>
            <input type="tel" id="phone" name="phone" class="form-control" 
                   value="<?php echo htmlspecialchars($rescuer['phone']); ?>" required>
        </div>
        
        <button type="submit" class="btn btn-success">Update Rescuer</button>
        <a href="rescuers.php" class="btn btn-secondary">Cancel</a>
    </form>
</div>

<?php include 'includes/footer.php'; ?>
