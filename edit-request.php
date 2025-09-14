<?php
require_once 'includes/config.php';
$pageTitle = 'Edit Rescue Request - Animal Rescue Management';

$request_id = intval($_GET['id'] ?? 0);

if (!$request_id) {
    header('Location: pet-history.php');
    exit;
}

// Get request details
try {
    $pdo = getDB();
    
    $stmt = $pdo->prepare("
        SELECT rr.*, u.user_code 
        FROM rescue_requests rr
        LEFT JOIN users u ON rr.user_id = u.id
        WHERE rr.id = ?
    ");
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

<div class="form-container">
    <h2>Edit Rescue Request #<?php echo $request['id']; ?></h2>
    <p>Update rescue request details. Note: Only Pending and Assigned requests can be edited.</p>
    
    <form action="api/update-request.php" method="POST" data-ajax="true">
        <input type="hidden" name="request_id" value="<?php echo $request['id']; ?>">
        
        <div class="form-group">
            <label for="user_code" class="form-label">User Code</label>
            <input type="text" id="user_code" name="user_code" class="form-control" 
                   value="<?php echo htmlspecialchars($request['user_code']); ?>" readonly>
        </div>
        
        <div class="form-group">
            <label for="pet_type" class="form-label">Pet Type *</label>
            <select id="pet_type" name="pet_type" class="form-select" required>
                <option value="">Select pet type</option>
                <option value="Dog" <?php echo $request['pet_type'] === 'Dog' ? 'selected' : ''; ?>>Dog</option>
                <option value="Cat" <?php echo $request['pet_type'] === 'Cat' ? 'selected' : ''; ?>>Cat</option>
                <option value="Bird" <?php echo $request['pet_type'] === 'Bird' ? 'selected' : ''; ?>>Bird</option>
                <option value="Rabbit" <?php echo $request['pet_type'] === 'Rabbit' ? 'selected' : ''; ?>>Rabbit</option>
                <option value="Other" <?php echo $request['pet_type'] === 'Other' ? 'selected' : ''; ?>>Other</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="pet_condition" class="form-label">Pet Condition *</label>
            <select id="pet_condition" name="pet_condition" class="form-select" required>
                <option value="">Select condition</option>
                <option value="Normal" <?php echo $request['pet_condition'] === 'Normal' ? 'selected' : ''; ?>>Normal - Pet appears healthy</option>
                <option value="Moderate" <?php echo $request['pet_condition'] === 'Moderate' ? 'selected' : ''; ?>>Moderate - Minor injuries or illness</option>
                <option value="Serious" <?php echo $request['pet_condition'] === 'Serious' ? 'selected' : ''; ?>>Serious - Severe injuries or critical condition</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="location" class="form-label">Location *</label>
            <input type="text" id="location" name="location" class="form-control" 
                   value="<?php echo htmlspecialchars($request['location']); ?>" required>
        </div>
        
        <div class="form-group">
            <label for="situation_description" class="form-label">Animal Situation Description *</label>
            <textarea id="situation_description" name="situation_description" class="form-control" 
                      required rows="4"><?php echo htmlspecialchars($request['situation_description']); ?></textarea>
            <small>Please provide detailed description of the animal's condition and circumstances</small>
        </div>
        
        <div class="form-group">
            <label for="additional_note" class="form-label">Additional Notes</label>
            <textarea id="additional_note" name="additional_note" class="form-control"><?php echo htmlspecialchars($request['additional_note']); ?></textarea>
        </div>
        
        <div class="form-group">
            <label for="donation_amount" class="form-label">Donation Amount (Optional)</label>
            <input type="number" id="donation_amount" name="donation_amount" class="form-control" 
                   step="0.01" min="0" value="<?php echo $request['donation_amount']; ?>">
        </div>
        
        <button type="submit" class="btn btn-primary">Update Request</button>
        <a href="view-request.php?id=<?php echo $request['id']; ?>" class="btn btn-secondary">Cancel</a>
    </form>
</div>

<?php include 'includes/footer.php'; ?>
