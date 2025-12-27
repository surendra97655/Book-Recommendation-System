-- Database: book_recommendation_db
CREATE DATABASE IF NOT EXISTS book_recommendation_db;
USE book_recommendation_db;

-- RESET: Drop old tables to ensure new schema is applied
-- Drop in reverse order of foreign keys
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Admin User (Password: password)
INSERT INTO users (full_name, email, password_hash, role) VALUES 
('Admin User', 'admin@bookwise.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Books Table
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    description TEXT,
    rating DECIMAL(3, 1) DEFAULT 0.0,
    price DECIMAL(10, 2) DEFAULT 0.00,
    cover_image VARCHAR(255) DEFAULT 'default_book.jpg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert dummy books (with prices)
INSERT INTO books (title, author, genre, description, rating, price, cover_image) VALUES 
('The Great Gatsby', 'F. Scott Fitzgerald', 'Classic', 'A novel about the American dream and the Roaring Twenties.', 4.5, 499.00, 'https://covers.openlibrary.org/b/id/8432047-L.jpg'),
('1984', 'George Orwell', 'Dystopian', 'A chilling prophecy about the future of a totalitarian regime.', 4.8, 350.00, 'https://covers.openlibrary.org/b/id/7222246-L.jpg'),
('Dune', 'Frank Herbert', 'Sci-Fi', 'The world\'s best-selling science fiction novel of all time.', 4.7, 750.00, 'https://covers.openlibrary.org/b/id/12693874-L.jpg'),
('Educated', 'Tara Westover', 'Memoir', 'A memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD.', 4.6, 520.00, 'https://covers.openlibrary.org/b/id/8389680-L.jpg'),
('To Kill a Mockingbird', 'Harper Lee', 'Classic', 'A story of racial injustice and the loss of innocence in the American South.', 4.9, 425.00, 'https://covers.openlibrary.org/b/id/8226191-L.jpg'),
('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 'The adventures of Bilbo Baggins as he seeks to reclaim a lost kingdom.', 4.8, 680.00, 'https://covers.openlibrary.org/b/id/6979861-L.jpg'),
('Project Hail Mary', 'Andy Weir', 'Sci-Fi', 'A lone astronaut must save humanity from an extinction-level threat.', 4.7, 850.00, 'https://covers.openlibrary.org/b/id/11187422-L.jpg'),
('Believe In Yourself', 'Joseph Murphy', 'Self-Help', 'An inspiring guide to harnessing the power of the subconscious mind.', 4.5, 299.00, 'https://covers.openlibrary.org/b/id/11266205-L.jpg'),
('Atomic Habits', 'James Clear', 'Self-Help', 'An easy & proven way to build good habits & break bad ones.', 4.8, 399.00, 'https://covers.openlibrary.org/b/id/12843464-L.jpg'),
('Foundation', 'Isaac Asimov', 'Sci-Fi', 'The first book in the Foundation series about the fall of a galactic empire.', 4.6, 450.00, 'https://covers.openlibrary.org/b/id/10519330-L.jpg'),
('The Catcher in the Rye', 'J.D. Salinger', 'Classic', 'A teenager\'s journey through New York City.', 4.0, 320.00, 'https://covers.openlibrary.org/b/id/8225266-L.jpg'),
('Pride and Prejudice', 'Jane Austen', 'Classic', 'A classic novel about manners, upbringing, and marriage.', 4.7, 480.00, 'https://covers.openlibrary.org/b/id/8225114-L.jpg'),
('The Silent Patient', 'Alex Michaelides', 'Thriller', 'A dynamic psychological thriller about a woman\'s act of violence.', 4.3, 550.00, 'https://covers.openlibrary.org/b/id/12536834-L.jpg'),
('Gone Girl', 'Gillian Flynn', 'Thriller', 'A complex thriller about a marriage gone wrong.', 4.2, 490.00, 'https://covers.openlibrary.org/b/id/12180846-L.jpg');

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL,
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_review (book_id, user_id)
);

-- Insert dummy reviews
INSERT INTO reviews (book_id, user_id, rating, review_text) VALUES 
(1, 1, 5, 'An absolute classic. The writing is superb and the themes are timeless.'),
(2, 1, 4, 'Terrifying and prophetic. Still relevant today.'),
(3, 1, 5, 'The depth of this world-building is unmatched. A masterpiece of sci-fi.');

-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_wishlist (user_id, book_id)
);
