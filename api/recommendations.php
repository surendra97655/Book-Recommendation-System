<?php
header('Content-Type: application/json');
require_once '../db_connect.php';

$action = isset($_GET['action']) ? $_GET['action'] : 'trending';
$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
$bookId = isset($_GET['book_id']) ? (int)$_GET['book_id'] : 0;

try {
    if ($action === 'related' && $bookId > 0) {
        // --- CONTENT-BASED: RELATED BOOKS ---
        // 1. Get current book details
        $stmt = $pdo->prepare("SELECT author, genre FROM books WHERE id = ?");
        $stmt->execute([$bookId]);
        $currentBook = $stmt->fetch();

        if (!$currentBook) {
            echo json_encode([]);
            exit;
        }

        $author = $currentBook['author'];
        $genre = $currentBook['genre'];

        // 2. Find similar books using weighted scoring
        // Author match: 3 points, Genre match: 2 points
        $sql = "SELECT *, 
                ((IF(author = :author, 3, 0)) + (IF(genre = :genre, 2, 0))) as score
                FROM books 
                WHERE id != :id 
                HAVING score > 0
                ORDER BY score DESC, rating DESC 
                LIMIT 6";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':author' => $author,
            ':genre' => $genre,
            ':id' => $bookId
        ]);
        echo json_encode($stmt->fetchAll());

    } elseif ($action === 'personalized' && $userId > 0) {
        // --- CONTENT-BASED: PERSONALIZED FOR USER ---
        
        // 1. Identify user preferences from wishlist and high-rated reviews
        $prefSql = "
            (SELECT genre, author FROM books b JOIN wishlist w ON b.id = w.book_id WHERE w.user_id = :uid)
            UNION
            (SELECT genre, author FROM books b JOIN reviews r ON b.id = r.book_id WHERE r.user_id = :uid AND r.rating >= 4)
        ";
        $stmt = $pdo->prepare($prefSql);
        $stmt->execute([':uid' => $userId]);
        $prefs = $stmt->fetchAll();

        if (empty($prefs)) {
            // Fallback to trending if no history
            getTrendingItems($pdo);
            exit;
        }

        $favGenres = array_unique(array_column($prefs, 'genre'));
        $favAuthors = array_unique(array_column($prefs, 'author'));

        // 2. Recommed books matching these genres/authors that aren't already interacted with
        // We'll build a query that scores books based on these favorites
        $genreList = "'" . implode("','", array_map('addslashes', $favGenres)) . "'";
        $authorList = "'" . implode("','", array_map('addslashes', $favAuthors)) . "'";

        $sql = "SELECT DISTINCT b.*, 
                ((IF(b.author IN ($authorList), 3, 0)) + (IF(b.genre IN ($genreList), 2, 0))) as score
                FROM books b
                LEFT JOIN wishlist w ON b.id = w.book_id AND w.user_id = :uid
                LEFT JOIN reviews r ON b.id = r.book_id AND r.user_id = :uid
                WHERE w.id IS NULL AND r.id IS NULL
                HAVING score > 0
                ORDER BY score DESC, rating DESC
                LIMIT 8";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':uid' => $userId]);
        $results = $stmt->fetchAll();

        if (empty($results)) {
            getTrendingItems($pdo);
        } else {
            echo json_encode($results);
        }

    } else {
        // DEFAULT: TRENDING / POPULAR
        getTrendingItems($pdo);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

function getTrendingItems($pdo) {
    $stmt = $pdo->query("SELECT * FROM books ORDER BY rating DESC, created_at DESC LIMIT 8");
    echo json_encode($stmt->fetchAll());
}
?>
