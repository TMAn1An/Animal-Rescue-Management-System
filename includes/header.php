<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($pageTitle) ? $pageTitle : 'Animal Rescue Management System'; ?></title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <header class="sticky-header">
        <nav class="nav-container">
            <div class="logo">
                <a href="index.php">
                    <img src="uploads/logo_animal.png" alt="Animal Rescue" style="height: 70px; width: auto;">
                </a>
            </div>
            <div class="nav-menu" id="nav-menu">
                <!-- <a href="index.php" class="nav-link">Home</a> -->
                <a href="register-user.php" class="nav-link">Register User</a>
                <a href="new-rescue-request.php" class="nav-link">Rescue Request</a>
                <a href="pet-history.php" class="nav-link">Pet History</a>
                <a href="register-rescuer.php" class="nav-link">Register Rescuer</a>
                <a href="users.php" class="nav-link">Users</a>
                <a href="rescuers.php" class="nav-link">Rescuers</a>
                <a href="search.php" class="nav-link">Search</a>
                <a href="reports.php" class="nav-link">Reports</a>
            </div>
        </nav>
    </header>

    <main class="main-content">
