<?php
header('Content-Type: application/json');
require_once '../db_connect.php';

$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$genre = isset($_GET['genre']) ? trim($_GET['genre']) : '';

try {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($id > 0) {
        $sql = "SELECT * FROM books WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $book = $stmt->fetch();
        if ($book) {
            echo json_encode($book);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Book not found']);
        }
        exit;
    }

    $sql = "SELECT * FROM books WHERE 1=1";
    $params = [];

    if (!empty($search)) {
        $sql .= " AND (title LIKE :search OR author LIKE :search)";
        $params[':search'] = "%$search%";
    }

    if (!empty($genre)) {
        $sql .= " AND genre LIKE :genre";
        $params[':genre'] = "%$genre%";
    }

    $sql .= " ORDER BY created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $books = $stmt->fetchAll();

    echo json_encode($books);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?>
