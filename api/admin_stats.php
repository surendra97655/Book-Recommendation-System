<?php
header('Content-Type: application/json');
require_once '../db_connect.php';

try {
    $booksCount = $pdo->query("SELECT COUNT(*) FROM books")->fetchColumn();
    $usersCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $reviewsCount = $pdo->query("SELECT COUNT(*) FROM reviews")->fetchColumn();

    // Fetch recent 5 books
    $stmt = $pdo->query("SELECT * FROM books ORDER BY created_at DESC LIMIT 5");
    $recentBooks = $stmt->fetchAll();

    echo json_encode([
        'total_books' => $booksCount,
        'total_users' => $usersCount,
        'total_reviews' => $reviewsCount,
        'recent_books' => $recentBooks
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?>
