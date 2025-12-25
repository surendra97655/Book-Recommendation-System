<?php
$host = 'localhost';
$dbname = 'book_recommendation_db';
$username = 'root'; // Default XAMPP username
$password = '';     // Default XAMPP password (leave empty)

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Return error as JSON if this file is included in an API call
    if (strpos($_SERVER['REQUEST_URI'], '/api/') !== false) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit;
    } else {
        die("Database connection failed: " . $e->getMessage());
    }
}
?>
