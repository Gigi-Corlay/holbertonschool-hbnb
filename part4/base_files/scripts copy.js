const API_URL = 'http://127.0.0.1:5000/api/v1';
let currentPlace = null;



/* ======================
    COOKIE & AUTH
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

function toggleLoginLink() {
    const loginLink = document.querySelector('.login-button');
    if (!loginLink) return;

    if (isAuthenticated()) {
        loginLink.textContent = 'Déconnexion';
        loginLink.href = '#';
        loginLink.onclick = () => {
            // Supprimer le token
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            toggleLoginLink(); // mise à jour du texte
            alert("Vous êtes déconnecté !");
            window.location.href = 'index.html';
        };
    } else {
        loginLink.textContent = 'Connexion';
        loginLink.href = 'login.html';
        loginLink.onclick = null; // retirer l'ancien click handler
    }
}

function handleLogin() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const email = form.email.value.trim();
        const password = form.password.value;
        if (!email || !password) return alert("Fill both fields");

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                document.cookie = `token=${data.access_token}; path=/`;
                toggleLoginLink();
                window.location.href = 'index.html';
            } else {
                alert(data.message || "Login failed");
            }
        } catch (err) {
            console.error(err);
            alert("Error during login");
        }
    });
}

/* ======================
    CREATE ELEMENT UTILS
====================== */
function createElement(tag, className = '', innerHTML = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
}

/* ======================
    CREATE PLACE CARDS
====================== */
function createCards(places) {
    const container = document.getElementById('places-list');
    if (!container) return;

    container.innerHTML = '';

    places.forEach((place, i) => {
        const price = Number(place.price_by_night || place.price || 0); // prix correct

        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3';

        const article = document.createElement('article');
        article.className = 'place-card card p-3 d-flex flex-column w-100';
        article.dataset.price = price;

        // IMAGE
        const img = document.createElement('img');
        img.className = 'card-img-top mb-3';
        img.style.height = '200px';
        img.style.objectFit = 'cover';
        switch (i) {
            case 0: img.src = 'images/card_pool.jpg'; break;
            case 1: img.src = 'images/card_boad.jpg'; break;
            case 2: img.src = 'images/card_apartement.jpg'; break;
            default: img.src = 'images/default.jpg';
        }

        // TITLE
        const title = document.createElement('h2');
        title.textContent = place.name;

        // PRICE
        const priceText = document.createElement('p');
        priceText.textContent = `Price per night: $${price}`;

        // BUTTON
        const link = document.createElement('a');
        link.href = `place.html?id=${place.id}`;
        link.className = 'btn btn-rose mt-auto';
        link.textContent = 'View Details';

        article.append(img, title, priceText, link);
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

            if (!selected || selected === "all") col.style.display = '';
            else if (selected === "10" && price < 50) col.style.display = '';
            else if (selected === "50" && price >= 50 && price < 100) col.style.display = '';
            else if (selected === "100" && price >= 100) col.style.display = '';
            else col.style.display = 'none';
        });
    });
}

/* ======================
    DISPLAY PLACE DETAILS
====================== */
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

    const amenities = Array.isArray(place.amenities) && place.amenities.length
                    ? place.amenities
                    : [{ name: "Wifi" }];
    info.appendChild(createElement('p', '', `<strong>Amenities:</strong> ${amenities.map(a => a.name).join(', ')}`));

    card.appendChild(info);
    section.appendChild(title);
    section.appendChild(card);
}

/* ======================
    DISPLAY REVIEWS
====================== */
function displayReviews(reviews) {
    const section = document.getElementById('reviews');
    if (!section) return;

    section.innerHTML = '<h2 class="mb-3">Reviews</h2>';

    if (!reviews || reviews.length === 0) {
        section.innerHTML += '<p>No reviews yet.</p>';
        return;
    }

    reviews.forEach(r => {
        const article = createElement('article', 'review-card p-3 border rounded shadow-sm mb-3 text-start');
        article.innerHTML = `
            <p><strong>${r.user?.first_name || 'User'}:</strong></p>
            <p>${r.text}</p>
            <p><strong>Rating:</strong> ${[1,2,3,4,5].map(i =>
                `<i class="${i <= r.rating ? 'bi bi-star-fill text-secondary' : 'bi bi-star text-secondary'}"></i>`).join('')}
            </p>
        `;
        section.appendChild(article);
    });
}

/* ======================
    FETCH PLACE DETAILS
====================== */
function getPlaceIdFromURL() {
    return new URLSearchParams(window.location.search).get('id');
}

async function fetchPlaceDetails() {
    const placeId = getPlaceIdFromURL();
    if (!placeId) return;

    const headers = {};
    const token = getCookie('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(`${API_URL}/places/${placeId}`, { headers });
        const data = await res.json();
        console.log("Data from API:", data);

        // fallback si API échoue
        currentPlace = (!res.ok || !data || !data.name)
            ? (fallbackPlaces?.[placeId] || {
                id: placeId,
                name: 'Unknown Place',
                owner: { first_name: 'Unknown' },
                price_by_night: 0,
                description: 'No description available',
                amenities: [{ name: "Wifi" }],
                reviews: []
            })
            : data;

        currentPlace.reviews = currentPlace.reviews || [];
        currentPlace.amenities = currentPlace.amenities?.length ? currentPlace.amenities : [{ name: "Wifi" }];
    } catch (err) {
        console.error("Fetch failed, using fallback", err);
        currentPlace = fallbackPlaces?.[placeId] || {
            id: placeId,
            name: 'Unknown Place',
            owner: { first_name: 'Unknown' },
            price_by_night: 0,
            description: 'No description available',
            amenities: [{ name: "Wifi" }],
            reviews: []
        };
    }

    displayPlaceDetails(currentPlace);
    displayReviews(currentPlace.reviews || []);
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
    ADD REVIEWS
====================== */
function checkAuthenticationRedirect() {
    const token = getCookie('token');
    if (!token) {
        window.location.href = 'index.html';
    }
    return token;
}


/* ======================
    INIT PAGE
====================== */
document.addEventListener('DOMContentLoaded', async () => {
    toggleLoginLink();   // toujours mettre à jour le bouton
    handleLogin();       // gère le formulaire login

    const path = window.location.pathname;

    if (path.includes('index.html') || path === '/') {
        const loaded = await loadPlaces();
        if (!loaded) {
            const fallbackPlaces = [
                { id: 1, name: "Beautiful Beach House" },
                { id: 2, name: "Cozy Cabin" },
                { id: 3, name: "Modern Apartment" }
            ];
            createCards(fallbackPlaces);
        }
        setupPriceFilter();
    }

    if (path.includes('add_review.html')) {
        checkAuthenticationRedirect();
    }
});
