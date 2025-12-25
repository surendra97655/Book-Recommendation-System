<?php
require_once 'db_connect.php';

try {
    // Check if column 'role' exists
    $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'role'");
    $roleExists = $stmt->fetch();
    echo "Role Column Exists: " . ($roleExists ? "YES" : "NO") . "\n";

    // Check Admin User
    $stmt = $pdo->prepare("SELECT id, full_name, email, role, password_hash FROM users WHERE email = ?");
    $stmt->execute(['admin@bookwise.com']);
    $user = $stmt->fetch();

    if ($user) {
        echo "User Found: YES\n";
        echo "Role: " . $user['role'] . "\n";
        
        // Verify 'password'
        if (password_verify('password', $user['password_hash'])) {
            echo "Password 'password': CORRECT\n";
        } else {
            echo "Password 'password': WRONG\n";
        }
    } else {
        echo "User Found: NO\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
