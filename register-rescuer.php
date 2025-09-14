<?php
require_once 'includes/config.php';
$pageTitle = 'Register Rescuer - Animal Rescue Management';

include 'includes/header.php';
?>

<div class="form-container">
    <h2 class="text-center">Register New Rescuer</h2>
    <p class="text-center mb-3">Register volunteers who will help rescue animals in need.</p>
    
    <form action="api/register-rescuer.php" method="POST" data-ajax="true">
        <div class="form-group">
            <label for="name" class="form-label">Full Name *</label>
            <input type="text" id="name" name="name" class="form-control" required>
        </div>
        
        <div class="form-group">
            <label for="nid" class="form-label">National ID (NID) *</label>
            <input type="text" id="nid" name="nid" class="form-control" 
                   placeholder="e.g., 1234567890123" required>
        </div>
        
        <div class="form-group">
            <label for="phone" class="form-label">Phone Number *</label>
            <input type="tel" id="phone" name="phone" class="form-control" 
                   placeholder="e.g., 01712345678" required>
        </div>
        
        <div class="text-center mt-3">
            <button type="submit" class="btn btn-success">Register Rescuer</button>
            <a href="index.php" class="btn btn-secondary">Back to Home</a>
        </div>
    </form>
</div>

<div class="info-card mt-3">
    <h3>About Rescuer Registration</h3>
    <ul>
        <li>Rescuers need to provide their full name, National ID, and phone number</li>
        <li>Rescuers will be available for assignment to rescue requests</li>
        <li>Each rescuer can be assigned to multiple rescue requests over time</li>
        <li>Contact information is used to coordinate rescue operations</li>
    </ul>
</div>

<?php include 'includes/footer.php'; ?>
