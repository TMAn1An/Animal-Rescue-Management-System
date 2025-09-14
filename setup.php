<?php
echo "<h2>🛠️ Animal Rescue Management System - Database Setup</h2>";

try {
    // Connect to MySQL without specifying database
    $pdo = new PDO("mysql:host=localhost", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p>✅ Connected to MySQL server</p>";
    
    // Read and execute the schema file
    $schema_file = 'database/schema.sql';
    
    if (!file_exists($schema_file)) {
        throw new Exception("Schema file not found: $schema_file");
    }
    
    $sql_content = file_get_contents($schema_file);
    
    if ($sql_content === false) {
        throw new Exception("Could not read schema file");
    }
    
    echo "<p>✅ Schema file loaded</p>";
    
    // Split SQL content into individual statements
    $sql_statements = explode(';', $sql_content);
    
    foreach ($sql_statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement) && !preg_match('/^(--|\/\*)/', $statement)) {
            try {
                $pdo->exec($statement);
            } catch (PDOException $e) {
                // Ignore errors for statements that might already exist
                if (!strpos($e->getMessage(), 'already exists')) {
                    echo "<p>⚠️ Warning: " . $e->getMessage() . "</p>";
                }
            }
        }
    }
    
    echo "<p>✅ Database schema executed successfully</p>";
    
    // Test the connection to the new database
    $pdo_test = new PDO("mysql:host=localhost;dbname=animal_rescue_db;charset=utf8mb4", "root", "");
    
    // Check if sample data was inserted
    $stmt = $pdo_test->query("SELECT COUNT(*) as count FROM users");
    $user_count = $stmt->fetch()['count'];
    
    $stmt = $pdo_test->query("SELECT COUNT(*) as count FROM rescuers");
    $rescuer_count = $stmt->fetch()['count'];
    
    $stmt = $pdo_test->query("SELECT COUNT(*) as count FROM rescue_requests");
    $request_count = $stmt->fetch()['count'];
    
    echo "<h3>📊 Database Statistics:</h3>";
    echo "<ul>";
    echo "<li>Users: $user_count</li>";
    echo "<li>Rescuers: $rescuer_count</li>";
    echo "<li>Rescue Requests: $request_count</li>";
    echo "</ul>";
    
    echo "<div style='background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;'>";
    echo "<h3 style='color: #155724; margin: 0;'>🎉 Setup Complete!</h3>";
    echo "<p style='color: #155724; margin: 10px 0 0 0;'>Your Animal Rescue Management System is ready to use.</p>";
    echo "</div>";
    
    echo "<p><strong>What's Next:</strong></p>";
    echo "<ol>";
    echo "<li><a href='index.php'><strong>Go to Homepage</strong></a></li>";
    echo "<li><a href='register-user.php'>Register a new user</a></li>";
    echo "<li><a href='new-rescue-request.php'>Create a rescue request</a></li>";
    echo "<li><a href='pet-history.php'>View all rescue requests</a></li>";
    echo "</ol>";
    
    echo "<p><em>Sample users already created: PT_USER00001, PT_USER00002, PT_USER00003</em></p>";
    
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;'>";
    echo "<h3 style='color: #721c24; margin: 0;'>❌ Setup Failed</h3>";
    echo "<p style='color: #721c24; margin: 10px 0 0 0;'>Error: " . $e->getMessage() . "</p>";
    echo "</div>";
    
    echo "<p><strong>Troubleshooting:</strong></p>";
    echo "<ul>";
    echo "<li>Make sure XAMPP MySQL service is running</li>";
    echo "<li>Check if database/schema.sql file exists</li>";
    echo "<li>Try refreshing this page</li>";
    echo "</ul>";
    
    echo "<p><a href='test.php'>← Back to System Test</a></p>";
}
?>
