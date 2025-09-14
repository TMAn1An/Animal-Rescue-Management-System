<?php
require_once 'includes/config.php';
$pageTitle = 'Pet Rescue History - Animal Rescue Management';

// Get all rescue requests with user and rescuer info
try {
    $pdo = getDB();
    
    $sql = "SELECT rr.*, u.name as user_name, u.phone as user_phone, u.user_code,
                   r.name as rescuer_name, r.phone as rescuer_phone
            FROM rescue_requests rr
            LEFT JOIN users u ON rr.user_id = u.id
            LEFT JOIN rescuers r ON rr.assigned_rescuer_id = r.id
            ORDER BY rr.created_at DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $requests = $stmt->fetchAll();
    
} catch (Exception $e) {
    $requests = [];
    $error_message = "Error fetching rescue requests: " . $e->getMessage();
}

include 'includes/header.php';
?>

<?php if (isset($error_message)): ?>
    <div class="alert alert-danger"><?php echo $error_message; ?></div>
<?php endif; ?>

<?php
// Handle success/error messages from URL parameters
if (isset($_GET['success'])) {
    $success_messages = [
        'request_approved' => 'Request has been approved successfully!',
        'request_completed' => 'Request has been completed successfully!'
    ];
    if (isset($success_messages[$_GET['success']])) {
        echo '<div class="alert alert-success">' . $success_messages[$_GET['success']] . '</div>';
    }
}

if (isset($_GET['error'])) {
    $error_messages = [
        'invalid_id' => 'Invalid request ID provided.',
        'request_not_found' => 'Request not found.',
        'invalid_status' => 'Request cannot be updated due to invalid status.',
        'approval_failed' => 'Failed to approve the request.',
        'completion_failed' => 'Failed to complete the request.',
        'database_error' => 'Database error occurred.',
        'general_error' => 'An error occurred while processing the request.'
    ];
    if (isset($error_messages[$_GET['error']])) {
        echo '<div class="alert alert-danger">' . $error_messages[$_GET['error']] . '</div>';
    }
}
?>

<div class="flex justify-between align-center mb-3">
    <h2>Pet Rescue History</h2>
    <a href="new-rescue-request.php" class="btn btn-primary">New Request</a>
</div>

<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>User Code</th>
                <th>User Name</th>
                <th>Phone</th>
                <th>Pet Type</th>
                <th>Condition</th>
                <th>Location</th>
                <th>Situation</th>
                <th>Donation</th>
                <th>Status</th>
                <th>Assigned Rescuer</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($requests)): ?>
                <tr>
                    <td colspan="12" class="text-center">No rescue requests found.</td>
                </tr>
            <?php else: ?>
                <?php foreach ($requests as $request): ?>
                    <tr>
                        <td><?php echo $request['id']; ?></td>
                        <td><?php echo htmlspecialchars($request['user_code']); ?></td>
                        <td><?php echo htmlspecialchars($request['user_name']); ?></td>
                        <td><?php echo htmlspecialchars($request['user_phone']); ?></td>
                        <td><?php echo htmlspecialchars($request['pet_type']); ?></td>
                        <td>
                            <span class="status-badge status-<?php echo strtolower($request['pet_condition']); ?>">
                                <?php echo $request['pet_condition']; ?>
                            </span>
                        </td>
                        <td><?php echo htmlspecialchars($request['location']); ?></td>
                        <td>
                            <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" 
                                 title="<?php echo htmlspecialchars($request['situation_description']); ?>">
                                <?php echo htmlspecialchars($request['situation_description']); ?>
                            </div>
                        </td>
                        <td>
                            <?php echo $request['donation_amount'] ? '৳' . number_format($request['donation_amount'], 2) : 'N/A'; ?>
                        </td>
                        <td>
                            <span class="status-badge status-<?php echo strtolower($request['status']); ?>">
                                <?php echo $request['status']; ?>
                            </span>
                        </td>
                        <td>
                            <?php if ($request['rescuer_name']): ?>
                                <?php echo htmlspecialchars($request['rescuer_name']); ?>
                                <br><small><?php echo htmlspecialchars($request['rescuer_phone']); ?></small>
                            <?php else: ?>
                                Not assigned
                            <?php endif; ?>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <a href="view-request.php?id=<?php echo $request['id']; ?>" 
                                   class="btn btn-primary">View</a>
                                
                                <?php if ($request['status'] === 'Pending'): ?>
                                    <button class="btn btn-success"
                                            data-action="assign" 
                                            data-request-id="<?php echo $request['id']; ?>"
                                            data-user-id="<?php echo $request['user_id']; ?>">
                                        Assign
                                    </button>
                                <?php endif; ?>
                                
                                <?php if ($request['status'] === 'Assigned' && !$request['approved']): ?>
                                    <a href="api/approve-request.php?id=<?php echo $request['id']; ?>" 
                                       class="btn btn-warning"
                                       onclick="return confirm('Mark this request as approved?')">
                                        Approve
                                    </a>
                                <?php endif; ?>
                                
                                <?php if ($request['status'] === 'Approved' || ($request['status'] === 'Assigned' && $request['approved'])): ?>
                                    <a href="complete-request.php?id=<?php echo $request['id']; ?>" 
                                       class="btn btn-success">
                                        Complete
                                    </a>
                                <?php endif; ?>
                                
                                <?php if ($request['status'] === 'Pending' || $request['status'] === 'Assigned'): ?>
                                    <a href="edit-request.php?id=<?php echo $request['id']; ?>" 
                                       class="btn btn-secondary">Edit</a>
                                <?php endif; ?>
                                
                                <a href="api/delete-request.php?id=<?php echo $request['id']; ?>" 
                                   class="btn btn-danger"
                                   data-action="delete" 
                                   data-confirm="Are you sure you want to delete this rescue request?">Delete</a>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
</div>


<?php include 'includes/footer.php'; ?>
