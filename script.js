document.addEventListener('DOMContentLoaded', () => {

    // --- Signup Form Handling ---
    const signupButton = document.querySelector('#signup-btn'); // You need to add this ID to signup.html button
    if (signupButton) {
        signupButton.addEventListener('click', async (e) => {
            e.preventDefault();

            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!fullname || !email || !password) {
                alert('Please fill in all fields');
                return;
            }

            try {
                const response = await fetch('api/auth_signup.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullname, email, password })
                });
                const result = await response.json();

                if (result.success) {
                    alert('Signup successful! Redirecting to login...');
                    window.location.href = 'login.html';
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }

    // --- Login Form Handling ---
    const loginButton = document.querySelector('#login-btn'); // You need to add this ID to login.html button
    if (loginButton) {
        loginButton.addEventListener('click', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('api/auth_login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const result = await response.json();

                if (result.success) {
                    // Store user info
                    localStorage.setItem('user_name', result.user);
                    localStorage.setItem('user_role', result.role);
                    localStorage.setItem('user_id', result.user_id);

                    if (result.role && result.role.toLowerCase() === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    alert('Login failed: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred.');
            }
        });
    }
    // --- Search Handling ---
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const booksGrid = document.getElementById('booksGrid');

    const performSearch = async (genre = null) => {
        const query = searchInput ? searchInput.value : '';
        let url = `api/books.php?search=${encodeURIComponent(query)}`;

        if (genre) {
            url = `api/books.php?genre=${encodeURIComponent(genre)}`;
        }

        try {
            const response = await fetch(url);
            const books = await response.json();

            // Clear existing grid
            if (booksGrid) {
                booksGrid.innerHTML = '';

                if (books.length === 0) {
                    booksGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No books found matching your criteria.</p>';
                    return;
                }

                books.forEach((book, index) => {
                    // Geneerate pseudo-random gradient
                    const gradients = [
                        'linear-gradient(45deg, #1a1a1a, #4a4a4a)',
                        'linear-gradient(45deg, #c31432, #240b36)',
                        'linear-gradient(45deg, #f12711, #f5af19)',
                        'linear-gradient(45deg, #8360c3, #2ebf91)',
                        'linear-gradient(45deg, #00c6ff, #0072ff)',
                        'linear-gradient(45deg, #ff9966, #ff5e62)'
                    ];
                    const randomGradient = gradients[index % gradients.length];

                    let coverHtml = '';
                    if (book.cover_image && book.cover_image !== 'default_book.jpg' && !book.cover_image.endsWith('default_book.jpg')) {
                        coverHtml = `<img src="${book.cover_image}" alt="${book.title}" style="width:100%; height:100%; object-fit:cover;">`;
                    } else {
                        coverHtml = `
                            <div class="placeholder-cover" style="background: ${randomGradient};">
                                <span>${book.title}</span>
                            </div>`;
                    }

                    const bookData = encodeURIComponent(JSON.stringify(book));
                    const bookCard = `
                        <div class="book-card" style="cursor: pointer;" onclick="showBookDetails('${bookData}')">
                            <div class="book-cover">
                                ${coverHtml}
                                <div class="book-rating"><i class="fas fa-star"></i> ${book.rating}</div>
                            </div>
                            <div class="book-info">
                                <h3 class="book-title">${book.title}</h3>
                                <p class="book-author">${book.author}</p>
                                <div class="tags">
                                    <span class="tag">${book.genre || 'Fiction'}</span>
                                </div>
                            </div>
                        </div>
                    `;
                    booksGrid.insertAdjacentHTML('beforeend', bookCard);
                });
            }

        } catch (error) {
            console.error('Search error:', error);
        }
    };

    // --- Dynamic Categorized Genre Layout (for genres.html) ---
    const genresLayoutContainer = document.getElementById('genres-layout-container');
    const sidebarGenreList = document.getElementById('sidebar-genre-list');

    const loadGenresLayout = async () => {
        if (!genresLayoutContainer) return;

        try {
            const response = await fetch('api/books.php');
            const books = await response.json();

            // Group books by genre with normalization
            const grouped = books.reduce((acc, book) => {
                let genre = book.genre || 'Uncategorized';
                // Normalize to Title Case
                genre = genre.trim().toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

                if (!acc[genre]) acc[genre] = [];
                acc[genre].push(book);
                return acc;
            }, {});

            genresLayoutContainer.innerHTML = '';
            if (sidebarGenreList) sidebarGenreList.innerHTML = '';

            const sortedGenres = Object.keys(grouped).sort();

            // Populate Sidebar
            if (sidebarGenreList) {
                sortedGenres.forEach(genre => {
                    const link = `<a href="featured.html?genre=${encodeURIComponent(genre)}" class="sidebar-genre-link">${genre}</a>`;
                    sidebarGenreList.insertAdjacentHTML('beforeend', link);
                });
            }

            // Populate Main Area
            for (const genre of sortedGenres) {
                const genreBooks = grouped[genre];
                const genreRow = `
                    <div class="genre-row-container">
                        <div class="genre-row-header">
                            <h2 style="font-family: var(--font-heading); color: #333;">${genre}</h2>
                        </div>
                        <div class="genre-divider"></div>
                        <div class="genre-books-strip">
                            ${genreBooks.slice(0, 10).map(book => {
                    let coverHtml = '';
                    if (book.cover_image && book.cover_image !== 'default_book.jpg' && !book.cover_image.endsWith('default_book.jpg')) {
                        coverHtml = `<img src="${book.cover_image}" alt="${book.title}">`;
                    } else {
                        // Simplified placeholder for Goodreads look
                        coverHtml = `<div style="width:100%; height:100%; background:#f0f0f0; border:1px solid #ddd; display:flex; align-items:center; justify-content:center; color:#999; font-size:9px; overflow:hidden; padding:5px; text-align:center;">${book.title}</div>`;
                    }
                    const bookData = encodeURIComponent(JSON.stringify(book));
                    return `
                                    <div class="genre-book-item" style="cursor:pointer;" onclick="showBookDetails('${bookData}')">
                                        <div class="genre-book-cover">
                                            ${coverHtml}
                                        </div>
                                    </div>
                                `;
                }).join('')}
                        </div>
                        <a href="featured.html?genre=${encodeURIComponent(genre)}" class="more-genre-link">More ${genre.toLowerCase()}...</a>
                    </div>
                `;
                genresLayoutContainer.insertAdjacentHTML('beforeend', genreRow);
            }

        } catch (error) {
            console.error('Error loading genres layout:', error);
            genresLayoutContainer.innerHTML = '<p>Error loading books.</p>';
        }
    };

    // Expose global function for genre clicks
    window.filterByGenre = (genre) => {
        // If we are on index.html or featured.html, we use the original grid
        if (booksGrid) {
            performSearch(genre);
            const featuredSection = document.getElementById('featured');
            if (featuredSection) {
                featuredSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // If on genres.html and we want to switch back to deep search?
            // Actually, keep it simple: if on genres.html, just redirect with param or reload
            window.location.href = `featured.html?genre=${encodeURIComponent(genre)}`;
        }

        const genreTitle = document.getElementById('genre-title');
        if (genreTitle) genreTitle.innerText = `Genre: ${genre}`;
    };

    if (searchBtn) {
        searchBtn.addEventListener('click', () => performSearch());
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    // --- Dynamic Homepage Genres ---
    const homepageGenresContainer = document.getElementById('homepage-genres-container');

    const loadHomepageGenres = async () => {
        if (!homepageGenresContainer) return;

        try {
            const response = await fetch('api/books.php');
            const books = await response.json();

            // Extract unique genres and count books
            const counts = books.reduce((acc, book) => {
                let genre = book.genre || 'Uncategorized';
                genre = genre.trim().toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                acc[genre] = (acc[genre] || 0) + 1;
                return acc;
            }, {});

            const sortedGenres = Object.keys(counts).sort();
            homepageGenresContainer.innerHTML = '';

            const icons = {
                'Sci-Fi': 'fa-rocket',
                'Fantasy': 'fa-dragon',
                'Mystery': 'fa-user-secret',
                'Romance': 'fa-heart',
                'Fiction': 'fa-book',
                'Default': 'fa-tag'
            };

            const colors = {
                'Sci-Fi': { bg: 'rgba(255, 107, 107, 0.1)', icon: '#FF6B6B' },
                'Fantasy': { bg: 'rgba(78, 205, 196, 0.1)', icon: '#4ECDC4' },
                'Mystery': { bg: 'rgba(69, 183, 209, 0.1)', icon: '#45B7D1' },
                'Romance': { bg: 'rgba(255, 160, 122, 0.1)', icon: '#FFA07A' },
                'Default': { bg: 'rgba(108, 99, 255, 0.1)', icon: '#6C63FF' }
            };

            sortedGenres.forEach(genre => {
                const iconClass = icons[genre] || icons['Default'];
                const design = colors[genre] || colors['Default'];

                const card = `
                    <a href="#" class="category-card" onclick="filterByGenre('${genre}'); return false;">
                        <div class="icon-box" style="background: ${design.bg}; color: ${design.icon};">
                            <i class="fas ${iconClass}"></i>
                        </div>
                        <h3>${genre}</h3>
                        <p>${counts[genre]} Books</p>
                    </a>
                `;
                homepageGenresContainer.insertAdjacentHTML('beforeend', card);
            });

        } catch (error) {
            console.error('Error loading homepage genres:', error);
            homepageGenresContainer.innerHTML = '<p>Error loading categories.</p>';
        }
    };

    if (booksGrid) {
        // If URL has genre param, use it
        const urlParams = new URLSearchParams(window.location.search);
        const genreParam = urlParams.get('genre');
        performSearch(genreParam);
    }

    if (genresLayoutContainer) {
        loadGenresLayout();
    }

    if (homepageGenresContainer) {
        loadHomepageGenres();
    }
    // --- Book Details Redirect/Loading ---
    window.showBookDetails = (bookDataStr) => {
        try {
            const book = JSON.parse(decodeURIComponent(bookDataStr));
            window.location.href = `book-details.html?id=${book.id}`;
        } catch (e) {
            console.error('Error redirecting to book details:', e);
        }
    };

    const loadBookDetails = async () => {
        const detailsTitle = document.getElementById('details-title');
        if (!detailsTitle) return;

        const urlParams = new URLSearchParams(window.location.search);
        const bookId = urlParams.get('id');

        if (!bookId) {
            detailsTitle.textContent = 'Book not found';
            return;
        }

        try {
            const response = await fetch(`api/books.php?id=${bookId}`);
            if (!response.ok) throw new Error('Book not found');
            const book = await response.json();

            // Populate Page
            document.title = `${book.title} - BookWise`;
            detailsTitle.textContent = book.title;
            document.getElementById('details-author-link').textContent = book.author;
            document.getElementById('details-rating-val').textContent = book.rating;
            document.getElementById('details-avg-rating').textContent = book.rating;
            document.getElementById('details-description').innerHTML = book.description ? book.description.replace(/\n/g, '<br>') : 'No description available.';

            const coverImg = document.getElementById('details-cover');
            if (book.cover_image && book.cover_image !== 'default_book.jpg' && !book.cover_image.endsWith('default_book.jpg')) {
                coverImg.src = book.cover_image;
            }

            // Genre chips
            const genreContainer = document.getElementById('details-genres');
            if (genreContainer && book.genre) {
                const genres = book.genre.split(',').map(g => g.trim());
                genreContainer.innerHTML = genres.map(g => `<a href="featured.html?genre=${encodeURIComponent(g)}" class="genre-chip">${g}</a>`).join('');
            }

            // Load Related Books
            fetchRelatedBooks(book.genre, book.id);

            // Load Reviews
            loadReviews(book.id);

            // Handle Review Visibility based on Login
            const userName = localStorage.getItem('user_name');
            const userId = localStorage.getItem('user_id'); // Assuming user_id is stored
            const writeReviewBtn = document.getElementById('write-review-btn');

            if (userName && writeReviewBtn) {
                writeReviewBtn.style.display = 'block';
            }

        } catch (error) {
            console.error('Error loading book details:', error);
            detailsTitle.textContent = 'Error loading book details';
        }
    };

    const loadReviews = async (bookId) => {
        const container = document.getElementById('reviews-list-container');
        if (!container) return;

        try {
            const response = await fetch(`api/reviews.php?book_id=${bookId}`);
            const reviews = await response.json();

            if (reviews.length === 0) {
                container.innerHTML = '<p style="color: #999;">No reviews yet. Be the first to review!</p>';
                return;
            }

            container.innerHTML = reviews.map(review => `
                <div class="review-item">
                    <div class="review-header">
                        <span class="review-user">${review.user_name}</span>
                        <span class="review-date">${new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="review-stars">
                        ${'<i class="fas fa-star"></i>'.repeat(review.rating)}${'<i class="far fa-star"></i>'.repeat(5 - review.rating)}
                    </div>
                    <div class="review-text">${review.review_text}</div>
                </div>
            `).join('');

        } catch (e) {
            console.error('Error loading reviews:', e);
            container.innerHTML = '<p style="color: #999;">Error loading reviews.</p>';
        }
    };

    // Review Form Interaction
    let selectedRating = 0;
    const writeReviewBtn = document.getElementById('write-review-btn');
    const reviewForm = document.getElementById('review-form-container');
    const cancelReviewBtn = document.getElementById('cancel-review-btn');
    const submitReviewBtn = document.getElementById('submit-review-btn');
    const starIcons = document.querySelectorAll('#star-selector i');

    if (writeReviewBtn) {
        writeReviewBtn.onclick = () => {
            reviewForm.style.display = 'block';
            writeReviewBtn.style.display = 'none';
        }
    }

    if (cancelReviewBtn) {
        cancelReviewBtn.onclick = () => {
            reviewForm.style.display = 'none';
            writeReviewBtn.style.display = 'block';
        }
    }

    starIcons.forEach(icon => {
        icon.onclick = () => {
            selectedRating = parseInt(icon.getAttribute('data-value'));
            starIcons.forEach((s, index) => {
                if (index < selectedRating) {
                    s.classList.replace('far', 'fas');
                } else {
                    s.classList.replace('fas', 'far');
                }
            });
        };
    });

    if (submitReviewBtn) {
        submitReviewBtn.onclick = async () => {
            const reviewText = document.getElementById('review-text').value.trim();
            const urlParams = new URLSearchParams(window.location.search);
            const bookId = urlParams.get('id');
            const userId = localStorage.getItem('user_id'); // Ensure this is stored on login

            if (!selectedRating) {
                alert('Please select a star rating');
                return;
            }

            if (!userId) {
                alert('You must be logged in to post a review');
                return;
            }

            try {
                const response = await fetch('api/reviews.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        book_id: bookId,
                        user_id: userId,
                        rating: selectedRating,
                        review_text: reviewText
                    })
                });

                const result = await response.json();
                if (result.success) {
                    location.reload(); // Quick way to show the new review
                } else {
                    alert(result.error || 'Error submitting review');
                }
            } catch (e) {
                console.error('Error submitting review:', e);
            }
        };
    }

    const fetchRelatedBooks = async (genreStr, currentId) => {
        const container = document.getElementById('related-books-container');
        if (!container) return;

        try {
            // Get the first genre if multiple exist
            const primaryGenre = genreStr ? genreStr.split(',')[0].trim() : '';
            if (!primaryGenre) {
                container.innerHTML = '<p style="color: #999;">No similar books found.</p>';
                return;
            }

            const response = await fetch(`api/books.php?genre=${encodeURIComponent(primaryGenre)}`);
            const books = await response.json();

            // Filter out current book and limit to 6
            const related = books.filter(b => b.id != currentId).slice(0, 6);

            if (related.length === 0) {
                container.innerHTML = '<p style="color: #999;">No similar books found.</p>';
                return;
            }

            container.innerHTML = related.map(book => {
                const bookData = encodeURIComponent(JSON.stringify(book));
                return `
                    <div class="rec-item" onclick="showBookDetails('${bookData}')">
                        <img src="${book.cover_image || 'default_book.jpg'}" alt="${book.title}" class="rec-cover">
                    </div>
                `;
            }).join('');
        } catch (e) {
            console.error('Error fetching related books:', e);
            container.innerHTML = '';
        }
    };

    if (document.getElementById('details-title')) { // Check if on book-details.html
        loadBookDetails();
    }

    const checkLoginState = () => {
        const userName = localStorage.getItem('user_name');
        const userRole = localStorage.getItem('user_role');
        const authButtons = document.querySelector('.auth-buttons');

        if (userName && authButtons) {
            if (userRole === 'admin') return;

            let navHtml = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-weight: 500; color: #666;">Hi, ${userName}</span>
            `;

            navHtml += `
                <a href="#" id="logout-btn" class="btn-primary-outline" style="padding: 6px 18px; font-size: 0.85rem;">Logout</a>
                </div>
            `;

            authButtons.innerHTML = navHtml;

            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('user_name');
                    localStorage.removeItem('user_role');
                    localStorage.removeItem('user_id');
                    window.location.href = 'index.html';
                });
            }
        }
    };

    checkLoginState();
});
