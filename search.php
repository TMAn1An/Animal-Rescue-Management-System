<?php
require_once 'includes/config.php';
$pageTitle = 'Search Users - Animal Rescue Management';

include 'includes/header.php';
?>

<div class="form-container">
    <h2>Search User by Phone Number</h2>
    <p>Find a user's information and user code by searching their phone number.</p>
    
    <div class="form-group">
        <label for="search-input" class="form-label">Phone Number</label>
        <input type="tel" id="search-input" class="form-control" 
               placeholder="e.g., 01712345678">
    </div>
    
    <button type="button" id="search-btn" class="btn btn-primary">Search User</button>
    <a href="index.php" class="btn btn-secondary">Back to Home</a>
</div>

<div id="search-results" class="mt-3">
    <!-- Search results will appear here -->
</div>

<div class="info-card mt-3">
    <h3>How to Use Search</h3>
    <ul>
        <li>Enter the exact phone number used during registration</li>
        <li>The search will return the user's code and basic information</li>
        <li>Use the user code when creating new rescue requests</li>
        <li>If no user is found, they may need to register first</li>
    </ul>
</div>

<?php include 'includes/footer.php'; ?>
