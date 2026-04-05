const API_URL = 'http://127.0.0.1:5000/api/v1';
let currentPlace = null;

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
    return parseInt(new URLSearchParams(window.location.search).get('id'));
}

/* ======================
    AMENITY ICONS
====================== */
const AMENITY_ICONS = {
    wifi: `<img src="images/icon_wifi.png" width="18">`,
    bedroom: `<img src="images/icon_bed.png" width="18">`,
    bath: `<img src="images/icon_bath.png" width="18">`,
    bathroom: `<img src="images/icon_bath.png" width="18">`,
    pool: `<i class="bi bi-water"></i>`
};

function getAmenityIcon(name) {
    return AMENITY_ICONS[name.toLowerCase()] || '';
}

/* ======================
    FALLBACK DATA
====================== */
const fallbackPlaces = [
    { id: 1, name: "Beautiful Beach House", images: ["images/house-1.webp","images/house-2.jpg","images/house-3.webp"], price_by_night: 55, description: "A beautiful beach house with amazing views", owner: { first_name: "John" }, amenities: [{ name: "Wifi" }, { name: "Pool" }] },
    { id: 2, name: "Cozy Cabin", images: ["images/baot_1.webp","images/baot_2.jpg","images/baot_3.webp"], price_by_night: 100, description: "A cozy cabin", owner: { first_name: "Tom" }, amenities: [{ name: "Wifi" }, { name: "Bedroom" }] },
    { id: 3, name: "Modern Apartment", images: ["images/apartement-1.webp","images/apartement-2.webp","images/apartement-3.jpg"], price_by_night: 200, description: "Modern apartment", owner: { first_name: "David" }, amenities: [{ name: "Wifi" }, { name: "Bathroom" }] }
];
const fallbackPlacesById = Object.fromEntries(fallbackPlaces.map(p => [p.id, p]));

/* ======================
    DISPLAY PLACE DETAILS
====================== */
function displayPlaceDetails(place) {
    const section = document.getElementById('place-details');
    if (!section) return;

    section.innerHTML = '';

    // Title
    section.appendChild(createElement('h1', 'text-center mb-4 mt-3', place.name));

    // Carousel
    const carouselId = `carousel-${place.id}`;
    const carousel = createElement('div', 'carousel slide mb-4');
    carousel.id = carouselId;
    const carouselInner = createElement('div', 'carousel-inner');

    (place.images || []).forEach((src, i) => {
        const item = createElement('div', `carousel-item ${i === 0 ? 'active' : ''}`);
        const img = createElement('img', 'd-block w-100');
        img.src = src;
        img.style.height = '400px';
        img.style.objectFit = 'cover';
        item.appendChild(img);
        carouselInner.appendChild(item);
    });

    carousel.appendChild(carouselInner);
    // Controls
    ['prev', 'next'].forEach(dir => {
        const btn = createElement('button', `carousel-control-${dir}`);
        btn.type = 'button';
        btn.setAttribute('data-bs-target', `#${carouselId}`);
        btn.setAttribute('data-bs-slide', dir);
        btn.innerHTML = `<span class="carousel-control-${dir}-icon"></span>`;
        carousel.appendChild(btn);
    });

    new bootstrap.Carousel(carousel, { interval: false });

    // Info card
    const info = createElement('div', 'place-info text-block text-center mb-4');
    info.innerHTML = `
        <p><strong>Host:</strong> ${place.owner?.first_name || 'Unknown'}</p>
        <p><strong>Price per night:</strong> $${place.price_by_night}</p>
        <p><strong>Description:</strong> ${place.description}</p>
        <p><strong>Amenities:</strong></p>
        <div class="amenities">${(place.amenities || []).map(a => `<span class="amenity-badge">${getAmenityIcon(a.name)} ${a.name}</span>`).join('')}</div>
    `;
    section.appendChild(carousel);
    section.appendChild(info);
}

/* ======================
    REVIEWS
====================== */
function loadReviews(placeId) {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    fetch(`place_review_${placeId}.html`)
        .then(res => res.ok ? res.text() : Promise.reject('No reviews'))
        .then(html => container.innerHTML = html)
        .catch(() => container.innerHTML = '<p>No reviews found.</p>');
}

function createReviewHTML(name, text, rating) {
    const stars = Array.from({length: 5}, (_, i) => `<i class="bi ${i < rating ? 'bi-star-fill text-dark' : 'bi-star text-secondary'}"></i>`).join('');
    return `
    <article class="review-card py-3 border-bottom border-secondary-subtle">
        <div class="d-flex align-items-start">
            <img src="images/default-avatar.png" class="review-avatar me-3 rounded-circle">
            <div class="flex-grow-1">
                <h6 class="mb-1 fw-bold">${name}</h6>
                <div class="mb-2">${stars}</div>
                <small class="text-muted d-block mb-1">Just now · Stayed recently</small>
                <p class="mb-0">${text}</p>
            </div>
        </div>
    </article>
    `;
}

/* ======================
    ADD REVIEW FORM
====================== */
function injectReviewForm(place) {
    const container = document.getElementById('add-review-container');
    if (!container) return;

    container.innerHTML = `
        <section id="add-review-${place.id}" class="mb-5">
            <h3 class="mb-3">Add a Review</h3>
            <form id="add-review-form" class="d-flex flex-column gap-3 border rounded p-4">
                <textarea id="review-text" class="form-control" rows="4" placeholder="Write your review"></textarea>
                <select id="rating" class="form-select w-auto">
                    <option value="">Select rating</option>
                    ${[1,2,3,4,5].map(n => `<option value="${n}">${n} Star${n>1?'s':''}</option>`).join('')}
                </select>
                <button type="submit" class="btn btn-rose mx-auto px-3 py-2">Submit Review</button>
            </form>
        </section>
    `;

    document.getElementById('add-review-form').addEventListener('submit', async e => {
        e.preventDefault();
        const text = document.getElementById('review-text').value.trim();
        const rating = parseInt(document.getElementById('rating').value);

        if (!text || !rating) return alert('Please enter review text and rating');

        // Optionnel : envoyer au backend
        try {
            const token = document.cookie.split('; ').find(c => c.startsWith('token='))?.split('=')[1];
            if (token) {
                await fetch(`${API_URL}/places/${place.id}/reviews`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ text, rating })
                });
            }
        } catch (err) {
            console.error('Failed to submit review:', err);
        }

        // Ajout côté client
        const reviewsContainer = document.getElementById('reviews-container');
        reviewsContainer.insertAdjacentHTML('beforeend', createReviewHTML('You', text, rating));
        e.target.reset();
    });
}

/* ======================
    INIT
====================== */
document.addEventListener('DOMContentLoaded', () => {
    const placeId = getPlaceIdFromURL();
    currentPlace = fallbackPlacesById[placeId] || fallbackPlaces[0];

    displayPlaceDetails(currentPlace);
    loadReviews(currentPlace.id);
    injectReviewForm(currentPlace);
});
