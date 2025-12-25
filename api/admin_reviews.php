<?php
header('Content-Type: application/json');
require_once '../db_connect.php';

// Simulate simple admin check (in a real app, use sessions/roles)
// For now, we assume if you can call this, you're targeting admin functionality

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $sql = "SELECT r.*, u.full_name as user_name, b.title as book_title 
                FROM reviews r 
                JOIN users u ON r.user_id = u.id 
                JOIN books b ON r.book_id = b.id 
                ORDER BY r.created_at DESC";
        $stmt = $pdo->query($sql);
        $reviews = $stmt->fetchAll();
        echo json_encode($reviews);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} 

elseif ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing review id']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM reviews WHERE id = :id");
        $stmt->execute([':id' => $id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Review deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Review not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}
?>
