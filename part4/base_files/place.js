const API_URL = 'http://127.0.0.1:5000/api/v1';
let currentPlace = null;

/* ======================
    COOKIE & AUTH
====================== */
function getCookie(name) {
    return document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        return key === name ? value : acc;
    }, null);
}

function isAuthenticated() {
    return !!getCookie('token');
}

function toggleLoginLink() {
    const loginLink = document.querySelector('.login-button');
    if (!loginLink) return;

    if (isAuthenticated()) {
        loginLink.textContent = 'Logout';
        loginLink.href = '#';
        loginLink.onclick = () => {
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = 'index.html';
        };
    } else {
        loginLink.textContent = 'Login';
        loginLink.href = 'login.html';
        loginLink.onclick = null;
    }
}

/* ======================
    FALLBACK DATA
====================== */
const fallbackPlaces = [
    {
        id: 1,
        uuid: "7b4f5cc3-4bd8-4b6b-b721-c2306cd0ce01",
        name: "Beautiful Beach House",
        images: ["images/house-1.webp","images/house-2.jpg","images/house-3.webp"],
        price_by_night: 55,
        description: "A beautiful beach house with amazing views",
        owner: { first_name: "John" },
        amenities: [{ name: "Wifi" }, { name: "Pool" }],
    },
    {
        id: 2,
        uuid: "e6dcb145-ce39-4dc4-8331-43f3fd401845",
        name: "Cozy Cabin",
        images: ["images/baot_1.webp","images/baot_2.jpg","images/baot_3.webp"],
        price_by_night: 100,
        description: "A cozy cabin",
        owner: { first_name: "Tom" },
        amenities: [{ name: "Wifi" }],
    },
    {
        id: 3,
        uuid: "9160d2f0-bd44-4b00-8eca-564337bbd031",
        name: "Modern Apartment",
        images: ["images/apartement-1.webp","images/apartement-2.webp","images/apartement-3.jpg"],
        price_by_night: 200,
        description: "Modern apartment",
        owner: { first_name: "David" },
        amenities: [{ name: "Wifi" }],
    }
];

const fallbackPlacesByUUID = {};
fallbackPlaces.forEach(p => fallbackPlacesByUUID[p.uuid] = p);

/* ======================
    UTILS
====================== */
function createElement(tag, className = '', innerHTML = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

/* ======================
    DISPLAY PLACE DETAILS
====================== */
function displayPlaceDetails(place) {
    const section = document.getElementById('place-details');
    if (!section) return;
    section.innerHTML = '';

    const title = createElement('h1', 'text-center mb-4', place.name);

    const carouselId = `carousel-${place.id}`;
    const carousel = createElement('div', 'carousel slide mb-4');
    carousel.id = carouselId;
    carousel.setAttribute('data-bs-ride', 'carousel');

    const carouselInner = createElement('div', 'carousel-inner');
    (place.images || []).forEach((imgSrc, index) => {
        const item = createElement('div', `carousel-item ${index === 0 ? 'active' : ''}`);
        const img = createElement('img', 'd-block w-100');
        img.src = imgSrc;
        img.style.height = '400px';
        img.style.objectFit = 'cover';
        item.appendChild(img);
        carouselInner.appendChild(item);
    });
    carousel.appendChild(carouselInner);

    const prevBtn = createElement('button', 'carousel-control-prev');
    prevBtn.type = 'button';
    prevBtn.setAttribute('data-bs-target', `#${carouselId}`);
    prevBtn.setAttribute('data-bs-slide', 'prev');
    prevBtn.innerHTML = `<span class="carousel-control-prev-icon"></span>`;

    const nextBtn = createElement('button', 'carousel-control-next');
    nextBtn.type = 'button';
    nextBtn.setAttribute('data-bs-target', `#${carouselId}`);
    nextBtn.setAttribute('data-bs-slide', 'next');
    nextBtn.innerHTML = `<span class="carousel-control-next-icon"></span>`;

    carousel.append(prevBtn, nextBtn);

    const card = createElement('div', 'text-block text-center');
    const info = createElement('div');
    info.innerHTML = `
        <p><strong>Host:</strong> ${place.owner?.first_name || 'Unknown'}</p>
        <p><strong>Price per night:</strong> $${place.price_by_night}</p>
        <p><strong>Description:</strong> ${place.description}</p>
        <p><strong>Amenities:</strong> ${place.amenities.map(a => a.name).join(', ')}</p>
    `;
    card.appendChild(info);

    section.append(title, carousel, card);
}

/* ======================
    LOAD PLACE
====================== */
function loadPlace() {
    const placeId = getPlaceIdFromURL();

    currentPlace = placeId
        ? (fallbackPlacesByUUID[placeId] || fallbackPlaces.find(p => String(p.id) === placeId))
        : fallbackPlaces[0];

    displayPlaceDetails(currentPlace);
}

/* ======================
    LOAD STATIC REVIEWS
====================== */
function loadStaticReviews() {
    const place = currentPlace || fallbackPlaces[0];
    const placeId = place.id; // utilise l'ID numérique
    const fileName = `place_review_${placeId}.html`;

    fetch(fileName)
        .then(response => {
            if (!response.ok) throw new Error('Review file not found');
            return response.text();
        })
        .then(html => {
            const container = document.getElementById('reviews-container');
            if (container) container.innerHTML = html;

            const reviews = container.querySelectorAll('.review-card');
            console.log(`Number of reviews for place ${placeId}:`, reviews.length);
        })
        .catch(err => {
            console.error('Error loading reviews:', err);
            document.getElementById('reviews-container').innerHTML = '<p>No reviews found.</p>';
        });
}

/* ======================
    INIT
====================== */
document.addEventListener('DOMContentLoaded', () => {
    toggleLoginLink();
    loadPlace();
    loadStaticReviews();
});