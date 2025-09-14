<?php
require_once 'includes/config.php';
$pageTitle = 'New Rescue Request - Animal Rescue Management';

include 'includes/header.php';
?>

<div class="form-container">
    <h2 class="text-center">Create New Rescue Request</h2>
    <p class="text-center mb-3">Report an animal that needs rescue assistance.</p>
    
    <form action="api/create-rescue-request.php" method="POST" data-ajax="true">
        <div class="form-group">
            <label for="user_code" class="form-label">User Code *</label>
            <input type="text" id="user_code" name="user_code" class="form-control" 
                   placeholder="e.g., PT_USER00001" required>
            <small>Don't know your user code? <a href="search.php">Search by phone number</a></small>
        </div>
        
        <div class="form-group">
            <label for="pet_type" class="form-label">Pet Type *</label>
            <select id="pet_type" name="pet_type" class="form-select" required>
                <option value="">Select pet type</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Other">Other</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="pet_condition" class="form-label">Pet Condition *</label>
            <select id="pet_condition" name="pet_condition" class="form-select" required>
                <option value="">Select condition</option>
                <option value="Normal">Normal - Pet appears healthy</option>
                <option value="Moderate">Moderate - Minor injuries or illness</option>
                <option value="Serious">Serious - Severe injuries or critical condition</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="location" class="form-label">Location *</label>
            <input type="text" id="location" name="location" class="form-control" 
                   placeholder="e.g., Dhanmondi 27, Dhaka" required>
            <small style="color:#c0392b">We currently serve only within Dhaka. Please ensure the location includes "Dhaka".</small>
        </div>
        
        <div class="form-group">
            <label for="situation_description" class="form-label">Animal Situation Description *</label>
            <textarea id="situation_description" name="situation_description" class="form-control" 
                      placeholder="Please describe the animal's condition, behavior, and the circumstances in which you found it. Include details like: Is it injured? Where exactly did you find it? How does it behave? Any visible health issues?" 
                      required rows="4"></textarea>
            <small>Please provide as much detail as possible to help rescuers understand the situation</small>
        </div>
        
        <div class="form-group">
            <label for="additional_note" class="form-label">Additional Notes</label>
            <textarea id="additional_note" name="additional_note" class="form-control" 
                      placeholder="Any other relevant information or special instructions"></textarea>
        </div>
        
        <div class="form-group">
            <label for="donation_amount" class="form-label">Donation Amount (Optional)</label>
            <input type="number" id="donation_amount" name="donation_amount" class="form-control" 
                   step="0.01" min="0" placeholder="e.g., 500.00">
            <small>Optional donation to support the rescue operation</small>
        </div>
        
        <div class="text-center mt-3">
            <button type="submit" class="btn btn-primary">Submit Rescue Request</button>
            <a href="index.php" class="btn btn-secondary">Cancel</a>
        </div>
    </form>
</div>

<div class="info-card mt-3">
    <h3>Important Information</h3>
    <ul>
        <li>You must be a registered user to create rescue requests</li>
        <li>A detailed description of the animal's situation is required</li>
        <li>Provide accurate location information for quick response</li>
        <li>Donations help cover medical treatment and care costs</li>
        <li>Serious conditions will be prioritized for assignment</li>
    </ul>
</div>

<?php include 'includes/footer.php'; ?>
<script>
// Enforce Dhaka-only location on the client side
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form[action="api/create-rescue-request.php"]');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        const loc = (document.getElementById('location').value || '').toLowerCase();
        // Accept if contains 'dhaka' word; trim common punctuation
        if (!/\bdhaka\b/.test(loc)) {
            e.preventDefault();
            alert('Sorry, we currently serve only within Dhaka. Please enter a Dhaka location.');
            document.getElementById('location').focus();
            return false;
        }
    });
});
</script>
