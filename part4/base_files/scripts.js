const API_URL = 'http://127.0.0.1:5000/api/v1';
let currentPlace = null; // place globale pour le formulaire

/* ======================
    COOKIES & AUTH
====================== */
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return value;
    }
    return null;
}

function isAuthenticated() {
    return !!getCookie('token');
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

/* ======================
    LOGIN LINK
====================== */
function toggleLoginLink() {
    const loginLink = document.querySelector('.login-button');
    if (!loginLink) return;
    loginLink.style.display = isAuthenticated() ? 'none' : 'block';
}

/* ======================
    LOGIN FORM
====================== */
function handleLogin() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.email.value;
        const password = form.password.value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                document.cookie = `token=${data.access_token}; path=/`;
                toggleLoginLink();
                window.location.href = 'index.html';
            } else {
                alert(data.message || "Login failed");
            }
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la connexion");
        }
    });
}

/* ======================
    CREATE PLACE CARDS
====================== */
function createCards(places) {
    const container = document.getElementById('places-list');
    if (!container) return;
    container.innerHTML = '';

    places.forEach(place => {
        const price = Number(place.price_by_night || place.price || 0);

        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3';

        const article = document.createElement('article');
        article.className = 'place-card card p-3 d-flex flex-column w-100';
        article.dataset.price = price; // ⭐ IMPORTANT POUR LE FILTRE

        const title = document.createElement('h2');
        title.textContent = place.name;

        const priceText = document.createElement('p');
        priceText.textContent = `Price per night: $${price}`;

        const link = document.createElement('a');
        link.href = `./place.html?id=${place.id}`;
        link.className = 'btn btn-rose mt-auto';
        link.textContent = 'View Details';

        article.appendChild(title);
        article.appendChild(priceText);
        article.appendChild(link);
        col.appendChild(article);
        container.appendChild(col);
    });
}

/* ======================
    PRICE FILTER
====================== */
function setupPriceFilter() {
    const priceFilter = document.getElementById('price-filter');
    if (!priceFilter) return;

    priceFilter.addEventListener('change', function () {
        const selected = this.value;
        const cards = document.querySelectorAll('.place-card');

        cards.forEach(card => {
            const price = Number(card.dataset.price);
            const col = card.closest('.col-md-4');

            if (selected === "") {
                col.style.display = "";
            } else if (selected === "10" && price < 50) {
                col.style.display = "";
            } else if (selected === "50" && price >= 50 && price < 100) {
                col.style.display = "";
            } else if (selected === "100" && price >= 100) {
                col.style.display = "";
            } else {
                col.style.display = "none";
            }
        });
    });
}

