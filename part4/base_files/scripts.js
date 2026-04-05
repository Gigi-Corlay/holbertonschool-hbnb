// ======================
// config
// ======================
const API_URL = 'http://127.0.0.1:5000/api/v1';

const fallbackPlaces = [
    { id: 1, name: "Beautiful Beach House", price_by_night: 55 },
    { id: 2, name: "Cozy Cabin", price_by_night: 100 },
    { id: 3, name: "Modern Apartment", price_by_night: 200 }
];

// ======================
// Cookies & Auth
// ======================
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

function checkAuthentication() {
    const token = getCookie('token');
    if (!token) window.location.href = 'index.html';
    return token;
}

function toggleLoginLink() {
    const loginLink = document.querySelector('.login-button');
    if (!loginLink) return;

    if (isAuthenticated()) {
        loginLink.textContent = 'Logout';
        loginLink.href = '#';
        loginLink.onclick = () => {
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            toggleLoginLink();
            alert("You are disconnected!");
            window.location.reload();
        };
    } else {
        loginLink.textContent = 'Login';
        loginLink.href = 'login.html';
        loginLink.onclick = null;
    }
}

// ======================
// Login Form
// ======================
function handleLogin() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                document.cookie = `token=${data.access_token}; path=/`;
                window.location.href = 'index.html';
            } else {
                alert("Login failed: " + (data.message || res.statusText));
            }

        } catch (err) {
            console.error(err);
            alert("Server error");
        }
    });
}

// ======================
// Reviews
// ======================
function createReviewHTML(name, text, rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        starsHTML += `<i class="bi ${i <= rating ? 'bi-star-fill text-dark' : 'bi-star text-secondary'}"></i>`;
    }

    return `
    <article class="review-card py-3 border-bottom border-secondary-subtle">
        <div class="d-flex align-items-start">
            <img src="images/default-avatar.png" class="review-avatar me-3 rounded-circle">
            <div class="flex-grow-1">
                <h6 class="mb-1 fw-bold">${name}</h6>
                <div class="mb-2">${starsHTML}</div>
                <small class="text-muted d-block mb-1">Just now · Stayed recently</small>
                <p class="mb-0">${text}</p>
            </div>
        </div>
    </article>
    `;
}

// ======================
// Create Place Cards
// ======================
function createCards(places) {
    const container = document.getElementById('places-list');
    if (!container) return;

    container.innerHTML = '';

    places.forEach((place, i) => {
        const price = Number(place.price_by_night ?? place.price ?? fallbackPlaces[i]?.price_by_night ?? 0);
        const name = place.name ?? place.title ?? "Unknown Place";

        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3';

        const article = document.createElement('article');
        article.className = 'place-card card p-3 d-flex flex-column w-100';
        article.dataset.price = price;

        const img = document.createElement('img');
        img.className = 'card-img-top mb-3';
        img.style.height = '200px';
        img.style.objectFit = 'cover';
        img.src = ['images/card_pool.jpg', 'images/card_boad.jpg', 'images/card_apartement.jpg'][i] || 'images/default.jpg';

        const title = document.createElement('h2');
        title.textContent = name;

        const priceText = document.createElement('p');
        priceText.textContent = `Price per night: $${price}`;

        const link = document.createElement('a');
        link.href = `place.html?id=${place.uuid || place.id}`;
        link.className = 'details-button btn btn-rose';
        link.textContent = 'View Details';

        const btnWrapper = document.createElement('div');
        btnWrapper.className = 'mt-auto d-flex justify-content-center';
        btnWrapper.appendChild(link);

        article.append(img, title, priceText, btnWrapper);
        col.appendChild(article);
        container.appendChild(col);
    });
}

// ======================
// Price Filter
// ======================
function setupPriceFilter() {
    const priceFilter = document.getElementById('price-filter');
    if (!priceFilter) return;

    priceFilter.addEventListener('change', function () {
        const selected = this.value;
        const cards = document.querySelectorAll('.place-card');

        cards.forEach(card => {
            const price = Number(card.dataset.price);
            const col = card.closest('.col-md-4');

            switch (selected) {
                case "0-50":
                    col.style.display = price < 50 ? '' : 'none';
                    break;
                case "50-100":
                    col.style.display = price >= 50 && price < 100 ? '' : 'none';
                    break;
                case "100+":
                    col.style.display = price >= 100 ? '' : 'none';
                    break;
                default:
                    col.style.display = '';
                    break;
            }
        });
    });
}

// ======================
// Review Forms
// ======================
const reviewForms = document.querySelectorAll('form[id^="review-form"], form[id^="add-review-form"]');

reviewForms.forEach(form => {
    form.addEventListener('submit', e => {
        e.preventDefault();

        const formId = form.id;
        const index = formId.match(/\d+$/)[0];
        const textarea = document.getElementById(`review-text${index}`);
        const rating = document.getElementById(`rating${index}`) || document.getElementById(`rating-${index}`);

        if (!textarea || !rating) return;

        const text = textarea.value.trim();
        const rateValue = parseInt(rating.value);

        if (!text || rateValue <= 0) {
            alert('Please enter a review and select a rating.');
            return;
        }

        const reviewSection = document.getElementById(`add-review-${index}`);
        if (reviewSection) {
            reviewSection.insertAdjacentHTML('afterbegin', createReviewHTML('You', text, rateValue));
        }

        form.reset();
    });
});

// ======================
// Load Places
// ======================
async function loadPlaces() {
    try {
        const token = getCookie('token');
        const res = await fetch(`${API_URL}/places`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        const text = await res.text();
        let places;
        try {
            places = JSON.parse(text);
        } catch (e) {
            console.error("Invalid JSON:", text);
            places = fallbackPlaces;
        }

        createCards(places);

    } catch (err) {
        console.error("Failed to load places:", err);
        createCards(fallbackPlaces);
    }
}

// ======================
// Initialize Page
// ======================
document.addEventListener('DOMContentLoaded', () => {
    toggleLoginLink();
    handleLogin();
    setupPriceFilter();
    loadPlaces();
});
