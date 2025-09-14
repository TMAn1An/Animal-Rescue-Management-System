<?php
require_once 'includes/config.php';
$pageTitle = 'Complete Rescue Request';

$id = intval($_GET['id'] ?? 0);
if (!$id) {
    header('Location: pet-history.php?error=invalid_id');
    exit;
}

try {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT id, status, approved FROM rescue_requests WHERE id = ?");
    $stmt->execute([$id]);
    $req = $stmt->fetch();
    if (!$req) {
        header('Location: pet-history.php?error=request_not_found');
        exit;
    }
    if ($req['status'] !== 'Approved' && !($req['status'] === 'Assigned' && $req['approved'])) {
        header('Location: pet-history.php?error=invalid_status');
        exit;
    }
} catch(Exception $e) {
    header('Location: pet-history.php?error=database_error');
    exit;
}

include 'includes/header.php';
?>
<div class="form-container">
  <h2>Complete Rescue Request #<?php echo $id; ?></h2>
  <p>Please provide the pet's post-rescue health condition before marking as completed.</p>
  <form action="api/complete-request.php" method="POST">
    <input type="hidden" name="id" value="<?php echo $id; ?>">
    <div class="form-group">
      <label for="post_health_condition" class="form-label">Post-Rescue Health Condition *</label>
      <textarea id="post_health_condition" name="post_health_condition" class="form-control" rows="4" required placeholder="e.g., Wound cleaned and bandaged; stable; scheduled vet follow-up in 3 days."></textarea>
    </div>
    <div class="text-center mt-3">
      <button type="submit" class="btn btn-success">Complete Rescue</button>
      <a href="pet-history.php" class="btn btn-secondary">Cancel</a>
    </div>
  </form>
</div>
<?php include 'includes/footer.php'; ?>