/* ======================
    LOAD PLACES
====================== */
async function loadPlaces() {
    try {
        const response = await fetch(`${API_URL}/places/`);
        if (!response.ok) throw new Error(`Status ${response.status}`);

        const places = await response.json();
        if (!places.length) return false;

        createCards(places);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}
/* ======================
    FETCH PLACE DETAILS
====================== */
async function fetchPlaceDetails() {
    const placeId = getPlaceIdFromURL();
    if (!placeId) return;

    const headers = {};
    const token = getCookie('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${API_URL}/places/${placeId}`, { headers });

        if (!response.ok) {
            console.warn("API failed → using fallback");

            const fallbackPlaces = {
                "1": {
                    id: 1,
                    name: "Beautiful Beach House",
                    price_by_night: 10,
                    description: "A beautiful beach house with amazing views",
                    owner: { first_name: "John" },
                    amenities: [
                        { name: "Wifi" },
                        { name: "Pool" },
                        { name: "Air Conditioning" }
                    ],
                    reviews: [
                        { user: { first_name: "Jane" }, text: "Great place!", rating: 4 },
                        { user: { first_name: "Robert" }, text: "Amazing location.", rating: 5 }
                    ]
                },
                "2": {
                    id: 2,
                    name: "Cozy Cabin",
                    price_by_night: 55,
                    description: "A beautiful cabin near Vannes harbor",
                    owner: { first_name: "Tom" },
                    amenities: [
                        { name: "Wifi" },
                        { name: "Air Conditioning" }
                    ],
                    reviews: [
                        { user: { first_name: "Alice" }, text: "Very cozy!", rating: 4 }
                    ]
                },
                "3": {
                    id: 3,
                    name: "Modern Apartment",
                    price_by_night: 100,
                    description: "A modern apartment with breathtaking views",
                    owner: { first_name: "David" },
                    amenities: [
                        { name: "Wifi" },
                        { name: "Air Conditioning" },
                        { name: "Home Cinema" },
                        { name: "Jacuzzi" }
                    ],
                    reviews: [
                        { user: { first_name: "Eve" }, text: "Amazing place!", rating: 5 }
                    ]
                }
            };

            currentPlace = fallbackPlaces[placeId] || fallbackPlaces["1"];
            displayPlaceDetails(currentPlace);
            displayReviews(currentPlace.reviews);
            return;
        }

        currentPlace = await response.json();
        displayPlaceDetails(currentPlace);
        displayReviews(currentPlace.reviews || []);

    } catch (err) {
        console.error(err);
    }
}

/* ======================
    DISPLAY PLACE & REVIEWS
====================== */
function createElement(tag, className = '', innerHTML = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
}

function displayPlaceDetails(place) {
    const section = document.getElementById('place-details');
    if (!section) return;
    section.innerHTML = '';

    const title = createElement('h1', '', place.name || 'Unknown Place');

    const card = createElement('div', 'card p-4 border rounded shadow-sm text-center');
    const info = createElement('div', 'place-info');
    info.appendChild(createElement('p', '', `<strong>Host:</strong> ${place.owner?.first_name || 'Unknown'}`));
    info.appendChild(createElement('p', '', `<strong>Price per night:</strong> $${place.price_by_night || place.price || 0}`));
    info.appendChild(createElement('p', '', `<strong>Description:</strong> ${place.description || ''}`));
    info.appendChild(createElement('p', '', `<strong>Amenities:</strong> ${place.amenities?.map(a => a.name).join(', ') || 'None'}`));
    card.appendChild(info);
    section.appendChild(title);
    section.appendChild(card);
}

function displayReviews(reviews) {
    const section = document.getElementById('reviews');
    if (!section) return;

    section.innerHTML = '<h2 class="mb-3">Reviews</h2>';

    if (!reviews || reviews.length === 0) {
        section.innerHTML += '<p>No reviews yet.</p>';
        return;
    }

    reviews.forEach(r => {
        const article = createElement('article', 'review-card p-3 border rounded shadow-sm mb-3');

        // Nom utilisateur
        const user = createElement('p', '');
        user.innerHTML = `<strong>${r.user?.first_name || 'User'}:</strong>`;

        // Texte review
        const text = createElement('p', '', r.text);

        // Rating + étoiles
        const ratingLine = createElement('p', '');
        ratingLine.innerHTML = '<strong>Rating:</strong> ';

        for (let i = 1; i <= 5; i++) {
            const star = createElement('i');

            if (r.rating === 5) {
                // 5 étoiles noires
                star.className = 'bi bi-star-fill text-secondary';
            } else {
                // étoiles grises + blanches
                star.className = i <= r.rating
                    ? 'bi bi-star-fill text-secondary'
                    : 'bi bi-star text-secondary';
            }

            ratingLine.appendChild(star);
        }

        article.appendChild(user);
        article.appendChild(text);
        article.appendChild(ratingLine);

        section.appendChild(article);
    });
}

/* ======================
    ADD REVIEW FORM
====================== */
function setupAddReviewForm() {
    const addReviewSection = document.getElementById('add-review');
    if (!addReviewSection) return;
    if (!isAuthenticated()) {
        addReviewSection.style.display = 'none';
        return;
    }
    addReviewSection.style.display = 'block';

    const reviewForm = document.getElementById('review-form');
    if (!reviewForm) return;

    reviewForm.onsubmit = async (e) => {
        e.preventDefault();
        const reviewText = reviewForm.querySelector('#review-text').value.trim();
        const rating = parseInt(reviewForm.querySelector('#rating').value);

        if (!reviewText || !rating) return alert('Please fill both review and rating');

        try {
            const token = getCookie('token');
            const response = await fetch(`${API_URL}/reviews/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ place_id: currentPlace.id, text: reviewText, rating })
            });

            if (!response.ok) throw new Error('Failed to submit review');
            const newReview = await response.json();

            currentPlace.reviews.push(newReview);
            displayReviews(currentPlace.reviews);
            reviewForm.reset();
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };
}

/* ======================
    DOM READY
====================== */
document.addEventListener('DOMContentLoaded', async () => {
    toggleLoginLink();
    handleLogin();

    if (window.location.pathname.includes('place.html') || window.location.pathname.includes('place_review.html')) {
        await fetchPlaceDetails();
        setupAddReviewForm();
    } else {
        const loaded = await loadPlaces();
        if (!loaded) {
            const fallbackPlaces = [
                { id: 1, name: "Beautiful Beach House", price: 10 },
                { id: 2, name: "Cozy Cabin", price: 55 },
                { id: 3, name: "Modern Apartment", price: 100 }
            ];
            createCards(fallbackPlaces);
        }
        setupPriceFilter();
    }
});


/* ======================
    FORM
====================== */
function setupAddReviewForm() {
    const addReviewSection = document.getElementById('add-review');
    if (!addReviewSection) return;

    // Afficher le formulaire seulement si l'utilisateur est connecté
    if (!isAuthenticated()) {
        addReviewSection.style.display = 'none';
        return;
    }
    addReviewSection.style.display = 'block';

    // Mettre le titre de la place dynamique
    const placeTitle = document.getElementById('place-title');
    if (currentPlace) {
        placeTitle.textContent = `Reviewing: ${currentPlace.name}`;
    }

    // Uniformiser la taille du textarea
    const textareas = document.querySelectorAll('.review-textarea');
    textareas.forEach(t => {
        t.style.width = '100%';
        t.style.minHeight = '120px'; // même longueur pour tous
        t.style.resize = 'vertical'; // laisse redimensionner verticalement
    });

    // Soumission du formulaire
    const reviewForm = document.getElementById('review-form');
    if (!reviewForm) return;

    reviewForm.onsubmit = async (e) => {
        e.preventDefault();
        const reviewText = reviewForm.querySelector('#review-text').value.trim();
        const rating = parseInt(reviewForm.querySelector('#rating').value);

        if (!reviewText || !rating) return alert('Please fill both review and rating');

        try {
            const token = getCookie('token');
            const response = await fetch(`${API_URL}/reviews/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ place_id: currentPlace.id, text: reviewText, rating })
            });

            if (!response.ok) throw new Error('Failed to submit review');
            const newReview = await response.json();

            currentPlace.reviews.push(newReview);
            displayReviews(currentPlace.reviews);
            reviewForm.reset();
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };
}
