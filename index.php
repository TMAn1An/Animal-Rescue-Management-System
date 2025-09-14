<?php
require_once 'includes/config.php';
$pageTitle = 'Animal Rescue Management System - Home';

// Get dashboard stats
try {
    $pdo = getDB();
    
    // Total users
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $totalUsers = $stmt->fetch()['count'];
    
    // Total rescuers
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM rescuers");
    $totalRescuers = $stmt->fetch()['count'];
    
    // Pending requests
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM rescue_requests WHERE status = 'Pending'");
    $pendingRequests = $stmt->fetch()['count'];
    
    // Completed requests
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM rescue_requests WHERE status = 'Completed'");
    $completedRequests = $stmt->fetch()['count'];
    
} catch (Exception $e) {
    $totalUsers = $totalRescuers = $pendingRequests = $completedRequests = 0;
}

include 'includes/header.php';
?>

<div style="text-align: center;">
<div class="hero-section cover" style="
    background: url('uploads/animal.jpg') center/cover no-repeat; 
    border-radius: 12px; 
    min-height: 340px; 
    position: relative; 
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
">
    <div style="position:absolute; inset:0; background: rgba(0,0,0,0.35);"></div>
    <div style="position: relative; text-align:center; color:#fff; padding: 40px 20px;">
        <h1 class="hero-title" style="color:#fff; text-shadow: 0 2px 8px rgba(0,0,0,0.6);">🐾 Animal Rescue Management</h1>
        <p class="hero-description" style="max-width: 820px; margin: 10px auto 0; color:#ecf0f1;">
            Helping rescue animals in Dhaka with efficient coordination and compassionate care.
        </p>
    </div>
</div>

<div class="info-cards">
    <div class="info-card">
        <div class="card-icon">👥</div>
        <h3 class="card-title">Registered Users</h3>
        <p class="card-description"><?php echo $totalUsers; ?> users registered in our system</p>
        <small>Use the menu above to view users.</small>
    </div>
    
    <div class="info-card">
        <div class="card-icon">🚑</div>
        <h3 class="card-title">Active Rescuers</h3>
        <p class="card-description"><?php echo $totalRescuers; ?> rescuers ready to help</p>
        <small>Use the menu above to view rescuers.</small>
    </div>
    
    <div class="info-card">
        <div class="card-icon">⏳</div>
        <h3 class="card-title">Pending Requests</h3>
        <p class="card-description"><?php echo $pendingRequests; ?> rescue requests awaiting assignment</p>
        <small>Navigate from the menu to manage requests.</small>
    </div>
    
    <div class="info-card">
        <div class="card-icon">✅</div>
        <h3 class="card-title">Completed Rescues</h3>
        <p class="card-description"><?php echo $completedRequests; ?> successful animal rescues</p>
        <small>Reports are available from the header menu.</small>
    </div>
    
    <div class="info-card">
        <div class="card-icon">👤</div>
        <h3 class="card-title">Register User</h3>
        <p class="card-description">Register new users who need rescue services</p>
        <small>Go to Register from the menu to add users.</small>
    </div>
    
    <div class="info-card">
        <div class="card-icon">🦸‍♂️</div>
        <h3 class="card-title">Register Rescuer</h3>
        <p class="card-description">Add new rescuers to help animals in need</p>
        <small>Go to Register from the menu to add rescuers.</small>
    </div>
</div>
</div>

<?php include 'includes/footer.php'; ?>
