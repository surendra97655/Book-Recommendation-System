<?php
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "book_recommendation_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['error' => 'Connection failed: ' . $conn->connect_error]);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$book_id = $data['book_id'] ?? null;

if (!$book_id) {
    echo json_encode(['error' => 'Book ID is required']);
    exit;
}

// Fetch book price and title
$sql = "SELECT title, price FROM books WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $book_id);
$stmt->execute();
$result = $stmt->get_result();
$book = $result->fetch_assoc();

if (!$book) {
    echo json_encode(['error' => 'Book not found']);
    exit;
}

$amount = $book['price'];
$transaction_uuid = time() . "-" . uniqid(); // Unique transaction ID
$product_code = "EPAYTEST"; // Default for test environment
$secret_key = "8gBm/:&EnhH.1/q"; // Default for test environment

// Construct the signature string
// Format: total_amount,transaction_uuid,product_code
$signature_string = "total_amount=$amount,transaction_uuid=$transaction_uuid,product_code=$product_code";

// Generate HMAC-SHA256 hash and then Base64 encode it
$hash = hash_hmac('sha256', $signature_string, $secret_key, true);
$signature = base64_encode($hash);

echo json_encode([
    'amount' => $amount,
    'total_amount' => $amount,
    'transaction_uuid' => $transaction_uuid,
    'product_code' => $product_code,
    'signature' => $signature,
    'signed_field_names' => 'total_amount,transaction_uuid,product_code',
    'tax_amount' => 0,
    'psc' => 0,
    'pdc' => 0,
    'success_url' => "http://localhost/bookapp/payment-success.php?book_title=" . urlencode($book['title']),
    'failure_url' => "http://localhost/bookapp/book-details.html?id=$book_id&status=failed"
]);

$conn->close();
?>
