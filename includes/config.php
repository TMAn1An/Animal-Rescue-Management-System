<?php
// Database configuration
class Database {
    private $host = 'localhost';
    private $db_name = 'animal_rescue_db';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                )
            );
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
            die();
        }
        
        return $this->conn;
    }
}

// Start session
session_start();

// Helper function to get database connection
function getDB() {
    $database = new Database();
    return $database->getConnection();
}

// Helper function for JSON responses
function jsonResponse($success, $message, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Helper function for form validation
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Helper function to generate next user code
function generateNextUserCode($pdo) {
    $stmt = $pdo->prepare("SELECT user_code FROM users ORDER BY id DESC LIMIT 1");
    $stmt->execute();
    $result = $stmt->fetch();
    
    if ($result) {
        // Extract number from last user code (PT_USER00001 -> 1)
        $lastNumber = (int) substr($result['user_code'], 8);
        $nextNumber = $lastNumber + 1;
    } else {
        $nextNumber = 1;
    }
    
    return 'PT_USER' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
}

// Set error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);
?>
