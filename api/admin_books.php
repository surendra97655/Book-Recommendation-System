<?php
header('Content-Type: application/json');
require_once '../db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM books ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll());
} 
elseif ($method === 'POST') {
    // Check if it's a JSON request (legacy/fallback) or FormData
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';

    if (strpos($contentType, 'application/json') !== false) {
        // Handle JSON (Old way) - Convert to array
        $data = json_decode(file_get_contents("php://input"), true);
    } else {
        // Handle Form Data (New way)
        $data = $_POST;
    }

    $title = $data['title'] ?? null;
    $author = $data['author'] ?? null;
    $genre = isset($data['genre']) ? ucwords(strtolower(trim($data['genre']))) : null;
    $description = $data['description'] ?? null;
    $rating = $data['rating'] ?? null;
    $id = $data['id'] ?? null;
    
    // Handle File Upload
    $coverPath = null;
    if (isset($_FILES['cover_image']) && $_FILES['cover_image']['error'] === UPLOAD_ERR_OK) {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $fileType = mime_content_type($_FILES['cover_image']['tmp_name']);
        
        if (in_array($fileType, $allowedTypes)) {
            $uploadDir = '../uploads/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            
            $filename = uniqid() . '_' . basename($_FILES['cover_image']['name']);
            $targetPath = $uploadDir . $filename;
            
            if (move_uploaded_file($_FILES['cover_image']['tmp_name'], $targetPath)) {
                $coverPath = 'uploads/' . $filename;
            }
        }
    }
    
    // Fallback to existing URL or default if provided in text field (for backward fix capability)
    if (!$coverPath && isset($data['cover_image']) && !empty($data['cover_image'])) {
         $coverPath = $data['cover_image'];
    }

    if ($id) {
        // --- UPDATE ---
        $updateFields = "title=?, author=?, genre=?, description=?, rating=?";
        $params = [$title, $author, $genre, $description, $rating];
        
        if ($coverPath) {
            $updateFields .= ", cover_image=?";
            $params[] = $coverPath;
        }
        
        $params[] = $id;
        
        $stmt = $pdo->prepare("UPDATE books SET $updateFields WHERE id=?");
        if($stmt->execute($params)) {
             echo json_encode(['success' => true]);
        } else {
             echo json_encode(['success' => false, 'message' => 'Update failed']);
        }

    } else {
        // --- CREATE ---
        $coverPath = $coverPath ?: 'default_book.jpg';
        $stmt = $pdo->prepare("INSERT INTO books (title, author, genre, description, rating, cover_image) VALUES (?, ?, ?, ?, ?, ?)");
        if($stmt->execute([$title, $author, $genre, $description, $rating, $coverPath])) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Insert failed']);
        }
    }
}
elseif ($method === 'PUT') {
     // Deprecated in favor of POST for file support, but keep valid JSON return
     echo json_encode(['success' => false, 'message' => 'Use POST for updates with files']);
}
elseif ($method === 'DELETE') {
    // Basic delete handling via query param for simplicity
    if(isset($_GET['id'])) {
        $stmt = $pdo->prepare("DELETE FROM books WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(['success' => true]);
    }
}
?>
