document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();

    // Admin Logout
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_id');
            window.location.href = 'index.html';
        });
    }
});

// Navigation
function switchTab(tabId) {
    // Hide all sections
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('books-section').style.display = 'none';
    document.getElementById('users-section').style.display = 'none';
    document.getElementById('reviews-section').style.display = 'none';

    // Show selected
    document.getElementById(tabId + '-section').style.display = 'block';

    // Load data
    if (tabId === 'dashboard') loadDashboard();
    if (tabId === 'books') loadBooks();
    if (tabId === 'users') loadUsers();
    if (tabId === 'reviews') loadReviews();
}

async function loadDashboard() {
    const res = await fetch('api/admin_stats.php');
    const data = await res.json();

    document.getElementById('total-books').textContent = data.total_books;
    document.getElementById('total-users').textContent = data.total_users;
    document.getElementById('total-reviews').textContent = data.total_reviews;

    const tbody = document.querySelector('#recent-books-table tbody');
    tbody.innerHTML = data.recent_books.map(book => `
        <tr>
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td><i class="fas fa-star text-warning"></i> ${book.rating}</td>
            <td>
                <button class="action-btn" onclick='openEditBookModal(${JSON.stringify(book).replace(/'/g, "&#39;")})' style="background-color: #3498db; margin-right: 5px;">Edit</button>
                <button class="action-btn" onclick="deleteBook(${book.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function loadBooks() {
    const res = await fetch('api/admin_books.php');
    const books = await res.json();

    const tbody = document.querySelector('#all-books-table tbody');
    tbody.innerHTML = books.map(book => `
        <tr>
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.genre}</td>
            <td>
                <button class="action-btn" onclick='openEditBookModal(${JSON.stringify(book).replace(/'/g, "&#39;")})' style="background-color: #3498db; margin-right: 5px;">Edit</button>
                <button class="action-btn" onclick="deleteBook(${book.id})">Delete</button>
            </td>
        </tr>
    `).join('');

    // Populate Genre Suggestions Datalist
    const datalist = document.getElementById('genre-list');
    if (datalist) {
        const uniqueGenres = [...new Set(books.map(b => b.genre).filter(g => g))].sort();
        datalist.innerHTML = uniqueGenres.map(g => `<option value="${g}">`).join('');
    }
}

async function loadUsers() {
    const res = await fetch('api/admin_users.php');
    const users = await res.json();

    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.full_name}</td>
            <td>${user.email}</td>
            <td><span class="badge ${user.role === 'admin' ? 'bg-purple' : ''}">${user.role}</span></td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td>
                <button class="action-btn" onclick="openEditUserModal(${user.id}, '${user.full_name}', '${user.role}')" style="background-color: #3498db; margin-right: 5px;">Edit</button>
                ${user.role !== 'admin' ? `<button class="action-btn" onclick="deleteUser(${user.id})">Delete</button>` : ''}
            </td>
        </tr>
    `).join('');
}

async function loadReviews() {
    const res = await fetch('api/admin_reviews.php');
    const reviews = await res.json();

    const tbody = document.querySelector('#admin-reviews-table tbody');
    tbody.innerHTML = reviews.map(review => `
        <tr>
            <td>${review.id}</td>
            <td>${review.book_title}</td>
            <td>${review.user_name}</td>
            <td><i class="fas fa-star" style="color: #FCAC23;"></i> ${review.rating}</td>
            <td style="max-width: 300px; font-size: 0.85rem;">${review.review_text}</td>
            <td>${new Date(review.created_at).toLocaleDateString()}</td>
            <td>
                <button class="action-btn" onclick="deleteReview(${review.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function deleteReview(id) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
        const res = await fetch(`api/admin_reviews.php?id=${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            loadReviews();
            loadDashboard(); // Update stats
        } else {
            alert('Error: ' + result.error);
        }
    } catch (e) {
        console.error('Error deleting review:', e);
    }
}

// Actions
function openAddBookModal() {
    document.getElementById('addBookModal').classList.add('active');
}
function closeModal() {
    document.getElementById('addBookModal').classList.remove('active');
}

