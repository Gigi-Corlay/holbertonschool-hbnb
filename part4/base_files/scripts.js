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

    places.forEach(place => {
        const col = document.createElement('div');
        col.className = 'col-md-4 d-flex mb-3';

        col.innerHTML = `
        <article class="place-card card p-3 w-100 d-flex flex-column" data-price="${place.price}">
            <div class="card-body flex-grow-1">
                <h2>${place.name}</h2>
                <p>Price per night: $${place.price}</p>
            </div>
            <a href="place_review.html?id=${place.id}" class="btn btn-rose mt-3">View Details</a>
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
        const selectedPrice = this.value ? parseInt(this.value) : null;

        document.querySelectorAll('.place-card').forEach(card => {
            const price = parseInt(card.getAttribute('data-price'));
            const col = card.parentElement;

            if (!selectedPrice || price <= selectedPrice) {
                col.classList.remove('d-none');
            } else {
                col.classList.add('d-none');
            }
        });
    });
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
        setupPriceFilter();
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
            // === AJOUT DES LOGS ===
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
        // Création de cartes fixes si l'API ne répond pas
        const fixedPlaces = [
            { id: 1, name: "Beautiful Beach House", price: 150 },
            { id: 2, name: "Cozy Cabin", price: 100 },
            { id: 3, name: "Modern Apartment", price: 200 }
        ];
        createCards(fixedPlaces);
        setupPriceFilter();
    }
});
