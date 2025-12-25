<?php
header('Content-Type: application/json');
require_once '../db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $book_id = isset($_GET['book_id']) ? (int)$_GET['book_id'] : 0;
    
    if (!$book_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing book_id']);
        exit;
    }

    try {
        $sql = "SELECT r.*, u.full_name as user_name 
                FROM reviews r 
                JOIN users u ON r.user_id = u.id 
                WHERE r.book_id = :book_id 
                ORDER BY r.created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':book_id' => $book_id]);
        $reviews = $stmt->fetchAll();
        echo json_encode($reviews);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} 

elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $book_id = isset($data['book_id']) ? (int)$data['book_id'] : 0;
    $user_id = isset($data['user_id']) ? (int)$data['user_id'] : 0;
    $rating = isset($data['rating']) ? (int)$data['rating'] : 0;
    $review_text = isset($data['review_text']) ? trim($data['review_text']) : '';

    if (!$book_id || !$user_id || !$rating) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    try {
        // Simple check if user already reviewed
        $checkSql = "SELECT id FROM reviews WHERE book_id = :book_id AND user_id = :user_id";
        $stmt = $pdo->prepare($checkSql);
        $stmt->execute([':book_id' => $book_id, ':user_id' => $user_id]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'You have already reviewed this book']);
            exit;
        }

        $sql = "INSERT INTO reviews (book_id, user_id, rating, review_text) 
                VALUES (:book_id, :user_id, :rating, :review_text)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':book_id' => $book_id,
            ':user_id' => $user_id,
            ':rating' => $rating,
            ':review_text' => $review_text
        ]);

        echo json_encode(['success' => true, 'message' => 'Review submitted successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}
?>