async function addBook() {
    const title = document.getElementById('new-title').value;
    const author = document.getElementById('new-author').value;
    const genre = document.getElementById('new-genre').value;
    const description = document.getElementById('new-desc').value;
    const rating = document.getElementById('new-rating').value;
    const price = document.getElementById('new-price').value;
    const coverFile = document.getElementById('new-cover').files[0];

    if (!title || !author) { alert('Title and Author are required'); return; }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('genre', genre);
    formData.append('description', description);
    formData.append('rating', rating);
    formData.append('price', price);
    if (coverFile) {
        formData.append('cover_image', coverFile);
    }

    try {
        const res = await fetch('api/admin_books.php', {
            method: 'POST',
            body: formData
        });
        const result = await res.json();

        if (result.success) {
            closeModal();
            loadDashboard();
            alert('Book Added!');
        } else {
            alert('Error adding book: ' + (result.message || 'Unknown error'));
        }
    } catch (e) {
        console.error(e);
        alert('Request failed');
    }
}

// Edit Books
let currentBookId = null;
function openEditBookModal(book) {
    currentBookId = book.id;
    document.getElementById('edit-book-id').value = book.id;
    document.getElementById('edit-title').value = book.title;
    document.getElementById('edit-author').value = book.author;
    document.getElementById('edit-genre').value = book.genre;
    document.getElementById('edit-desc').value = book.description;
    document.getElementById('edit-rating').value = book.rating;
    document.getElementById('edit-price').value = book.price;

    // Show current image logic
    const imgPreview = document.getElementById('edit-cover-preview');
    if (book.cover_image && book.cover_image !== 'default_book.jpg') {
        imgPreview.src = book.cover_image;
        imgPreview.style.display = 'block';
    } else {
        imgPreview.style.display = 'none';
    }
    document.getElementById('edit-cover').value = ''; // Clear file input

    document.getElementById('editBookModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editBookModal').classList.remove('active');
}

async function updateBook() {
    const id = document.getElementById('edit-book-id').value;
    const title = document.getElementById('edit-title').value;
    const author = document.getElementById('edit-author').value;
    const genre = document.getElementById('edit-genre').value;
    const description = document.getElementById('edit-desc').value;
    const rating = document.getElementById('edit-rating').value;
    const price = document.getElementById('edit-price').value;
    const coverFile = document.getElementById('edit-cover').files[0];

    const formData = new FormData();
    formData.append('id', id);
    formData.append('title', title);
    formData.append('author', author);
    formData.append('genre', genre);
    formData.append('description', description);
    formData.append('rating', rating);
    formData.append('price', price);

    if (coverFile) {
        formData.append('cover_image', coverFile);
    }

    try {
        const res = await fetch('api/admin_books.php', {
            method: 'POST',
            body: formData
        });
        const result = await res.json();

        if (result.success) {
            closeEditModal();
            loadDashboard();
            if (document.getElementById('books-section').style.display === 'block') loadBooks();
            alert('Book Updated!');
        } else {
            alert('Error updating book: ' + (result.message || 'Unknown error'));
        }
    } catch (e) {
        console.error(e);
        alert('Request failed');
    }
}

// Edit Users
function openEditUserModal(id, name, role) {
    document.getElementById('edit-user-id').value = id;
    document.getElementById('edit-user-name').textContent = 'User: ' + name;
    document.getElementById('edit-user-role').value = role;
    document.getElementById('editUserModal').classList.add('active');
}

function closeEditUserModal() {
    document.getElementById('editUserModal').classList.remove('active');
}

async function updateUser() {
    const id = document.getElementById('edit-user-id').value;
    const role = document.getElementById('edit-user-role').value;

    await fetch('api/admin_users.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role })
    });

    closeEditUserModal();
    loadUsers();
    alert('User Role Updated!');
}

async function deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
        await fetch(`api/admin_books.php?id=${id}`, { method: 'DELETE' });
        loadDashboard(); // Refresh
        if (document.getElementById('books-section').style.display === 'block') loadBooks();
    }
}

async function deleteUser(id) {
    if (confirm('Delete this user?')) {
        await fetch(`api/admin_users.php?id=${id}`, { method: 'DELETE' });
        loadUsers();
    }
}
