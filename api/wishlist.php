<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');

try {
    // Database connection
    require_once '../db_connect.php';

    $method = $_SERVER['REQUEST_METHOD'];
    $user_id = $_SESSION['user_id'] ?? null;

    if (!$user_id) {
        echo json_encode(['success' => false, 'error' => 'User not logged in']);
        exit;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Server initialization error: ' . $e->getMessage()]);
    exit;
}

try {
    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'fetch';

        if ($action === 'check') {
            // Check if specific book is in wishlist
            $book_id = $_GET['book_id'] ?? null;
            if (!$book_id) {
                echo json_encode(['success' => false, 'error' => 'Book ID required']);
                exit;
            }

            $stmt = $pdo->prepare("SELECT id FROM wishlist WHERE user_id = ? AND book_id = ?");
            $stmt->execute([$user_id, $book_id]);
            echo json_encode(['success' => true, 'in_wishlist' => $stmt->rowCount() > 0]);
            
        } else {
            // Fetch user's wishlist
            $stmt = $pdo->prepare("
                SELECT b.* 
                FROM books b 
                JOIN wishlist w ON b.id = w.book_id 
                WHERE w.user_id = ? 
                ORDER BY w.created_at DESC
            ");
            $stmt->execute([$user_id]);
            $books = $stmt->fetchAll();
            echo json_encode(['success' => true, 'wishlist' => $books]);
        }

    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $book_id = $data['book_id'] ?? null;

        if (!$book_id) {
            echo json_encode(['success' => false, 'error' => 'Book ID required']);
            exit;
        }

        // Toggle logic
        $stmt = $pdo->prepare("SELECT id FROM wishlist WHERE user_id = ? AND book_id = ?");
        $stmt->execute([$user_id, $book_id]);

        if ($stmt->rowCount() > 0) {
            // Remove from wishlist
            $stmt = $pdo->prepare("DELETE FROM wishlist WHERE user_id = ? AND book_id = ?");
            if ($stmt->execute([$user_id, $book_id])) {
                echo json_encode(['success' => true, 'action' => 'removed']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Failed to remove from wishlist']);
            }
        } else {
            // Add to wishlist
            $stmt = $pdo->prepare("INSERT INTO wishlist (user_id, book_id) VALUES (?, ?)");
            if ($stmt->execute([$user_id, $book_id])) {
                echo json_encode(['success' => true, 'action' => 'added']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Failed to add to wishlist']);
            }
        }
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    exit;
}

// $conn->close(); is not needed for PDO or handled by PHP exit
?>
