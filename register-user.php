<?php
require_once 'includes/config.php';
$pageTitle = 'Register User - Animal Rescue Management';

include 'includes/header.php';
?>

<div class="form-container">
    <h2 class="text-center">Register New User</h2>
    <p class="text-center mb-3">Register users who need rescue services for their pets.</p>
    
    <form action="api/register-user.php" method="POST" data-ajax="true">
        <div class="form-group">
            <label for="name" class="form-label">Full Name *</label>
            <input type="text" id="name" name="name" class="form-control" required>
        </div>
        
        <div class="form-group">
            <label for="phone" class="form-label">Phone Number *</label>
            <input type="tel" id="phone" name="phone" class="form-control" 
                   placeholder="e.g., 01712345678" required>
            <small>Phone number must be unique in the system</small>
        </div>
        
        <div class="text-center mt-3">
            <button type="submit" class="btn btn-primary">Register User</button>
            <a href="index.php" class="btn btn-secondary">Back to Home</a>
        </div>
    </form>
</div>

<div class="info-card mt-3">
    <h3>About User Registration</h3>
    <ul>
        <li>Users only need to provide their name and phone number</li>
        <li>A unique user code will be automatically generated (format: PT_USER00001)</li>
        <li>Phone numbers must be unique in the system</li>
        <li>The generated user code is needed when creating rescue requests</li>
    </ul>
</div>

<?php include 'includes/footer.php'; ?>
