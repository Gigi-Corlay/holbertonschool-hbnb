const API_URL = 'http://127.0.0.1:5000/api/v1';

const fallbackPlaces = [
    { id: 1, name: "Beautiful Beach House", price_by_night: 55 },
    { id: 2, name: "Cozy Cabin", price_by_night: 100 },
    { id: 3, name: "Modern Apartment", price_by_night: 200 }
];

/* ===== COOKIE & AUTH ===== */
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
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            toggleLoginLink();
            alert("Vous êtes déconnecté !");
            window.location.href = 'index.html';
        };
    } else {
        loginLink.textContent = 'Connexion';
        loginLink.href = 'login.html';
        loginLink.onclick = null;
    }
}

function handleLogin() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const email = form.email.value.trim();
        const password = form.password.value;

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

/* ===== PLACE CARDS ===== */
function createCards(places) {
    const container = document.getElementById('places-list');
    if (!container) return;

    container.innerHTML = '';

    places.forEach((place, i) => {
        let fallback = fallbackPlaces.find(f => f.name === place.title);
        const price = place.price_by_night !== undefined
            ? Number(place.price_by_night)
            : place.price !== undefined
                ? Number(place.price)
                : fallback
                    ? fallback.price_by_night
                    : 0;

        const name = place.name || place.title || "Unknown Place";

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
        title.textContent = name;

        // PRICE
        const priceText = document.createElement('p');
        priceText.textContent = `Price per night: $${price}`;

        // BUTTON
        const link = document.createElement('a');
        link.href = `place.html?id=${place.uuid || place.id}`;
        link.className = 'btn btn-rose mt-auto';
        link.textContent = 'View Details';

        // Append elements
        article.append(img, title, priceText, link);
        col.appendChild(article);
        container.appendChild(col);
    });
}

/* ===== PRICE FILTER ===== */
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

/* ===== LOAD PLACES ===== */
async function loadPlaces() {
    try {
        const res = await fetch("http://localhost:5000/api/v1/places");
        const places = await res.json();
        createCards(places);
    } catch (err) {
        console.error("Failed to load places:", err);
        // Optionnel : fallback vers les données locales
        createCards(fallbackPlaces);
    }
}

// Appelle la fonction au chargement
loadPlaces();
/* ===== INIT PAGE ===== */
document.addEventListener('DOMContentLoaded', () => {
    toggleLoginLink();
    handleLogin();

    if (document.getElementById('places-list')) {
        loadPlaces();
        setupPriceFilter();
    }
});
