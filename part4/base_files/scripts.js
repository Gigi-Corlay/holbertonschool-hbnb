const API_URL = 'http://127.0.0.1:5000/api/v1';

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

function toggleLoginLink() {
    const loginLink = document.querySelector('.login-button');
    if (!loginLink) return;
    loginLink.style.display = isAuthenticated() ? 'none' : 'block';
}

/* ======================
    CREATE CARDS
====================== */
function createCards(places) {
    const container = document.getElementById('places-list');
    if (!container) return;
    container.innerHTML = '';

    // Tri des places par prix croissant
    places.sort((a, b) => (a.price_by_night || a.price || 0) - (b.price_by_night || b.price || 0));

    places.forEach(place => {
        const price = Number(place.price_by_night || place.price || 0);

        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3';

        col.innerHTML = `
    <article class="place-card card p-3 d-flex flex-column w-100" data-price="${price}">
        <h2>${place.name}</h2>
        <p>Price per night: $${price}</p>
        <a href="place_review.html?id=${place.id}" class="btn btn-rose mt-auto">View Details</a>    
    </article>
    `;

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
            const price = parseFloat(card.dataset.price);
            const col = card.parentElement;

            if (selected === "") {
                // All
                col.style.display = "";
            } else if (selected === "10") {
                // 1 à 49
                col.style.display = price <= 49 ? "" : "none";
            } else if (selected === "50") {
                // 50 à 99
                col.style.display = price >= 50 && price <= 99 ? "" : "none";
            } else if (selected === "100") {
                // 100 et plus
                col.style.display = price >= 100 ? "" : "none";
            }
        });
    });

    // Appliquer le filtre au chargement pour que "All" soit sélectionné par défaut
    const event = new Event('change');
    priceFilter.dispatchEvent(event);
}

/* ======================
    LOAD PLACES FROM API
====================== */
async function loadPlaces() {
    try {
        const response = await fetch(`${API_URL}/places/`);
        if (!response.ok) throw new Error(`Impossible de charger les places (status ${response.status})`);

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
            console.log("Tentative login", { email, password });

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            console.log("Réponse login", response.status);

            const data = await response.json();
            console.log("Data login", data);

            if (response.ok) {
                // Stocke le JWT dans un cookie
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
    DOM LOADED
====================== */
document.addEventListener('DOMContentLoaded', async () => {
    toggleLoginLink();
    handleLogin();

    const apiLoaded = await loadPlaces();

    if (!apiLoaded) {
        // fallback si l'API est indisponible
        const fixedPlaces = [
            { id: 1, name: "Beautiful Beach House", price: 10 },
            { id: 3, name: "Modern Apartment", price: 50 },
            { id: 4, name: "Luxury Villa", price: 100 }
        ];
        createCards(fixedPlaces);
    }

    setupPriceFilter();
});
