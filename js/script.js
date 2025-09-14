// Animal Rescue Management System JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize form handlers
    initFormHandlers();
    
    // Initialize modal handlers
    initModals();
    
    // Initialize table actions
    initTableActions();
});

// Mobile menu functionality
function initMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Form handlers
function initFormHandlers() {
    // Handle all forms with AJAX
    const forms = document.querySelectorAll('form[data-ajax="true"]');
    
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
}

// Handle AJAX form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Processing...';
    
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('success', result.message);
            
            // Reset form if successful
            form.reset();
            
            // Reload page after short delay for list pages
            if (window.location.pathname.includes('users.php') || 
                window.location.pathname.includes('rescuers.php') || 
                window.location.pathname.includes('pet-history.php')) {
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } else {
            showAlert('danger', result.message);
        }
    } catch (error) {
        showAlert('danger', 'An error occurred. Please try again.');
        console.error('Form submission error:', error);
    } finally {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
}

// Modal functionality
function initModals() {
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Close modal with close button
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = btn.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
}

// Show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Table actions
function initTableActions() {
    // Delete confirmations
    const deleteButtons = document.querySelectorAll('[data-action="delete"]');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const confirmMessage = btn.getAttribute('data-confirm') || 'Are you sure you want to delete this item?';
            
            if (confirm(confirmMessage)) {
                // Proceed with deletion
                const url = btn.href || btn.getAttribute('data-url');
                if (url) {
                    window.location.href = url;
                }
            }
        });
    });
    
    // Assign rescuer functionality
    const assignButtons = document.querySelectorAll('[data-action="assign"]');
    assignButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const requestId = btn.getAttribute('data-request-id');
            const userId = btn.getAttribute('data-user-id');
            showAssignModal(requestId, userId);
        });
    });
}

// Show assign rescuer modal
function showAssignModal(requestId, userId) {
    const modalHtml = `
        <div id="assign-modal" class="modal">
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <h3>Assign Rescuer</h3>
                <form id="assign-form" action="api/assign-rescuer.php" method="POST" data-ajax="true">
                    <input type="hidden" name="request_id" value="${requestId}">
                    <input type="hidden" name="user_id" value="${userId}">
                    
                    <div class="form-group">
                        <label for="rescuer_id" class="form-label">Select Rescuer:</label>
                        <select name="rescuer_id" id="rescuer_id" class="form-select" required>
                            <option value="">Loading rescuers...</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="estimated_arrival" class="form-label">Estimated Arrival Time:</label>
                        <input type="datetime-local" name="estimated_arrival" id="estimated_arrival" class="form-control" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Assign Rescuer</button>
                </form>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('assign-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Load rescuers
    loadRescuers();
    
    // Initialize modal
    showModal('assign-modal');

    // Use local time for min on datetime-local and set default value
    const etaInput = document.getElementById('estimated_arrival');
    const pad = (n) => String(n).padStart(2, '0');
    const toLocalInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const nowLocal = toLocalInput(new Date());
    etaInput.setAttribute('min', nowLocal);
    if (!etaInput.value) etaInput.value = nowLocal;
    
    // Add form handler with client-side validation to block past dates
    const form = document.getElementById('assign-form');
    form.addEventListener('submit', function(e) {
        const val = etaInput.value; // format YYYY-MM-DDTHH:MM (local)
        const nowAtSubmit = toLocalInput(new Date());
        if (val && val < nowAtSubmit) {
            e.preventDefault();
            e.stopImmediatePropagation();
            showAlert('danger', 'Estimated arrival cannot be in the past.');
            etaInput.focus();
            return false;
        }
    });
    form.addEventListener('submit', handleFormSubmit);
}

// Load rescuers for assignment
async function loadRescuers() {
    try {
        const response = await fetch('api/get-rescuers.php');
        const result = await response.json();
        
        const select = document.getElementById('rescuer_id');
        
        if (result.success && result.data.length > 0) {
            select.innerHTML = '<option value="">Select a rescuer</option>';
            
            result.data.forEach(rescuer => {
                select.innerHTML += `<option value="${rescuer.id}">${rescuer.name} - ${rescuer.phone}</option>`;
            });
        } else {
            select.innerHTML = '<option value="">No rescuers available</option>';
        }
    } catch (error) {
        console.error('Error loading rescuers:', error);
        const select = document.getElementById('rescuer_id');
        select.innerHTML = '<option value="">Error loading rescuers</option>';
    }
}

// Show alert message
function showAlert(type, message) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    // Insert at the top of main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(alertDiv, mainContent.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
        
        // Scroll to top to show alert
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Search functionality
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

async function performSearch() {
    const searchInput = document.getElementById('search-input');
    const phone = searchInput.value.trim();
    
    if (!phone) {
        showAlert('danger', 'Please enter a phone number to search.');
        return;
    }
    
    try {
        const response = await fetch('api/search-user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `phone=${encodeURIComponent(phone)}`
        });
        
        const result = await response.json();
        
        const resultDiv = document.getElementById('search-results');
        
        if (result.success && result.data) {
            const user = result.data;
            resultDiv.innerHTML = `
                <div class="info-card">
                    <h3>User Found</h3>
                    <p><strong>User Code:</strong> ${user.user_code}</p>
                    <p><strong>Name:</strong> ${user.name}</p>
                    <p><strong>Phone:</strong> ${user.phone}</p>
                    <p><strong>Registered:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="alert alert-info">
                    No user found with phone number: ${phone}
                </div>
            `;
        }
    } catch (error) {
        console.error('Search error:', error);
        showAlert('danger', 'An error occurred during search. Please try again.');
    }
}

// Print functionality
function printSlip(type, id) {
    const url = type === 'user' ? `print-slip.php?id=${id}` : `print-receipt.php?id=${id}`;
    window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
}

// Initialize page-specific functionality
function initPageSpecific() {
    // Search page
    if (window.location.pathname.includes('search.php')) {
        initSearch();
    }
}

// Call page-specific initialization
initPageSpecific();
